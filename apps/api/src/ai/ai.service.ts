import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import { ReportStatus as PrismaReportStatus } from '@prisma/client';
import { ChatResponse } from '@sisenco/shared-types';
import { getCurrentWeekStart } from '../dashboard/utils/current-week.util';
import { PrismaService } from '../common/prisma/prisma.service';
import { GEMINI_MODEL } from './ai.constants';

const SUBMITTED_OR_LATE = [PrismaReportStatus.SUBMITTED, PrismaReportStatus.LATE];

/**
 * Chat assistant over the team's roster, projects, and report data (bonus
 * module, ARCHITECTURE.md §6). Privacy note: team member names/roles,
 * project names/status, and report content (tasks, blockers, hours) are
 * sent to Google's Gemini API as context on every chat request — never
 * credentials, emails, or raw database IDs. See SECURITY_GUIDELINES.md.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: GoogleGenAI | null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    this.client = apiKey ? new GoogleGenAI({ apiKey }) : null;
  }

  async chat(message: string): Promise<ChatResponse> {
    if (!this.client) {
      throw new ServiceUnavailableException(
        'The AI chat assistant is not configured (missing GEMINI_API_KEY)',
      );
    }

    const [roster, projects, reportContext] = await Promise.all([
      this.buildRosterContext(),
      this.buildProjectContext(),
      this.buildReportContext(),
    ]);
    const context = [roster, projects, reportContext].join('\n\n');

    try {
      const response = await this.client.models.generateContent({
        model: GEMINI_MODEL,
        contents: message,
        config: { systemInstruction: this.buildSystemInstruction(context) },
      });
      return { reply: response.text ?? "I couldn't generate a response — try rephrasing that." };
    } catch (error) {
      // Logged here (not just the exception filter's generic log) because
      // the exception filter only sees the sanitized BadGatewayException
      // thrown below, not the Gemini API's actual error — which is where
      // the useful diagnostic (bad model name, quota, auth) actually is.
      this.logger.error('Gemini generateContent call failed', error);
      throw new BadGatewayException('The AI assistant could not be reached — try again shortly.');
    }
  }

  /** Every user's name and role — lets the assistant answer "who is a manager" style questions. */
  private async buildRosterContext(): Promise<string> {
    const users = await this.prisma.user.findMany({
      include: { role: true },
      orderBy: [{ role: { name: 'asc' } }, { firstName: 'asc' }],
    });

    const lines = users.map((user) => `- ${user.firstName} ${user.lastName} — ${user.role.name}`);
    return `Team roster (${users.length} members):\n${lines.join('\n')}`;
  }

  /** Every project's name and active/archived status. */
  private async buildProjectContext(): Promise<string> {
    const projects = await this.prisma.project.findMany({ orderBy: { name: 'asc' } });

    const lines = projects.map(
      (project) => `- ${project.name} (${project.isActive ? 'active' : 'archived'})`,
    );
    return `Projects:\n${lines.join('\n')}`;
  }

  /** Submitted/late reports for the current week, falling back to the most recent week with any. */
  private async buildReportContext(): Promise<string> {
    const currentWeekStart = getCurrentWeekStart(new Date());

    let reports = await this.prisma.report.findMany({
      where: { weekStartDate: currentWeekStart, status: { in: SUBMITTED_OR_LATE } },
      include: { user: true, project: true },
    });
    let weekLabel = 'the current week';

    if (reports.length === 0) {
      const mostRecent = await this.prisma.report.findFirst({
        where: { status: { in: SUBMITTED_OR_LATE } },
        orderBy: { weekStartDate: 'desc' },
      });
      if (mostRecent) {
        reports = await this.prisma.report.findMany({
          where: { weekStartDate: mostRecent.weekStartDate, status: { in: SUBMITTED_OR_LATE } },
          include: { user: true, project: true },
        });
        weekLabel = `the week of ${mostRecent.weekStartDate.toISOString().slice(0, 10)}`;
      }
    }

    if (reports.length === 0) {
      return 'No submitted reports are available yet.';
    }

    const lines = reports.map((report) => {
      const hours = report.hoursWorked
        ? `${report.hoursWorked.toString()}h logged`
        : 'hours not logged';
      return (
        `- ${report.user.firstName} ${report.user.lastName} (${report.project.name}, ${hours}, ` +
        `status: ${report.status}):\n` +
        `  Completed: ${report.tasksCompleted}\n` +
        `  Planned: ${report.tasksPlanned}\n` +
        `  Blockers: ${report.blockers}`
      );
    });

    return `Team reports for ${weekLabel}:\n\n${lines.join('\n\n')}`;
  }

  private buildSystemInstruction(context: string): string {
    return [
      'You are an assistant for a manager using a weekly team-report dashboard.',
      'You can answer questions about the team roster (names, roles), the list of',
      'projects (active/archived), and submitted weekly reports (tasks, blockers,',
      'hours, status). Answer using only the context provided below — do not invent',
      'information about team members, projects, or reports that are not present.',
      'If the context does not contain enough information to answer, say so plainly.',
      '',
      context,
    ].join('\n');
  }
}
