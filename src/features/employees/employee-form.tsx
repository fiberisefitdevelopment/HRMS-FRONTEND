"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createEmployeeSchema, type CreateEmployeeFormValues } from "@/lib/validations/organization";
import { useDepartmentsLookupQuery } from "@/hooks/queries/use-departments-queries";
import { useDesignationsLookupQuery } from "@/hooks/queries/use-designations-queries";
import { useManagerOptionsQuery } from "@/hooks/queries/use-employees-queries";
import { useShiftsLookupQuery } from "@/hooks/queries/use-shifts-queries";
import type { Employee } from "@/types/employee";

const STEPS = ["Personal", "Employment", "Contact", "Bank"] as const;

interface EmployeeFormProps {
  employee?: Employee;
  isLoading?: boolean;
  onSubmit: (values: CreateEmployeeFormValues) => void;
}

function toFormValues(employee?: Employee): CreateEmployeeFormValues {
  if (!employee) {
    return {
      firstName: "",
      lastName: "",
      officialEmail: "",
      joiningDate: "",
    };
  }
  return {
    firstName: employee.firstName,
    lastName: employee.lastName ?? "",
    officialEmail: employee.officialEmail ?? employee.email,
    personalEmail: employee.personalEmail ?? "",
    phone: employee.phone ?? "",
    alternatePhone: employee.alternatePhone ?? "",
    gender: employee.gender ?? "",
    dateOfBirth: employee.dateOfBirth?.split("T")[0] ?? "",
    maritalStatus: employee.maritalStatus ?? "",
    nationality: employee.nationality ?? "",
    bloodGroup: employee.bloodGroup ?? "",
    departmentId: employee.department?.id ?? employee.department?._id ?? "",
    designationId: employee.designation?.id ?? employee.designation?._id ?? "",
    managerId: employee.manager?.id ?? employee.manager?._id ?? "",
    shiftId: employee.shiftId ?? "",
    joiningDate: employee.joiningDate?.split("T")[0] ?? "",
    confirmationDate: employee.confirmationDate?.split("T")[0] ?? "",
    employmentType: employee.employmentType ?? undefined,
    workLocation: employee.workLocation ?? "",
    officeLocation: employee.officeLocation ?? "",
    emergencyContactName: employee.emergencyContactName ?? "",
    emergencyContactNumber: employee.emergencyContactNumber ?? "",
    relation: employee.relation ?? "",
    address: employee.address ?? "",
    city: employee.city ?? "",
    state: employee.state ?? "",
    country: employee.country ?? "",
    pincode: employee.pincode ?? "",
    bankName: employee.bankName ?? "",
    ifscCode: employee.ifscCode ?? "",
    uan: employee.uan ?? "",
    pfNumber: employee.pfNumber ?? "",
    esiNumber: employee.esiNumber ?? "",
  };
}

export function EmployeeForm({ employee, isLoading, onSubmit }: EmployeeFormProps) {
  const [step, setStep] = useState(0);
  const { data: departments } = useDepartmentsLookupQuery();
  const { data: designations } = useDesignationsLookupQuery();
  const { data: managers } = useManagerOptionsQuery();
  const { data: shifts } = useShiftsLookupQuery();

  const form = useForm<CreateEmployeeFormValues>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: toFormValues(employee),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    reset(toFormValues(employee));
  }, [employee, reset]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex gap-2">
        {STEPS.map((label, i) => (
          <Button
            key={label}
            type="button"
            variant={step === i ? "default" : "outline"}
            size="sm"
            onClick={() => setStep(i)}
          >
            {i + 1}. {label}
          </Button>
        ))}
      </div>

      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>First Name *</Label>
              <Input {...register("firstName")} />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input {...register("lastName")} />
            </div>
            <div className="space-y-2">
              <Label>Official Email *</Label>
              <Input type="email" {...register("officialEmail")} />
              {errors.officialEmail && <p className="text-xs text-destructive">{errors.officialEmail.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Personal Email</Label>
              <Input type="email" {...register("personalEmail")} />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input {...register("phone")} />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Input {...register("gender")} />
            </div>
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Input type="date" {...register("dateOfBirth")} />
            </div>
            <div className="space-y-2">
              <Label>Blood Group</Label>
              <Input {...register("bloodGroup")} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {!employee && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={watch("roleSlug") ?? "employee"}
                  onValueChange={(v) => setValue("roleSlug", v as "employee" | "manager" | "hr")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Joining Date *</Label>
              <Input type="date" {...register("joiningDate")} />
              {errors.joiningDate && <p className="text-xs text-destructive">{errors.joiningDate.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Confirmation Date</Label>
              <Input type="date" {...register("confirmationDate")} />
            </div>
            <div className="space-y-2">
              <Label>Employment Type</Label>
              <Select
                value={watch("employmentType") ?? ""}
                onValueChange={(v) =>
                  setValue("employmentType", v as CreateEmployeeFormValues["employmentType"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Full Time</SelectItem>
                  <SelectItem value="part_time">Part Time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="intern">Intern</SelectItem>
                  <SelectItem value="probation">Probation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select
                value={watch("departmentId") ?? ""}
                onValueChange={(v) => setValue("departmentId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {(departments?.data ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Select
                value={watch("designationId") ?? ""}
                onValueChange={(v) => setValue("designationId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select designation" />
                </SelectTrigger>
                <SelectContent>
                  {(designations?.data ?? []).map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Manager</Label>
              <Select
                value={watch("managerId") ?? "none"}
                onValueChange={(v) => setValue("managerId", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select manager" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No manager</SelectItem>
                  {(managers ?? []).map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Shift</Label>
              <Select
                value={watch("shiftId") ?? "none"}
                onValueChange={(v) => setValue("shiftId", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select shift" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No shift assigned</SelectItem>
                  {(shifts?.data ?? []).map((shift) => (
                    <SelectItem key={shift.id} value={shift.id}>
                      {shift.name} ({shift.startTime} – {shift.endTime})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Work Location</Label>
              <Input {...register("workLocation")} />
            </div>
            <div className="space-y-2">
              <Label>Office Location</Label>
              <Input {...register("officeLocation")} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Emergency Contact & Address</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Emergency Contact Name</Label>
              <Input {...register("emergencyContactName")} />
            </div>
            <div className="space-y-2">
              <Label>Emergency Contact Number</Label>
              <Input {...register("emergencyContactNumber")} />
            </div>
            <div className="space-y-2">
              <Label>Relation</Label>
              <Input {...register("relation")} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Address</Label>
              <Textarea {...register("address")} />
            </div>
            <div className="space-y-2">
              <Label>City</Label>
              <Input {...register("city")} />
            </div>
            <div className="space-y-2">
              <Label>State</Label>
              <Input {...register("state")} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input {...register("country")} />
            </div>
            <div className="space-y-2">
              <Label>Pincode</Label>
              <Input {...register("pincode")} />
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bank & Documents</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Bank Name</Label>
              <Input {...register("bankName")} />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input {...register("accountNumber")} />
            </div>
            <div className="space-y-2">
              <Label>IFSC Code</Label>
              <Input {...register("ifscCode")} />
            </div>
            <div className="space-y-2">
              <Label>UAN</Label>
              <Input {...register("uan")} />
            </div>
            <div className="space-y-2">
              <Label>PF Number</Label>
              <Input {...register("pfNumber")} />
            </div>
            <div className="space-y-2">
              <Label>ESI Number</Label>
              <Input {...register("esiNumber")} />
            </div>
            <div className="space-y-2">
              <Label>Aadhaar</Label>
              <Input {...register("aadhaarNumber")} />
            </div>
            <div className="space-y-2">
              <Label>PAN</Label>
              <Input {...register("panNumber")} />
            </div>
            <div className="space-y-2">
              <Label>Passport</Label>
              <Input {...register("passportNumber")} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={back} disabled={step === 0}>
          Back
        </Button>
        <div className="flex gap-2">
          {step < STEPS.length - 1 ? (
            <Button type="button" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="submit" isLoading={isLoading}>
              {employee ? "Save Changes" : "Create Employee"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
