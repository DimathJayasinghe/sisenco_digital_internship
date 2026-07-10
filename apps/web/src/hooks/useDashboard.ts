import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '@/lib/api/dashboard';

export function useDashboardSummary() {
  return useQuery({ queryKey: ['dashboard', 'summary'], queryFn: dashboardApi.getSummary });
}

export function useDashboardTrend() {
  return useQuery({ queryKey: ['dashboard', 'trend'], queryFn: dashboardApi.getTrend });
}

export function useDashboardStatus() {
  return useQuery({ queryKey: ['dashboard', 'status'], queryFn: dashboardApi.getStatusByMember });
}

export function useDashboardWorkload() {
  return useQuery({
    queryKey: ['dashboard', 'workload'],
    queryFn: dashboardApi.getWorkloadByProject,
  });
}

export function useDashboardActivity() {
  return useQuery({ queryKey: ['dashboard', 'activity'], queryFn: dashboardApi.getActivityFeed });
}
