"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { MapPinned, RefreshCw, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { GeoMap } from "@/components/geo/geo-map";
import { useManagerLiveDashboardQuery } from "@/hooks/queries/use-attendance-queries";
import { getErrorMessage } from "@/services/api/error-handler";
import type { ManagerLiveTeamMember } from "@/types/attendance";

function StatusBadge({ member }: { member: ManagerLiveTeamMember }) {
  if (!member.punchedIn && !member.hasOpenSession) {
    return <Badge variant="secondary">Not punched in</Badge>;
  }
  if (!member.lastKnownLocation) {
    return <Badge variant="outline">No location</Badge>;
  }
  if (member.geofenceStatus?.inside) {
    return <Badge variant="success">Inside</Badge>;
  }
  return <Badge variant="warning">Outside</Badge>;
}

export function TeamLivePage() {
  const { data, isLoading, isError, error, dataUpdatedAt, refetch, isFetching } =
    useManagerLiveDashboardQuery();

  const summary = data?.summary;
  const team = data?.team ?? [];

  const markers = useMemo(
    () =>
      team
        .filter((m) => m.lastKnownLocation)
        .map((m) => ({
          id: m.employeeProfileId,
          latitude: m.lastKnownLocation!.latitude,
          longitude: m.lastKnownLocation!.longitude,
          label: m.name ?? m.employeeId,
          color: (!m.geofenceStatus
            ? "gray"
            : m.geofenceStatus.inside
              ? "green"
              : "amber") as "green" | "amber" | "gray",
        })),
    [team]
  );

  const columns = useMemo<ColumnDef<ManagerLiveTeamMember>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Employee",
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name ?? "—"}</p>
            <p className="text-xs text-muted-foreground">{row.original.employeeId}</p>
          </div>
        ),
      },
      {
        accessorKey: "department",
        header: "Department",
        cell: ({ row }) => row.original.department ?? "—",
      },
      {
        id: "session",
        header: "Session",
        cell: ({ row }) =>
          row.original.hasOpenSession || row.original.punchedIn ? (
            <Badge variant="success">Punched in</Badge>
          ) : (
            <Badge variant="secondary">Out</Badge>
          ),
      },
      {
        id: "geofence",
        header: "Geofence",
        cell: ({ row }) => <StatusBadge member={row.original} />,
      },
      {
        id: "distance",
        header: "Distance",
        cell: ({ row }) => {
          const d = row.original.geofenceStatus?.distanceMeters;
          return d != null ? `${d} m` : "—";
        },
      },
      {
        id: "lastSeen",
        header: "Last location",
        cell: ({ row }) => {
          const at = row.original.lastKnownLocation?.recordedAt;
          if (!at) return "—";
          return (
            <span className="text-xs text-muted-foreground" title={at}>
              {formatDistanceToNow(new Date(at), { addSuffix: true })}
              {row.original.lastKnownLocation?.source
                ? ` · ${row.original.lastKnownLocation.source}`
                : ""}
            </span>
          );
        },
      },
    ],
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Live team"
        description="Punch status and last known location for your team"
        actions={
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {data?.asOf && (
        <p className="text-xs text-muted-foreground">
          As of {new Date(data.asOf).toLocaleString()}
          {dataUpdatedAt
            ? ` · updated ${formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}`
            : ""}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Team", value: summary?.total ?? 0, icon: Users },
          { label: "Punched in", value: summary?.punchedIn ?? 0 },
          { label: "With location", value: summary?.withLocation ?? 0, icon: MapPinned },
          { label: "Inside", value: summary?.insideGeofence ?? 0 },
          { label: "Outside", value: summary?.outsideGeofence ?? 0 },
        ].map((item) => (
          <Card key={item.label}>
            <CardHeader className="pb-2">
              <CardDescription>{item.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{item.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Live map</CardTitle>
          <CardDescription>Green = inside · Amber = outside · Gray = unknown</CardDescription>
        </CardHeader>
        <CardContent>
          {markers.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No team locations yet. Locations appear after punch or heartbeat.
            </p>
          ) : (
            <GeoMap
              center={{
                latitude: markers[0].latitude,
                longitude: markers[0].longitude,
              }}
              markers={markers}
              height={380}
            />
          )}
        </CardContent>
      </Card>

      {isError ? (
        <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
      ) : (
        <DataTable columns={columns} data={team} isLoading={isLoading} />
      )}
    </div>
  );
}
