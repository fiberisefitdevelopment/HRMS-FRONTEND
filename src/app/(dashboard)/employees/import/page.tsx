"use client";

import { useState } from "react";
import { PermissionGuard } from "@/components/guards/permission-guard";
import { PageHeader } from "@/components/layout/page-header";
import { EmployeeImportDialog } from "@/features/employees/employee-import-dialog";
import { Button } from "@/components/ui/button";
import { FileUp } from "lucide-react";

export default function EmployeeImportPage() {
  const [open, setOpen] = useState(true);

  return (
    <PermissionGuard permissions={["employee.import"]}>
      <div className="space-y-6">
        <PageHeader
          title="Import Employees"
          description="Upload an Excel file to bulk import employees"
          actions={
            <Button onClick={() => setOpen(true)}>
              <FileUp className="mr-2 h-4 w-4" />
              Upload File
            </Button>
          }
        />
        <EmployeeImportDialog open={open} onOpenChange={setOpen} />
      </div>
    </PermissionGuard>
  );
}
