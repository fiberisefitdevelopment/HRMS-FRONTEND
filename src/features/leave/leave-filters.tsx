"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { LeaveListParams, LeaveStatus } from "@/types/leave";

const STATUSES: LeaveStatus[] = ["pending", "approved", "rejected", "cancelled"];

interface LeaveFiltersProps {
  filters: LeaveListParams;
  onChange: (filters: LeaveListParams) => void;
  onReset: () => void;
}

export function LeaveFilters({ filters, onChange, onReset }: LeaveFiltersProps) {
  return (
    <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-4">
      <div className="space-y-2">
        <Label>Status</Label>
        <Select
          value={filters.status ?? "all"}
          onValueChange={(v) =>
            onChange({ ...filters, status: v === "all" ? undefined : (v as LeaveStatus) })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Leave Type Code</Label>
        <Input
          value={filters.leaveTypeCode ?? ""}
          onChange={(e) => onChange({ ...filters, leaveTypeCode: e.target.value || undefined })}
          placeholder="EL, ML, CL..."
        />
      </div>

      <div className="space-y-2">
        <Label>From</Label>
        <Input
          type="date"
          value={filters.startDate?.slice(0, 10) ?? ""}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value || undefined })}
        />
      </div>

      <div className="space-y-2">
        <Label>To</Label>
        <Input
          type="date"
          value={filters.endDate?.slice(0, 10) ?? ""}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value || undefined })}
        />
      </div>

      <div className="md:col-span-4 flex justify-end">
        <Button type="button" variant="outline" onClick={onReset}>
          Reset filters
        </Button>
      </div>
    </div>
  );
}
