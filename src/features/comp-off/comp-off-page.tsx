"use client";

import { Can } from "@/components/guards/permission-guard";
import { RaiseCompOffForm } from "./raise-comp-off-form";
import { CompOffHistory } from "./comp-off-history";
import { usePermissions } from "@/hooks/use-permissions";

export function CompOffPage() {
  const { hasRole } = usePermissions();
  const isManager = hasRole("manager");
  const isHrOrOwner = hasRole(["hr", "owner"]);

  return (
    <div className="space-y-6">
      <Can permission="comp_off.create">
        <RaiseCompOffForm />
      </Can>

      {isHrOrOwner ? (
        <Can permission="comp_off.read">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold tracking-tight">Comp-off requests</h2>
            <CompOffHistory showEmployee />
          </div>
        </Can>
      ) : (
        <>
          <Can permission="comp_off.read">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold tracking-tight">My requests</h2>
              <CompOffHistory scope="self" />
            </div>
          </Can>

          {isManager && (
            <Can permission="comp_off.read">
              <div className="space-y-2">
                <h2 className="text-lg font-semibold tracking-tight">Team requests</h2>
                <CompOffHistory scope="team" showEmployee />
              </div>
            </Can>
          )}
        </>
      )}
    </div>
  );
}
