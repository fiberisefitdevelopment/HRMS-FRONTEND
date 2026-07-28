"use client";

import { Can } from "@/components/guards/permission-guard";
import { RaiseWfhForm } from "./raise-wfh-form";
import { WfhHistory } from "./wfh-history";
import { usePermissions } from "@/hooks/use-permissions";

export function WfhPage() {
  const { hasRole } = usePermissions();
  const isManager = hasRole("manager");
  const isHrOrOwner = hasRole(["hr", "owner"]);

  return (
    <div className="space-y-6">
      <Can permission="wfh.create">
        <RaiseWfhForm />
      </Can>

      {isHrOrOwner ? (
        <Can permission="wfh.read">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">WFH requests</h2>
            <WfhHistory showEmployee />
          </div>
        </Can>
      ) : (
        <>
          <Can permission="wfh.read">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight">My requests</h2>
              <WfhHistory scope="self" />
            </div>
          </Can>

          {isManager && (
            <Can permission="wfh.read">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">Team requests</h2>
                <WfhHistory scope="team" showEmployee />
              </div>
            </Can>
          )}
        </>
      )}
    </div>
  );
}
