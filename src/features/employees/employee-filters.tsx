"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDepartmentsLookupQuery } from "@/hooks/queries/use-departments-queries";
import { useDesignationsLookupQuery } from "@/hooks/queries/use-designations-queries";
import { useManagerOptionsQuery } from "@/hooks/queries/use-employees-queries";
import type { EmployeeListParams, EmployeeStatus } from "@/types/employee";
import type { EmploymentCategory } from "@/types/employee";

interface EmployeeFiltersProps {
  filters: EmployeeListParams;
  onChange: (filters: EmployeeListParams) => void;
  onReset: () => void;
}

export function EmployeeFilters({ filters, onChange, onReset }: EmployeeFiltersProps) {
  const { data: departments } = useDepartmentsLookupQuery();
  const { data: designations } = useDesignationsLookupQuery();
  const { data: managers } = useManagerOptionsQuery();

  const update = (patch: Partial<EmployeeListParams>) => onChange({ ...filters, ...patch });

  return (
    <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label>Department</Label>
        <Select
          value={filters.departmentId ?? "all"}
          onValueChange={(v) => update({ departmentId: v === "all" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All departments" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
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
          value={filters.designationId ?? "all"}
          onValueChange={(v) => update({ designationId: v === "all" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All designations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All designations</SelectItem>
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
          value={filters.managerId ?? "all"}
          onValueChange={(v) => update({ managerId: v === "all" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All managers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All managers</SelectItem>
            {(managers ?? []).map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Employee Category</Label>
        <Select
          value={filters.employmentCategory ?? "all"}
          onValueChange={(v) =>
            update({
              employmentCategory: v === "all" ? undefined : (v as EmploymentCategory),
              employmentType: undefined,
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All employees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All employees</SelectItem>
            <SelectItem value="permanent">Permanent (Onroll)</SelectItem>
            <SelectItem value="contractual">Contractual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) =>
            update({ status: v === "all" ? undefined : (v as EmployeeStatus) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="on_leave">On Leave</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
            <SelectItem value="resigned">Resigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Joining From</Label>
        <Input
          type="date"
          value={filters.joiningDateFrom ?? ""}
          onChange={(e) => update({ joiningDateFrom: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label>Joining To</Label>
        <Input
          type="date"
          value={filters.joiningDateTo ?? ""}
          onChange={(e) => update({ joiningDateTo: e.target.value || undefined })}
        />
      </div>

      <div className="flex items-end">
        <Button variant="outline" onClick={onReset} className="w-full">
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
