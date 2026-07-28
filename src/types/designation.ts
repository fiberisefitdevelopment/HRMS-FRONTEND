export interface Designation {
  id: string;
  companyId: string;
  name: string;
  code: string;
  level?: number;
  description?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDesignationPayload {
  name: string;
  code: string;
  level?: number;
  description?: string;
}

export type UpdateDesignationPayload = Partial<CreateDesignationPayload>;

export interface DesignationListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  isActive?: boolean;
}
