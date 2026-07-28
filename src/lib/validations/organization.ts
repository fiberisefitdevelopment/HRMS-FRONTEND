import { z } from "zod";

export const companySchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyCode: z.string().min(1, "Company code is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
});

export type CompanyFormValues = z.infer<typeof companySchema>;

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export const designationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  level: z.number().optional(),
  description: z.string().optional(),
});

export type DesignationFormValues = z.infer<typeof designationSchema>;

export const employeePersonalSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  officialEmail: z.string().email("Valid email required"),
  personalEmail: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  alternatePhone: z.string().optional(),
  gender: z.string().optional(),
  dateOfBirth: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  bloodGroup: z.string().optional(),
});

export const employeeEmploymentSchema = z.object({
  roleSlug: z.enum(["employee", "manager", "hr"]).optional(),
  departmentId: z.string().optional(),
  designationId: z.string().optional(),
  managerId: z.string().optional(),
  shiftId: z.string().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  confirmationDate: z.string().optional(),
  employmentType: z.enum(["full_time", "part_time", "contract", "intern", "probation"]).optional(),
  workLocation: z.string().optional(),
  officeLocation: z.string().optional(),
});

export const employeeContactSchema = z.object({
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  relation: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
});

export const employeeBankSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  uan: z.string().optional(),
  pfNumber: z.string().optional(),
  esiNumber: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  passportNumber: z.string().optional(),
});

export const createEmployeeSchema = employeePersonalSchema
  .merge(employeeEmploymentSchema)
  .merge(employeeContactSchema)
  .merge(employeeBankSchema);

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
