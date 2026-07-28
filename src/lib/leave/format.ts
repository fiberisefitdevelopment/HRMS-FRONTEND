import { formatIstDate } from "@/lib/attendance/format";

export function formatLeaveDate(date?: string | null): string {
  if (!date) return "—";
  const raw = String(date).trim();
  const key = /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : null;
  if (key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, (m as number) - 1, d as number).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return formatIstDate(date);
}

export function formatLeaveDays(days?: number | null): string {
  if (days == null) return "—";
  return days === 1 ? "1 day" : `${days} days`;
}

export function formatCreditCycle(cycle?: string): string {
  if (!cycle) return "—";
  return cycle.replace(/_/g, " ");
}

export function getLeaveTypeLabel(code?: string, name?: string): string {
  if (name) return name;
  if (!code) return "—";
  return code;
}

export function getEmployeeDisplayName(record: {
  user?: { fullName?: string; firstName?: string; lastName?: string; email?: string };
  userId?: string | { fullName?: string; firstName?: string; lastName?: string; email?: string };
  employee?: { employeeId?: string };
}): string {
  const user =
    record.user ??
    (typeof record.userId === "object" ? record.userId : undefined);

  if (user?.fullName) return user.fullName;
  if (user?.firstName) return `${user.firstName} ${user.lastName ?? ""}`.trim();
  if (user?.email) return user.email;
  return record.employee?.employeeId ?? "—";
}

export function getActorDisplayName(actor?: {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
} | string | null): string {
  if (!actor) return "—";
  if (typeof actor === "string") return actor;
  if (actor.fullName) return actor.fullName;
  if (actor.firstName) return `${actor.firstName} ${actor.lastName ?? ""}`.trim();
  return actor.email ?? "—";
}

export function getLeaveDisplayStatus(leave: {
  status?: string;
  currentApprovalStage?: string | null;
  approvals?: Array<{ stage?: string; status?: string }>;
}): string {
  const status = (leave.status ?? "pending").toLowerCase();
  if (status !== "pending") return status;
  return "pending";
}

export function getLeaveDisplayStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pending";
    case "approved":
      return "Approved";
    case "rejected":
      return "Rejected";
    case "cancelled":
      return "Cancelled";
    default:
      return status.replace(/_/g, " ");
  }
}

export function formatApprovalStage(leave: {
  status?: string;
  currentApprovalStage?: string | null;
  approvedBy?: { fullName?: string; firstName?: string; lastName?: string; email?: string } | null;
  approvals?: Array<{
    stage?: string;
    status?: string;
    actedAt?: string | null;
    approver?: { fullName?: string; firstName?: string; lastName?: string; email?: string } | null;
  }>;
}): string {
  if (leave.status === "approved") {
    const by = leave.approvedBy
      ? getActorDisplayName(leave.approvedBy)
      : null;
    return by && by !== "—" ? `Approved by ${by}` : "Approved";
  }
  if (leave.status === "rejected") return "Rejected";
  if (leave.status === "cancelled") return "Cancelled";

  const approved = (leave.approvals ?? []).filter((a) => a.status === "approved");
  if (approved.length) {
    const by = approved[0]?.approver ? getActorDisplayName(approved[0].approver) : null;
    return by && by !== "—" ? `Approved by ${by}` : "Approved";
  }

  return "Pending approval";
}
