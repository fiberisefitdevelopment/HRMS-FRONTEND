"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { compOffService } from "@/services/comp-off/comp-off.service";
import type { CancelCompOffPayload, RaiseCompOffPayload } from "@/types/comp-off";
import { QUERY_KEYS } from "@/constants/query-keys";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

function invalidateCompOff(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["comp-off"] });
  queryClient.invalidateQueries({ queryKey: ["workflow"] });
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.leave.balances() });
}

export function useRaiseCompOffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RaiseCompOffPayload) => compOffService.raise(payload),
    onSuccess: () => {
      invalidateCompOff(queryClient);
      toast.success("Comp-off request submitted");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCancelCompOffMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: CancelCompOffPayload }) =>
      compOffService.cancel(id, payload),
    onSuccess: () => {
      invalidateCompOff(queryClient);
      toast.success("Comp-off request cancelled");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
