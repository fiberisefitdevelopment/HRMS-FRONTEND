import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  Company,
  CompanyListParams,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@/types/company";
import { toListParams, normalizeMeta } from "@/lib/api/pagination";

type ApiCompany = Company & {
  _id?: string;
  companyId?: string;
  name?: string;
};

function normalizeCompany(company: ApiCompany): Company {
  const normalizedId = company._id ?? company.id ?? company.companyId ?? "";
  return {
    id: normalizedId,
    _id: company._id,
    companyId: company.companyId,
    companyName: company.companyName ?? company.name ?? "",
    companyCode: company.companyCode ?? "",
    email: company.email,
    phone: company.phone,
    address: company.address,
    logo: company.logo,
    status: company.status,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt,
  };
}

export const companiesService = {
  async list(params?: CompanyListParams): Promise<{ data: Company[]; meta: ReturnType<typeof normalizeMeta> }> {
    const { data } = await apiClient.get<PaginatedResponse<ApiCompany>>("/companies", {
      params: toListParams(params ?? {}),
    });
    return { data: data.data.map(normalizeCompany), meta: normalizeMeta(data.meta) };
  },

  async getById(id: string): Promise<Company> {
    const { data } = await apiClient.get<ApiResponse<ApiCompany>>(`/companies/${id}`);
    return normalizeCompany(data.data);
  },

  async create(payload: CreateCompanyPayload): Promise<Company> {
    const { data } = await apiClient.post<ApiResponse<Company>>("/companies", payload);
    return data.data;
  },

  async update(id: string, payload: UpdateCompanyPayload): Promise<Company> {
    const { data } = await apiClient.put<ApiResponse<Company>>(`/companies/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/companies/${id}`);
  },

  async activate(id: string): Promise<Company> {
    const { data } = await apiClient.post<ApiResponse<Company>>(`/companies/${id}/activate`);
    return data.data;
  },

  async deactivate(id: string): Promise<Company> {
    const { data } = await apiClient.post<ApiResponse<Company>>(`/companies/${id}/deactivate`);
    return data.data;
  },
};
