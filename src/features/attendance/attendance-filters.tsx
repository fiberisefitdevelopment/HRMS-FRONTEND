"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShiftsLookupQuery } from "@/hooks/queries/use-shifts-queries";
import type { AttendanceListParams, AttendanceStatus } from "@/types/attendance";

const STATUSES: AttendanceStatus[] = [
  "present",
  "late",
  "regularized",
  "half_day",
  "absent",
  "holiday",
  "week_off",
  "leave",
  "missing_punch",
];

interface AttendanceFiltersProps {
  filters: AttendanceListParams;
  onChange: (filters: AttendanceListParams) => void;
  onReset: () => void;
}

export function AttendanceFilters({ filters, onChange, onReset }: AttendanceFiltersProps) {
  const { data: shifts } = useShiftsLookupQuery();
  const update = (patch: Partial<AttendanceListParams>) => onChange({ ...filters, ...patch });

  return (
    <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) => update({ status: v === "all" ? undefined : (v as AttendanceStatus) })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Shift</Label>
        <Select
          value={filters.shiftId ?? "all"}
          onValueChange={(v) => update({ shiftId: v === "all" ? undefined : v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="All shifts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All shifts</SelectItem>
            {(shifts?.data ?? []).map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>From</Label>
        <Input
          type="date"
          value={filters.dateFrom ?? ""}
          onChange={(e) => update({ dateFrom: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label>To</Label>
        <Input
          type="date"
          value={filters.dateTo ?? ""}
          onChange={(e) => update({ dateTo: e.target.value || undefined })}
        />
      </div>

      <div className="flex items-end md:col-span-2 lg:col-span-4">
        <Button variant="outline" onClick={onReset}>
          Reset Filters
        </Button>
      </div>
    </div>
  );
}
