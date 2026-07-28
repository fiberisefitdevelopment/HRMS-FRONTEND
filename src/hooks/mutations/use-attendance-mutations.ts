"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance/attendance.service";
import type { BreakPayload, CorrectAttendanceByDatePayload, CorrectAttendancePayload, PunchPayload, ReportType, AttendanceReportParams } from "@/types/attendance";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

function invalidateAttendance(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["attendance"] });
  // Eligibility depends on the fresh punch — keep Regularize CTAs in sync.
  queryClient.invalidateQueries({ queryKey: ["regularization"] });
}

export function usePunchInMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: PunchPayload) => attendanceService.punchIn(payload),
    onSuccess: () => {
      invalidateAttendance(queryClient);
      toast.success("Punched in successfully");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function usePunchOutMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload?: PunchPayload) => attendanceService.punchOut(payload),
    onSuccess: (data) => {
      invalidateAttendance(queryClient);
      toast.success(`Punched out — Status: ${data.attendanceStatus.replace("_", " ")}`);
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBreakStartMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BreakPayload) => attendanceService.breakStart(payload),
    onSuccess: () => {
      invalidateAttendance(queryClient);
      toast.success("Break started");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useBreakEndMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BreakPayload) => attendanceService.breakEnd(payload),
    onSuccess: () => {
      invalidateAttendance(queryClient);
      toast.success("Break ended");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCorrectAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: CorrectAttendancePayload }) =>
      attendanceService.correct(id, payload),
    onSuccess: () => {
      invalidateAttendance(queryClient);
      toast.success("Attendance corrected");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useCorrectAttendanceByDateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CorrectAttendanceByDatePayload) =>
      attendanceService.correctByDate(payload),
    onSuccess: () => {
      invalidateAttendance(queryClient);
      queryClient.invalidateQueries({ queryKey: ["audit-logs"] });
      toast.success("Attendance updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useExportAttendanceMutation() {
  return useMutation({
    mutationFn: ({
      type,
      format,
      params,
    }: {
      type?: ReportType;
      format?: "xlsx" | "csv";
      params?: AttendanceReportParams;
    }) => attendanceService.exportReport(type ?? "daily", format ?? "xlsx", params),
    onSuccess: () => toast.success("Export downloaded"),
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
