import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as reportsApi from '@/lib/api/reports';
import type { UpdateReportPayload } from '@/lib/api/reports';

const MY_REPORTS_KEY = ['reports', 'my'] as const;

export function useMyReports() {
  return useQuery({
    queryKey: MY_REPORTS_KEY,
    queryFn: reportsApi.getMyReports,
  });
}

export function useCreateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.createReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_REPORTS_KEY }),
  });
}

export function useUpdateReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateReportPayload }) =>
      reportsApi.updateReport(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_REPORTS_KEY }),
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reportsApi.submitReport,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MY_REPORTS_KEY }),
  });
}
