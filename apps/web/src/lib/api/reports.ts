import type { ApiResponse, ReportWithRelations } from '@sisenco/shared-types';
import { api } from './client';

export interface CreateReportPayload {
  weekStartDate: string;
  projectId: string;
  tasksCompleted: string;
  tasksPlanned: string;
  blockers: string;
  hoursWorked?: number;
  notesOrLinks?: string;
}

export type UpdateReportPayload = Partial<CreateReportPayload>;

export async function createReport(payload: CreateReportPayload): Promise<ReportWithRelations> {
  const { data } = await api.post<ApiResponse<ReportWithRelations>>('/reports', payload);
  return data.data;
}

export async function updateReport(
  id: string,
  payload: UpdateReportPayload,
): Promise<ReportWithRelations> {
  const { data } = await api.patch<ApiResponse<ReportWithRelations>>(`/reports/${id}`, payload);
  return data.data;
}

export async function submitReport(id: string): Promise<ReportWithRelations> {
  const { data } = await api.post<ApiResponse<ReportWithRelations>>(`/reports/${id}/submit`);
  return data.data;
}

export async function getMyReports(): Promise<ReportWithRelations[]> {
  const { data } = await api.get<ApiResponse<ReportWithRelations[]>>('/reports/my');
  return data.data;
}
