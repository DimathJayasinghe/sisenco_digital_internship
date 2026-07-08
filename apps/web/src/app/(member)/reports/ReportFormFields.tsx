'use client';

import type { Project, ReportWithRelations } from '@sisenco/shared-types';
import { ReportStatus } from '@sisenco/shared-types';
import { useState, type FormEvent, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { useCreateReport, useSubmitReport, useUpdateReport } from '@/hooks/useReports';
import { getApiErrorMessage } from '@/lib/api/error';

const MIN_HOURS = 0;
const MAX_HOURS = 168;

interface ReportFormFieldsProps {
  weekStartDate: string;
  report: ReportWithRelations | undefined;
  projects: Project[] | undefined;
}

/**
 * Owns the form's local field state. The parent mounts this with
 * `key={weekStartDate}`, so switching weeks (or the report for a week going
 * from "doesn't exist" to "exists") gets a clean remount with fresh initial
 * values instead of a useEffect resync.
 */
export function ReportFormFields({
  weekStartDate,
  report,
  projects,
}: ReportFormFieldsProps): ReactNode {
  const createReport = useCreateReport();
  const updateReport = useUpdateReport();
  const submitReport = useSubmitReport();

  const isReadOnly = report ? report.status !== ReportStatus.DRAFT : false;

  const [projectId, setProjectId] = useState(report?.projectId ?? '');
  const [tasksCompleted, setTasksCompleted] = useState(report?.tasksCompleted ?? '');
  const [tasksPlanned, setTasksPlanned] = useState(report?.tasksPlanned ?? '');
  const [blockers, setBlockers] = useState(report?.blockers ?? '');
  const [hoursWorked, setHoursWorked] = useState(report?.hoursWorked?.toString() ?? '');
  const [notesOrLinks, setNotesOrLinks] = useState(report?.notesOrLinks ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  function buildPayload(): {
    weekStartDate: string;
    projectId: string;
    tasksCompleted: string;
    tasksPlanned: string;
    blockers: string;
    hoursWorked: number | undefined;
    notesOrLinks: string | undefined;
  } {
    return {
      weekStartDate,
      projectId,
      tasksCompleted,
      tasksPlanned,
      blockers,
      hoursWorked: hoursWorked === '' ? undefined : Number(hoursWorked),
      notesOrLinks: notesOrLinks === '' ? undefined : notesOrLinks,
    };
  }

  function handleSaveDraft(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setFormError(null);
    setSaveMessage(null);

    if (report) {
      updateReport.mutate(
        { id: report.id, payload: buildPayload() },
        {
          onSuccess: () => setSaveMessage('Draft saved.'),
          onError: (error) => setFormError(getApiErrorMessage(error)),
        },
      );
    } else {
      createReport.mutate(buildPayload(), {
        onSuccess: () => setSaveMessage('Draft saved.'),
        onError: (error) => setFormError(getApiErrorMessage(error)),
      });
    }
  }

  function handleSubmitReport(): void {
    if (!report) {
      return;
    }
    setFormError(null);
    setSaveMessage(null);
    submitReport.mutate(report.id, {
      onSuccess: (submitted) => {
        setSaveMessage(
          submitted.status === ReportStatus.LATE ? 'Report submitted (late).' : 'Report submitted.',
        );
      },
      onError: (error) => setFormError(getApiErrorMessage(error)),
    });
  }

  const isSaving = createReport.isPending || updateReport.isPending;

  return (
    <form onSubmit={handleSaveDraft} className="mt-8 space-y-5">
      <Select
        label="Project"
        required
        disabled={isReadOnly}
        value={projectId}
        onChange={(event) => setProjectId(event.target.value)}
      >
        <option value="" disabled>
          Select a project…
        </option>
        {projects?.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name}
          </option>
        ))}
      </Select>

      <Textarea
        label="Tasks completed"
        required
        disabled={isReadOnly}
        value={tasksCompleted}
        onChange={(event) => setTasksCompleted(event.target.value)}
      />
      <Textarea
        label="Tasks planned for next week"
        required
        disabled={isReadOnly}
        value={tasksPlanned}
        onChange={(event) => setTasksPlanned(event.target.value)}
      />
      <Textarea
        label="Blockers / challenges"
        required
        disabled={isReadOnly}
        value={blockers}
        onChange={(event) => setBlockers(event.target.value)}
      />
      <Input
        label="Hours worked (optional)"
        type="number"
        min={MIN_HOURS}
        max={MAX_HOURS}
        step="0.5"
        disabled={isReadOnly}
        value={hoursWorked}
        onChange={(event) => setHoursWorked(event.target.value)}
      />
      <Input
        label="Notes or links (optional)"
        disabled={isReadOnly}
        value={notesOrLinks}
        onChange={(event) => setNotesOrLinks(event.target.value)}
      />

      {formError && (
        <p role="alert" className="text-sm text-red-400">
          {formError}
        </p>
      )}
      {saveMessage && <p className="text-sm text-emerald-400">{saveMessage}</p>}

      {isReadOnly ? (
        <p className="text-sm text-zinc-400">
          This report was submitted and can no longer be edited.
        </p>
      ) : (
        <div className="flex gap-3">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving…' : 'Save Draft'}
          </Button>
          {report && (
            <Button
              type="button"
              variant="secondary"
              disabled={submitReport.isPending}
              onClick={handleSubmitReport}
            >
              {submitReport.isPending ? 'Submitting…' : 'Submit Report'}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}
