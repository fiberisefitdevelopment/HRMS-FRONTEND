"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDepartmentsLookupQuery } from "@/hooks/queries/use-departments-queries";
import { useDesignationsLookupQuery } from "@/hooks/queries/use-designations-queries";
import { useManagerOptionsQuery } from "@/hooks/queries/use-employees-queries";

export type BulkActionType =
  | "department"
  | "designation"
  | "manager"
  | "activate"
  | "deactivate"
  | "delete";

interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: BulkActionType | null;
  selectedCount: number;
  isLoading?: boolean;
  onConfirm: (payload: { departmentId?: string; designationId?: string; managerId?: string | null }) => void;
}

export function BulkActionDialog({
  open,
  onOpenChange,
  action,
  selectedCount,
  isLoading,
  onConfirm,
}: BulkActionDialogProps) {
  const { data: departments } = useDepartmentsLookupQuery();
  const { data: designations } = useDesignationsLookupQuery();
  const { data: managers } = useManagerOptionsQuery();

  const [departmentId, setDepartmentId] = useState("");
  const [designationId, setDesignationId] = useState("");
  const [managerId, setManagerId] = useState<string>("none");

  const titles: Record<BulkActionType, string> = {
    department: "Change Department",
    designation: "Change Designation",
    manager: "Assign Manager",
    activate: "Activate Employees",
    deactivate: "Deactivate Employees",
    delete: "Delete Employees",
  };

  const handleConfirm = () => {
    if (action === "department") onConfirm({ departmentId });
    else if (action === "designation") onConfirm({ designationId });
    else if (action === "manager") onConfirm({ managerId: managerId === "none" ? null : managerId });
    else onConfirm({});
  };

  const needsSelection = action === "department" || action === "designation" || action === "manager";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action ? titles[action] : "Bulk Action"}</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">
          Apply to {selectedCount} selected employee(s).
        </p>

        {action === "department" && (
          <div className="space-y-2">
            <Label>Department</Label>
            <Select value={departmentId} onValueChange={setDepartmentId}>
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
        )}

        {action === "designation" && (
          <div className="space-y-2">
            <Label>Designation</Label>
            <Select value={designationId} onValueChange={setDesignationId}>
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
        )}

        {action === "manager" && (
          <div className="space-y-2">
            <Label>Manager</Label>
            <Select value={managerId} onValueChange={setManagerId}>
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
        )}

        {action === "delete" && (
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Selected employees will be hidden from the directory and listed under Deleted Employees. You can restore them later.
            </p>
            <p>
              The employee ID will not be assigned to a new person. The employee ID sequence stays unique even after the employee is deleted.
            </p>
          </div>
        )}

        {action === "deactivate" && (
          <p className="text-sm text-destructive">
            This action cannot be easily undone. Please confirm.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={action === "delete" ? "destructive" : "default"}
            isLoading={isLoading}
            disabled={
              needsSelection &&
              ((action === "department" && !departmentId) ||
                (action === "designation" && !designationId))
            }
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
