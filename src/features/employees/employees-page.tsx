"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { usePermissions } from "@/hooks/use-permissions";
import {
  Download,
  FileUp,
  Plus,
  Power,
  PowerOff,
  Trash2,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Can } from "@/components/guards/permission-guard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmployeeFilters } from "./employee-filters";
import { getEmployeeColumns } from "./employee-columns";
import { BulkActionDialog, type BulkActionType } from "./bulk-action-dialog";
import { EmployeeImportDialog } from "./employee-import-dialog";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import { useServerListState } from "@/hooks/use-server-list-state";
import {
  useBulkActivateMutation,
  useBulkDeactivateMutation,
  useBulkDeleteMutation,
  useBulkDepartmentMutation,
  useBulkDesignationMutation,
  useBulkManagerMutation,
  useExportEmployeesMutation,
} from "@/hooks/mutations/use-employee-mutations";
import { getErrorMessage } from "@/services/api/error-handler";
import type { EmployeeListParams, EmploymentCategory } from "@/types/employee";
import type { BulkAction } from "@/types/table";

export function EmployeesPage() {
  const { hasPermission, hasRole } = usePermissions();
  const isManager = hasRole("manager");
  const canBulk = hasPermission("employee.bulk");
  const { page, pageSize, search, setPage, onSearchChange } = useServerListState(20);
  const [filters, setFilters] = useState<EmployeeListParams>({});
  const [showFilters, setShowFilters] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState<BulkActionType | null>(null);
  const [bulkIds, setBulkIds] = useState<string[]>([]);

  const categoryFilter = filters.employmentCategory;

  const setCategoryFilter = (category?: EmploymentCategory) => {
    setFilters((prev) => ({
      ...prev,
      employmentCategory: category,
      employmentType: undefined,
    }));
    setPage(1);
  };

  const queryParams = useMemo(
    () => ({ page, limit: pageSize, search, sort: "firstName", ...filters }),
    [page, pageSize, search, filters]
  );

  const { data, isLoading, isError, error } = useEmployeesQuery(queryParams);
  const exportMutation = useExportEmployeesMutation();
  const bulkActivate = useBulkActivateMutation();
  const bulkDeactivate = useBulkDeactivateMutation();
  const bulkDelete = useBulkDeleteMutation();
  const bulkDepartment = useBulkDepartmentMutation();
  const bulkDesignation = useBulkDesignationMutation();
  const bulkManager = useBulkManagerMutation();

  const columns = useMemo(() => getEmployeeColumns(), []);

  const openBulk = useCallback((action: BulkActionType, ids: string[]) => {
    setBulkIds(ids);
    if (action === "activate") {
      bulkActivate.mutate(ids);
      return;
    }
  }, [bulkActivate]);

  const bulkActions: BulkAction[] = [
    {
      label: "Activate",
      icon: Power,
      onClick: (ids) => openBulk("activate", ids),
    },
    {
      label: "Deactivate",
      icon: PowerOff,
      onClick: (ids) => {
        setBulkIds(ids);
        setBulkAction("deactivate");
      },
    },
    {
      label: "Change Department",
      icon: Users,
      onClick: (ids) => {
        setBulkIds(ids);
        setBulkAction("department");
      },
    },
    {
      label: "Change Designation",
      onClick: (ids) => {
        setBulkIds(ids);
        setBulkAction("designation");
      },
    },
    {
      label: "Assign Manager",
      onClick: (ids) => {
        setBulkIds(ids);
        setBulkAction("manager");
      },
    },
    {
      label: "Delete",
      icon: Trash2,
      variant: "destructive",
      onClick: (ids) => {
        setBulkIds(ids);
        setBulkAction("delete");
      },
    },
  ];

  const handleBulkConfirm = (payload: {
    departmentId?: string;
    designationId?: string;
    managerId?: string | null;
  }) => {
    const onDone = () => {
      setBulkAction(null);
      setBulkIds([]);
    };

    if (bulkAction === "department" && payload.departmentId) {
      bulkDepartment.mutate({ employeeIds: bulkIds, departmentId: payload.departmentId }, { onSuccess: onDone });
    } else if (bulkAction === "designation" && payload.designationId) {
      bulkDesignation.mutate({ employeeIds: bulkIds, designationId: payload.designationId }, { onSuccess: onDone });
    } else if (bulkAction === "manager") {
      bulkManager.mutate({ employeeIds: bulkIds, managerId: payload.managerId ?? null }, { onSuccess: onDone });
    } else if (bulkAction === "deactivate") {
      bulkDeactivate.mutate(bulkIds, { onSuccess: onDone });
    } else if (bulkAction === "delete") {
      bulkDelete.mutate(bulkIds, { onSuccess: onDone });
    }
  };

  const bulkLoading =
    bulkDepartment.isPending ||
    bulkDesignation.isPending ||
    bulkManager.isPending ||
    bulkDeactivate.isPending ||
    bulkDelete.isPending;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isManager ? "My Team" : "Employees"}
        description={isManager ? "View and manage your direct reports" : "Manage your workforce"}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-lg border p-1">
              <Button
                type="button"
                size="sm"
                variant={!categoryFilter ? "secondary" : "ghost"}
                onClick={() => setCategoryFilter(undefined)}
              >
                All
              </Button>
              <Button
                type="button"
                size="sm"
                variant={categoryFilter === "permanent" ? "secondary" : "ghost"}
                onClick={() => setCategoryFilter("permanent")}
              >
                Permanent
              </Button>
              <Button
                type="button"
                size="sm"
                variant={categoryFilter === "contractual" ? "secondary" : "ghost"}
                onClick={() => setCategoryFilter("contractual")}
              >
                Contractual
              </Button>
            </div>
            <Button variant="outline" onClick={() => setShowFilters((v) => !v)}>
              Filters
            </Button>
            <Can permission="employee.export">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" isLoading={exportMutation.isPending}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => exportMutation.mutate({ format: "xlsx" })}>
                    Excel (.xlsx)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportMutation.mutate({ format: "csv" })}>
                    CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Can>
            <Can permission="employee.import">
              <Button variant="outline" onClick={() => setImportOpen(true)}>
                <FileUp className="mr-2 h-4 w-4" />
                Import
              </Button>
            </Can>
            <Can permission="employee.create">
              <Link href="/employees/new" className={cn(buttonVariants())}>
                <Plus className="mr-2 h-4 w-4" />
                Add Employee
              </Link>
            </Can>
          </div>
        }
      />

      {showFilters && (
        <EmployeeFilters
          filters={filters}
          onChange={(f) => {
            setFilters(f);
            setPage(1);
          }}
          onReset={() => {
            setFilters({});
            setPage(1);
          }}
        />
      )}

      <ServerDataTable
        columns={columns}
        data={data?.data ?? []}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search by name, email, ID..."
        enableRowSelection={canBulk}
        bulkActions={canBulk ? bulkActions : undefined}
        getRowId={(row) => row.id}
        emptyMessage="No employees found"
      />

      <BulkActionDialog
        open={!!bulkAction}
        onOpenChange={(open) => !open && setBulkAction(null)}
        action={bulkAction}
        selectedCount={bulkIds.length}
        isLoading={bulkLoading}
        onConfirm={handleBulkConfirm}
      />

      <EmployeeImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </div>
  );
}
