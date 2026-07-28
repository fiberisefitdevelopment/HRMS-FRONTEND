"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import type { GeofencingPolicyConfig } from "@/types/geofence";

interface GeofenceEmployeeScopeProps {
  geofencing: GeofencingPolicyConfig;
  disabled?: boolean;
  isSaving?: boolean;
  onSave: (patch: Partial<GeofencingPolicyConfig>) => void;
}

export function GeofenceEmployeeScope({
  geofencing,
  disabled,
  isSaving,
  onSave,
}: GeofenceEmployeeScopeProps) {
  const { data, isLoading } = useEmployeesQuery({
    page: 1,
    limit: 200,
    sort: "firstName",
    status: "active",
  });
  const employees = data?.data ?? [];

  const [applyToAll, setApplyToAll] = useState(geofencing.applyToAllEmployees !== false);
  const [selectedIds, setSelectedIds] = useState<string[]>(geofencing.employeeProfileIds ?? []);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setApplyToAll(geofencing.applyToAllEmployees !== false);
    setSelectedIds(geofencing.employeeProfileIds ?? []);
  }, [geofencing.applyToAllEmployees, geofencing.employeeProfileIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const dirty =
    applyToAll !== (geofencing.applyToAllEmployees !== false) ||
    JSON.stringify([...selectedIds].sort()) !==
      JSON.stringify([...(geofencing.employeeProfileIds ?? [])].sort());

  const toggle = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((x) => x !== id)));
  };

  const selectAllFiltered = () => {
    const ids = new Set(selectedIds);
    filtered.forEach((e) => ids.add(e.id));
    setSelectedIds(Array.from(ids));
  };

  const clearFiltered = () => {
    const remove = new Set(filtered.map((e) => e.id));
    setSelectedIds((prev) => prev.filter((id) => !remove.has(id)));
  };

  return (
    <div className="space-y-4 rounded-md border p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <Label className="text-sm font-medium">Apply to all employees</Label>
          <p className="text-xs text-muted-foreground">
            Turn off to choose specific employees for geofence enforcement
          </p>
        </div>
        <Switch
          checked={applyToAll}
          disabled={disabled || isSaving}
          onCheckedChange={setApplyToAll}
        />
      </div>

      {!applyToAll && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={disabled}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={selectAllFiltered} disabled={disabled}>
              Select shown
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={clearFiltered} disabled={disabled}>
              Clear shown
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {selectedIds.length} employee{selectedIds.length === 1 ? "" : "s"} selected
          </p>

          <div className="max-h-64 space-y-1 overflow-y-auto rounded-md border p-2">
            {isLoading && (
              <p className="py-6 text-center text-sm text-muted-foreground">Loading employees…</p>
            )}
            {!isLoading && filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">No employees found</p>
            )}
            {filtered.map((employee) => {
              const checked = selectedIds.includes(employee.id);
              return (
                <label
                  key={employee.id}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
                >
                  <Checkbox
                    checked={checked}
                    disabled={disabled || isSaving}
                    onCheckedChange={(value) => toggle(employee.id, value === true)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{employee.fullName}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {employee.employeeId}
                      {employee.email ? ` · ${employee.email}` : ""}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {dirty && (
        <div className="flex justify-end">
          <Button
            size="sm"
            disabled={disabled || isSaving || (!applyToAll && selectedIds.length === 0)}
            isLoading={isSaving}
            onClick={() =>
              onSave({
                applyToAllEmployees: applyToAll,
                employeeProfileIds: applyToAll ? [] : selectedIds,
              })
            }
          >
            Save employee scope
          </Button>
        </div>
      )}
    </div>
  );
}
