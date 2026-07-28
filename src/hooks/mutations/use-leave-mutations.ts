"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { leaveService } from "@/services/leave/leave.service";
import type {
  ApplyLeavePayload,
  BulkApplyLeavePayload,
  BulkCreditLeaveBalancePayload,
  CancelLeavePayload,
  CreditLeaveBalancePayload,
  LeaveActionPayload,
  LeaveReportParams,
  LeaveReportType,
} from "@/types/leave";
import { getErrorMessage, getFieldErrors } from "@/services/api/error-handler";
import { toast } from "sonner";

function invalidateLeave(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["leave"] });
  queryClient.invalidateQueries({ queryKey: ["workflow"] });
}

export function useApplyLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyLeavePayload) => leaveService.apply(payload),
    onSuccess: (data, payload) => {
      invalidateLeave(queryClient);
      const isManualHr = Boolean(payload.employeeProfileId || payload.userId) || data.source === "manual_hr";
      toast.success(isManualHr ? "Leave added successfully" : "Leave request submitted");
    },
    onError: (error) => {
      const fields = getFieldErrors(error);
      if (fields) {
        const first = Object.values(fields)[0]?.[0];
        toast.error(first ?? getErrorMessage(error));
        return;
      }
      toast.error(getErrorMessage(error));
    },
  });
}

export function useBulkApplyLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkApplyLeavePayload) => leaveService.bulkApply(payload),
    onSuccess: (result) => {
      invalidateLeave(queryClient);
      if (result.failed === 0) {
        toast.success(`Leave added for ${result.success} employee${result.success === 1 ? "" : "s"}`);
      } else if (result.success === 0) {
        toast.error(`Failed to add leave for ${result.failed} employee${result.failed === 1 ? "" : "s"}`);
      } else {
        toast.warning(
          `Added for ${result.success}, failed for ${result.failed}. Check details below.`
        );
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreditLeaveBalanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreditLeaveBalancePayload) => leaveService.creditBalance(payload),
    onSuccess: (data) => {
      invalidateLeave(queryClient);
      toast.success(
        `Leave balance credited: ${data.previousBalance} → ${data.balance} (${data.leaveTypeCode})`
      );
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useBulkCreditLeaveBalanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCreditLeaveBalancePayload) => leaveService.bulkCreditBalance(payload),
    onSuccess: (result) => {
      invalidateLeave(queryClient);
      if (result.failed === 0) {
        toast.success(
          `Leave balance credited for ${result.success} employee${result.success === 1 ? "" : "s"}`
        );
      } else if (result.success === 0) {
        toast.error(`Failed for ${result.failed} employee${result.failed === 1 ? "" : "s"}`);
      } else {
        toast.warning(
          `Credited for ${result.success}, failed for ${result.failed}. Check details below.`
        );
      }
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useApproveLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: LeaveActionPayload }) =>
      leaveService.approve(id, payload),
    onSuccess: () => {
      invalidateLeave(queryClient);
      toast.success("Leave approved");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useRejectLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: LeaveActionPayload }) =>
      leaveService.reject(id, payload),
    onSuccess: () => {
      invalidateLeave(queryClient);
      toast.success("Leave rejected");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelLeaveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CancelLeavePayload }) =>
      leaveService.cancel(id, payload),
    onSuccess: () => {
      invalidateLeave(queryClient);
      toast.success("Leave request cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useExportLeaveMutation() {
  return useMutation({
    mutationFn: ({
      type,
      format,
      params,
    }: {
      type: LeaveReportType;
      format: "xlsx" | "csv";
      params?: LeaveReportParams;
    }) => leaveService.exportReport(type, format, params),
    onSuccess: () => toast.success("Export started"),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
