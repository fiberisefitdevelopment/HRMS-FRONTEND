export interface Department {
  id: string;
  companyId: string;
  name: string;
  code: string;
  description?: string | null;
  parentDepartmentId?: string | null;
  headEmployeeId?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  parentDepartmentId?: string;
}

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

export interface DepartmentListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  isActive?: boolean;
}
