import type { Employee } from "./employee";

export interface AssignManagerPayload {
  employeeProfileId: string;
  managerId: string;
}

export interface RemoveManagerPayload {
  employeeProfileId: string;
}

export interface ManagerTeamParams {
  page?: number;
  limit?: number;
  sort?: string;
}

export type TeamMember = Employee;
