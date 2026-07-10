import type {
  ApiResponse,
  DashboardSummary,
  MemberStatusRow,
  ReportWithRelations,
  TrendPoint,
  WorkloadSlice,
} from '@sisenco/shared-types';
import { api } from './client';

export async function getSummary(): Promise<DashboardSummary> {
  const { data } = await api.get<ApiResponse<DashboardSummary>>('/dashboard/summary');
  return data.data;
}

export async function getTrend(): Promise<TrendPoint[]> {
  const { data } = await api.get<ApiResponse<TrendPoint[]>>('/dashboard/charts/trend');
  return data.data;
}

export async function getStatusByMember(): Promise<MemberStatusRow[]> {
  const { data } = await api.get<ApiResponse<MemberStatusRow[]>>('/dashboard/charts/status');
  return data.data;
}

export async function getWorkloadByProject(): Promise<WorkloadSlice[]> {
  const { data } = await api.get<ApiResponse<WorkloadSlice[]>>('/dashboard/charts/workload');
  return data.data;
}

export async function getActivityFeed(): Promise<ReportWithRelations[]> {
  const { data } = await api.get<ApiResponse<ReportWithRelations[]>>('/dashboard/activity');
  return data.data;
}
