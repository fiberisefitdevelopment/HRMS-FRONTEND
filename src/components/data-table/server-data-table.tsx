"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type VisibilityState,
  type RowSelectionState,
} from "@tanstack/react-table";
import { ChevronDown, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/feedback/empty-state";
import { TableSkeleton } from "@/components/feedback/skeletons";
import { Inbox } from "lucide-react";
import type { BulkAction, PaginationMeta } from "@/types/table";
import { useDebounce } from "@/hooks/use-debounce";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ServerDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSearchChange?: (search: string) => void;
  searchValue?: string;
  searchPlaceholder?: string;
  enableRowSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableSearch?: boolean;
  bulkActions?: BulkAction[];
  emptyMessage?: string;
  getRowId?: (row: TData) => string;
  toolbar?: React.ReactNode;
}

export function ServerDataTable<TData, TValue>({
  columns,
  data,
  meta,
  isLoading,
  isError,
  errorMessage,
  page,
  pageSize,
  onPageChange,
  onSearchChange,
  searchValue = "",
  searchPlaceholder = "Search...",
  enableRowSelection = false,
  enableColumnVisibility = true,
  enableSearch = true,
  bulkActions,
  emptyMessage = "No results found.",
  getRowId,
  toolbar,
}: ServerDataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({});
  const [localSearch, setLocalSearch] = React.useState(searchValue);
  const debouncedSearch = useDebounce(localSearch, 400);

  React.useEffect(() => {
    onSearchChange?.(debouncedSearch);
  }, [debouncedSearch, onSearchChange]);

  React.useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  const selectionColumn: ColumnDef<TData, TValue> = {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };

  const tableColumns = enableRowSelection ? [selectionColumn, ...columns] : columns;

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { columnVisibility, rowSelection },
    getRowId,
    manualPagination: true,
    pageCount: meta?.totalPages ?? 0,
  });

  const selectedIds = Object.keys(rowSelection);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          {enableSearch && (
            <SearchInput
              value={localSearch}
              onChange={setLocalSearch}
              placeholder={searchPlaceholder}
              className="max-w-sm"
            />
          )}
          {toolbar}
        </div>
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings2 className="mr-2 h-4 w-4" />
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((col) => (
                  <DropdownMenuCheckboxItem
                    key={col.id}
                    className="capitalize"
                    checked={col.getIsVisible()}
                    onCheckedChange={(value) => col.toggleVisibility(!!value)}
                  >
                    {col.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage ?? "Failed to load data"}</AlertDescription>
        </Alert>
      )}

      {enableRowSelection && selectedIds.length > 0 && bulkActions && (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/50 px-4 py-2">
          <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
          {bulkActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant === "destructive" ? "destructive" : action.variant === "outline" ? "outline" : "default"}
              size="sm"
              onClick={() => action.onClick(selectedIds)}
            >
              {action.icon && <action.icon className="mr-2 h-4 w-4" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="p-4">
                  <TableSkeleton rows={pageSize > 10 ? 10 : pageSize} cols={tableColumns.length} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableColumns.length} className="h-48">
                  <EmptyState icon={Inbox} title={emptyMessage} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {meta && meta.totalPages > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {meta.total} result(s) · Page {meta.page} of {meta.totalPages}
          </p>
          <Pagination
            page={page}
            pageCount={meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}

export function useServerTableSelection() {
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  return { selectedIds, setSelectedIds, clearSelection: () => setSelectedIds([]) };
}
