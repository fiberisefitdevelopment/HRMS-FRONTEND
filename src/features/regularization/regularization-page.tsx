"use client";

import { useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RaiseRegularizationForm } from "./raise-regularization-form";
import { RegularizationHistory } from "./regularization-history";
import { usePermissions } from "@/hooks/use-permissions";

interface RegularizationPageProps {
  defaultDate?: string;
}

export function RegularizationPage({ defaultDate }: RegularizationPageProps) {
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get("tab");
  const dateFromQuery = searchParams.get("date") ?? undefined;
  const { hasRole, hasPermission } = usePermissions();

  const canCreate = hasPermission("regularization.create");
  const canRead = hasPermission("regularization.read");
  const canApprove = hasPermission("regularization.approve");
  const isManager = hasRole("manager");
  const isHrOrOwner = hasRole(["hr", "owner"]);
  const showTeam = canRead && (isManager || isHrOrOwner);

  const defaultTab =
    tabFromQuery === "requests" && canRead
      ? "requests"
      : tabFromQuery === "team" && showTeam
        ? "team"
        : canCreate
          ? "raise"
          : canRead
            ? "requests"
            : "raise";

  return (
    <Tabs defaultValue={defaultTab} className="space-y-6">
      <TabsList className="h-auto flex-wrap">
        {canCreate && <TabsTrigger value="raise">Raise request</TabsTrigger>}
        {canRead && <TabsTrigger value="requests">My requests</TabsTrigger>}
        {showTeam && <TabsTrigger value="team">Team requests</TabsTrigger>}
      </TabsList>

      {canCreate && (
        <TabsContent value="raise" className="mt-0">
          <RaiseRegularizationForm defaultDate={defaultDate ?? dateFromQuery} />
        </TabsContent>
      )}

      {canRead && (
        <TabsContent value="requests" className="mt-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">My requests</h2>
          <RegularizationHistory scope="self" />
        </TabsContent>
      )}

      {showTeam && (
        <TabsContent value="team" className="mt-0 space-y-2">
          <h2 className="text-lg font-semibold tracking-tight">Team requests</h2>
          <RegularizationHistory
            scope={isHrOrOwner ? undefined : "team"}
            showEmployee
            canApprove={canApprove}
          />
        </TabsContent>
      )}
    </Tabs>
  );
}
