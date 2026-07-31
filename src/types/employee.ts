export interface EntityRef {
  id?: string;
  _id?: string;
  name?: string;
  code?: string;
  companyName?: string;
  companyCode?: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
}

export type EmploymentCategory = "permanent" | "contractual";

export type EmploymentType =
  | "full_time"
  | "part_time"
  | "contract"
  | "intern"
  | "probation";

export type EmployeeStatus =
  | "active"
  | "inactive"
  | "terminated"
  | "on_leave"
  | "resigned";

export interface EmergencyContact {
  name?: string | null;
  number?: string | null;
  relation?: string | null;
}

export interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  officialEmail: string;
  personalEmail?: string | null;
  phone?: string | null;
  company?: EntityRef | null;
  department?: EntityRef | null;
  designation?: EntityRef | null;
  manager?: EntityRef | null;
  shiftId?: string | null;
  joiningDate: string;
  confirmationDate?: string | null;
  employmentType?: EmploymentType | null;
  workLocation?: string | null;
  officeLocation?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  /** Alias for dateOfBirth returned by `/employees/me`. */
  dob?: string | null;
  maritalStatus?: string | null;
  nationality?: string | null;
  bloodGroup?: string | null;
  alternatePhone?: string | null;
  emergencyContactName?: string | null;
  emergencyContactNumber?: string | null;
  relation?: string | null;
  emergencyContact?: EmergencyContact | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  bankName?: string | null;
  ifscCode?: string | null;
  uan?: string | null;
  pfNumber?: string | null;
  esiNumber?: string | null;
  profilePhoto?: string | null;
  status: EmployeeStatus;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  temporaryPassword?: string;
  /** Flattened fields commonly returned by `/employees/me`. */
  departmentName?: string | null;
  designationName?: string | null;
  managerName?: string | null;
  managerId?: string | null;
  shiftTime?: string | null;
  workingDays?: number[];
  geofencing?: boolean;
}

export interface CreateEmployeePayload {
  firstName: string;
  lastName?: string;
  employeeId?: string;
  roleSlug?: "employee" | "manager" | "hr";
  password?: string;
  departmentId?: string;
  designationId?: string;
  managerId?: string;
  shiftId?: string | null;
  joiningDate: string;
  confirmationDate?: string;
  employmentType?: EmploymentType;
  workLocation?: string;
  officeLocation?: string;
  bloodGroup?: string;
  gender?: string;
  dateOfBirth?: string;
  maritalStatus?: string;
  nationality?: string;
  personalEmail?: string;
  officialEmail: string;
  phone?: string;
  alternatePhone?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  relation?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  uan?: string;
  pfNumber?: string;
  esiNumber?: string;
}

export type UpdateEmployeePayload = Partial<
  Omit<CreateEmployeePayload, "roleSlug" | "password">
>;

export interface EmployeeListParams {
  page?: number;
  limit?: number;
  sort?: string;
  search?: string;
  departmentId?: string;
  designationId?: string;
  managerId?: string;
  employmentCategory?: EmploymentCategory;
  employmentType?: EmploymentType;
  status?: EmployeeStatus;
  joiningDateFrom?: string;
  joiningDateTo?: string;
}

export interface ImportSummary {
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  dryRun: boolean;
}

export interface ImportReportRow {
  rowNumber: number;
  status: string;
  reason?: string | null;
  imported?: boolean;
}

export interface ImportResult {
  summary: ImportSummary;
  report: ImportReportRow[];
  columns?: string[];
}

export interface BulkResult {
  success?: number;
  failed?: number;
  count?: number;
}

export interface ManagerOption {
  id: string;
  userId: string;
  label: string;
  email?: string;
}
