"use client";

import { useQuery } from "@tanstack/react-query";
import { workflowService } from "@/services/workflow/workflow.service";
import { QUERY_KEYS } from "@/constants/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { usePermissions } from "@/hooks/use-permissions";
import type { WorkflowListParams } from "@/types/workflow";

export function useWorkflowDashboardQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.workflow.dashboard,
    queryFn: () => workflowService.getDashboard(),
    enabled: isAuthenticated && hasPermission("workflow.dashboard"),
  });
}

export function useWorkflowPendingQuery() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.workflow.pending,
    queryFn: () => workflowService.getPending(),
    enabled: isAuthenticated && hasPermission("workflow.instance.approve"),
  });
}

export function useWorkflowInstancesQuery(params?: WorkflowListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.workflow.instances(params),
    queryFn: () => workflowService.listInstances(params),
    enabled: isAuthenticated && hasPermission("workflow.instance.read"),
    placeholderData: (prev) => prev,
  });
}

export function useWorkflowInstanceQuery(id?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.workflow.detail(id ?? ""),
    queryFn: () => workflowService.getInstance(id!),
    enabled: isAuthenticated && hasPermission("workflow.instance.read") && !!id,
  });
}

export function useWorkflowHistoryQuery(instanceId?: string) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasAnyPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.workflow.history(instanceId ?? ""),
    queryFn: () => workflowService.getHistory(instanceId!),
    enabled:
      isAuthenticated &&
      hasAnyPermission(["workflow.instance.read", "leave.approve", "leave.read"]) &&
      !!instanceId,
  });
}

export function useEmployeeWorkflowQuery(userId?: string, params?: WorkflowListParams) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const { hasPermission } = usePermissions();

  return useQuery({
    queryKey: QUERY_KEYS.workflow.byEmployee(userId ?? "", params),
    queryFn: () => workflowService.listByEmployee(userId!, params),
    enabled: isAuthenticated && hasPermission("workflow.instance.read") && !!userId,
  });
}
