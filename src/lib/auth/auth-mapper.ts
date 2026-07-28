import type { User, UserRole } from "@/types/auth";

export interface ApiUser {
  id: string;
  employeeCode?: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  isActive: boolean;
  isBlocked?: boolean;
  status?: string;
  lastLogin?: string;
  company?: ApiCompany | string;
  role?: ApiRole | null;
  departmentId?: string | { id: string; name?: string };
  designationId?: string | { id: string; name?: string };
  managerId?: string;
  accessibleCompanyIds?: string[];
  createdAt?: string;
}

export interface ApiCompany {
  id?: string;
  _id?: string;
  companyId?: string;
  companyName?: string;
  name?: string;
  companyCode?: string;
  logo?: string;
  status?: string;
}

export interface ApiRole {
  id?: string;
  _id?: string;
  name: string;
  slug: string;
}

function resolveId(value?: { id?: string; _id?: string; companyId?: string } | string): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  return value._id ?? value.id ?? value.companyId;
}

function mapCompany(company?: ApiCompany | string): User["company"] | undefined {
  if (!company) return undefined;
  if (typeof company === "string") {
    return {
      id: company,
      name: "",
    };
  }
  const id = resolveId(company) ?? "";
  return {
    id,
    name: company.companyName ?? company.name ?? "",
    logo: company.logo,
    code: company.companyCode,
    status: company.status,
  };
}

export function mapApiUser(apiUser: ApiUser, permissions: string[] = []): User {
  const roleSlug = (apiUser.role?.slug ?? "employee") as UserRole;
  const department =
    typeof apiUser.departmentId === "object" ? apiUser.departmentId?.name : undefined;
  const designation =
    typeof apiUser.designationId === "object" ? apiUser.designationId?.name : undefined;

  return {
    id: apiUser.id,
    employeeCode: apiUser.employeeCode,
    firstName: apiUser.firstName,
    lastName: apiUser.lastName,
    fullName: apiUser.fullName ?? `${apiUser.firstName} ${apiUser.lastName}`.trim(),
    email: apiUser.email,
    phone: apiUser.phone,
    profilePhoto: apiUser.profilePhoto,
    role: roleSlug,
    roleName: apiUser.role?.name,
    permissions,
    company: mapCompany(apiUser.company),
    department,
    designation,
    departmentId: resolveId(apiUser.departmentId as ApiCompany),
    designationId: resolveId(apiUser.designationId as ApiCompany),
    accessibleCompanyIds: apiUser.accessibleCompanyIds,
    isActive: apiUser.isActive,
    isBlocked: apiUser.isBlocked,
    status: apiUser.status,
    lastLogin: apiUser.lastLogin,
    createdAt: apiUser.createdAt,
  };
}
