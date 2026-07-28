import type { UserRole } from "@/types/auth";

export const ROLES: Record<UserRole, string> = {
  owner: "Owner",
  hr: "HR Admin",
  manager: "Manager",
  employee: "Employee",
};

export const ROLE_HIERARCHY: UserRole[] = ["owner", "hr", "manager", "employee"];
