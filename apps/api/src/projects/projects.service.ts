import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Project, ProjectMember } from '@sisenco/shared-types';
import { toProjectDto, toProjectMemberDto } from '../common/mappers';
import { PrismaService } from '../common/prisma/prisma.service';
import { AssignMemberDto } from './dto/assign-member.dto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllActive(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return projects.map(toProjectDto);
  }

  async create(dto: CreateProjectDto): Promise<Project> {
    await this.assertNameAvailable(dto.name);
    const project = await this.prisma.project.create({ data: dto });
    return toProjectDto(project);
  }

  async update(id: string, dto: UpdateProjectDto): Promise<Project> {
    await this.findByIdOrThrow(id);
    if (dto.name !== undefined) {
      await this.assertNameAvailable(dto.name, id);
    }

    const project = await this.prisma.project.update({ where: { id }, data: dto });
    return toProjectDto(project);
  }

  /** Soft-delete only (DATABASE.md §3) — preserves report history via `is_active = false`. */
  async softDelete(id: string): Promise<Project> {
    await this.findByIdOrThrow(id);
    const project = await this.prisma.project.update({
      where: { id },
      data: { isActive: false },
    });
    return toProjectDto(project);
  }

  async findMembers(projectId: string): Promise<ProjectMember[]> {
    await this.findByIdOrThrow(projectId);
    const members = await this.prisma.userProject.findMany({
      where: { projectId },
      include: { user: true },
      orderBy: { assignedAt: 'asc' },
    });
    return members.map(toProjectMemberDto);
  }

  /** Optional feature (ARCHITECTURE.md §3) — restricts which projects a member can report on. */
  async assignMember(projectId: string, dto: AssignMemberDto): Promise<ProjectMember> {
    await this.findByIdOrThrow(projectId);

    const user = await this.prisma.user.findUnique({ where: { id: dto.userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const existing = await this.prisma.userProject.findUnique({
      where: { userId_projectId: { userId: dto.userId, projectId } },
    });
    if (existing) {
      throw new ConflictException('This user is already assigned to this project');
    }

    const member = await this.prisma.userProject.create({
      data: { userId: dto.userId, projectId },
      include: { user: true },
    });
    return toProjectMemberDto(member);
  }

  async unassignMember(projectId: string, userId: string): Promise<void> {
    await this.findByIdOrThrow(projectId);

    const existing = await this.prisma.userProject.findUnique({
      where: { userId_projectId: { userId, projectId } },
    });
    if (!existing) {
      throw new NotFoundException('This user is not assigned to this project');
    }

    await this.prisma.userProject.delete({
      where: { userId_projectId: { userId, projectId } },
    });
  }

  private async findByIdOrThrow(id: string): Promise<void> {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Project not found');
    }
  }

  private async assertNameAvailable(name: string, excludingId?: string): Promise<void> {
    const existing = await this.prisma.project.findUnique({ where: { name } });
    if (existing && existing.id !== excludingId) {
      throw new ConflictException('A project with this name already exists');
    }
  }
}
