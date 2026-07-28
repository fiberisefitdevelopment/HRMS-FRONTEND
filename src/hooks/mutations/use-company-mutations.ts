"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesService } from "@/services/companies/companies.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import type { CreateCompanyPayload, UpdateCompanyPayload } from "@/types/company";
import { getErrorMessage } from "@/services/api/error-handler";
import { toast } from "sonner";

export function useCreateCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCompanyPayload) => companiesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company created");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useUpdateCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCompanyPayload }) =>
      companiesService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.company.detail(id) });
      toast.success("Company updated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeleteCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companiesService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company deleted");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useActivateCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companiesService.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company activated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}

export function useDeactivateCompanyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => companiesService.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      toast.success("Company deactivated");
    },
    onError: (e) => toast.error(getErrorMessage(e)),
  });
}
