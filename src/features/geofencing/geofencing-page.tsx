"use client";

import { useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MapPin, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { ServerDataTable } from "@/components/data-table/server-data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";
import { GeoMap } from "@/components/geo/geo-map";
import { GeofenceFormDialog, type GeofenceFormValues } from "./geofence-form-dialog";
import { GeofenceEmployeeScope } from "./geofence-employee-scope";
import { useAttendancePolicyQuery, useGeofencesQuery } from "@/hooks/queries/use-geofence-queries";
import {
  useCreateGeofenceMutation,
  useDeleteGeofenceMutation,
  useUpdateAttendancePolicyMutation,
  useUpdateGeofenceMutation,
} from "@/hooks/mutations/use-geofence-mutations";
import { useServerListState } from "@/hooks/use-server-list-state";
import { usePermissions } from "@/hooks/use-permissions";
import { Can } from "@/components/guards/permission-guard";
import { getErrorMessage } from "@/services/api/error-handler";
import type { Geofence } from "@/types/geofence";

export function GeofencingPage() {
  const { page, pageSize, setPage, onSearchChange } = useServerListState();
  const { hasPermission } = usePermissions();
  const canManage = hasPermission("geofence.manage");
  const canManagePolicy = hasPermission("attendance.policy.manage");

  const { data, isLoading, isError, error } = useGeofencesQuery({ page, limit: pageSize });
  const { data: policy } = useAttendancePolicyQuery();
  const createMutation = useCreateGeofenceMutation();
  const updateMutation = useUpdateGeofenceMutation();
  const deleteMutation = useDeleteGeofenceMutation();
  const policyMutation = useUpdateAttendancePolicyMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Geofence | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Geofence | null>(null);

  const fences = data?.data ?? [];
  const geofencing = policy?.geofencing ?? {
    enabled: false,
    enforceOnPunchIn: true,
    enforceOnPunchOut: true,
    applyToAllEmployees: true,
    employeeProfileIds: [],
  };

  const columns = useMemo<ColumnDef<Geofence>[]>(
    () => [
      { accessorKey: "name", header: "Office" },
      {
        id: "coords",
        header: "Coordinates",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.latitude.toFixed(5)}, {row.original.longitude.toFixed(5)}
          </span>
        ),
      },
      {
        accessorKey: "radiusMeters",
        header: "Radius",
        cell: ({ row }) => `${row.original.radiusMeters} m`,
      },
      {
        accessorKey: "address",
        header: "Address",
        cell: ({ row }) => row.original.address || "—",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.isActive ? "success" : "secondary"}>
            {row.original.isActive ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          if (!canManage) return null;
          const fence = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setEditing(fence);
                    setFormOpen(true);
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                {fence.isActive && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setDeleteTarget(fence)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Deactivate
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [canManage]
  );

  const mapMarkers = fences
    .filter((f) => f.isActive)
    .map((f) => ({
      id: f.id,
      latitude: f.latitude,
      longitude: f.longitude,
      label: f.name,
      color: "blue" as const,
      radiusMeters: f.radiusMeters,
    }));

  const handleSubmit = (values: GeofenceFormValues) => {
    const payload = {
      name: values.name,
      latitude: values.latitude,
      longitude: values.longitude,
      radiusMeters: values.radiusMeters,
      address: values.address || null,
      isActive: values.isActive,
    };

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, payload },
        {
          onSuccess: () => {
            setFormOpen(false);
            setEditing(null);
          },
        }
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          setFormOpen(false);
        },
      });
    }
  };

  const patchGeofencing = (patch: Partial<typeof geofencing>) => {
    if (!canManagePolicy) return;
    policyMutation.mutate({
      geofencing: { ...geofencing, ...patch },
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Geofencing"
        description="Configure office fences and enforce punch location"
        actions={
          canManage ? (
            <Button
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add office
            </Button>
          ) : undefined
        }
      />

      <Can permissions={["attendance.policy.read", "attendance.policy.manage"]}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enforcement</CardTitle>
            <CardDescription>
              When enabled, punch in/out requires GPS and must be inside an active office fence.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-3">
              <div>
                <Label className="text-sm font-medium">Enable geofencing</Label>
                <p className="text-xs text-muted-foreground">Master switch for this company</p>
              </div>
              <Switch
                checked={geofencing.enabled}
                disabled={!canManagePolicy || policyMutation.isPending}
                onCheckedChange={(enabled) => patchGeofencing({ enabled })}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-3">
                <Label className="text-sm">Enforce on punch in</Label>
                <Switch
                  checked={geofencing.enforceOnPunchIn}
                  disabled={!canManagePolicy || !geofencing.enabled || policyMutation.isPending}
                  onCheckedChange={(enforceOnPunchIn) => patchGeofencing({ enforceOnPunchIn })}
                />
              </div>
              <div className="flex items-center justify-between gap-4 rounded-md border px-3 py-3">
                <Label className="text-sm">Enforce on punch out</Label>
                <Switch
                  checked={geofencing.enforceOnPunchOut}
                  disabled={!canManagePolicy || !geofencing.enabled || policyMutation.isPending}
                  onCheckedChange={(enforceOnPunchOut) => patchGeofencing({ enforceOnPunchOut })}
                />
              </div>
            </div>

            {geofencing.enabled && (
              <GeofenceEmployeeScope
                geofencing={geofencing}
                disabled={!canManagePolicy}
                isSaving={policyMutation.isPending}
                onSave={patchGeofencing}
              />
            )}
          </CardContent>
        </Card>
      </Can>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-base">Office map</CardTitle>
            <CardDescription>Active fences with radius circles</CardDescription>
          </div>
          <MapPin className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {mapMarkers.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No active office geofences yet
            </p>
          ) : (
            <GeoMap
              center={{
                latitude: mapMarkers[0].latitude,
                longitude: mapMarkers[0].longitude,
              }}
              markers={mapMarkers}
              height={360}
            />
          )}
        </CardContent>
      </Card>

      <ServerDataTable
        columns={columns}
        data={fences}
        meta={data?.meta}
        isLoading={isLoading}
        isError={isError}
        errorMessage={isError ? getErrorMessage(error) : undefined}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onSearchChange={onSearchChange}
        searchPlaceholder="Search offices..."
        getRowId={(row) => row.id}
        emptyMessage="No office geofences found"
      />

      <GeofenceFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
        geofence={editing}
        isLoading={createMutation.isPending || updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Deactivate geofence?"
        description={`"${deleteTarget?.name}" will no longer be used for punch validation.`}
        confirmLabel="Deactivate"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          });
        }}
      />
    </div>
  );
}
