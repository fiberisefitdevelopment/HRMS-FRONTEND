export interface CompanyAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
}

export interface Company {
  id: string;
  _id?: string;
  companyId?: string;
  companyName: string;
  companyCode: string;
  email?: string;
  phone?: string;
  address?: CompanyAddress;
  logo?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCompanyPayload {
  companyName: string;
  companyCode: string;
  email?: string;
  phone?: string;
  address?: CompanyAddress;
  logo?: string;
}

export type UpdateCompanyPayload = Partial<CreateCompanyPayload>;

export interface CompanyListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  status?: string;
}
