import type { LeaveBalance } from "@/types/leave";
import type { LeavePolicy, LeaveTypeConfig } from "@/types/leave-policy";

export interface LeaveTypeOption {
  code: string;
  name: string;
  leaveType: string;
  config?: LeaveTypeConfig;
}

export function buildLeaveTypeOptions(
  policy?: LeavePolicy | null,
  balances?: LeaveBalance[] | null
): LeaveTypeOption[] {
  const fromPolicy =
    policy?.leaveTypes
      ?.filter((t) => t.isActive !== false && t.code)
      .map((t) => ({
        code: t.code,
        name: t.name || t.code,
        leaveType: t.leaveType || t.name || t.code,
        config: t,
      })) ?? [];

  if (fromPolicy.length > 0) return fromPolicy;

  const seen = new Set<string>();
  const fromBalances: LeaveTypeOption[] = [];

  for (const balance of balances ?? []) {
    if (!balance.leaveTypeCode || seen.has(balance.leaveTypeCode)) continue;
    seen.add(balance.leaveTypeCode);
    fromBalances.push({
      code: balance.leaveTypeCode,
      name: balance.leaveType || balance.leaveTypeCode,
      leaveType: balance.leaveType || balance.leaveTypeCode,
    });
  }

  return fromBalances;
}
