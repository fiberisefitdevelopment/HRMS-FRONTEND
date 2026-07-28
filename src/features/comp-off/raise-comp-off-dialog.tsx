"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Can } from "@/components/guards/permission-guard";
import { RaiseCompOffForm } from "./raise-comp-off-form";
import { useCompOffDialogStore } from "@/store/comp-off-dialog-store";

export function RaiseCompOffDialog() {
  const open = useCompOffDialogStore((s) => s.open);
  const date = useCompOffDialogStore((s) => s.date);
  const close = useCompOffDialogStore((s) => s.close);

  return (
    <Can permission="comp_off.create">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0 sm:max-w-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Raise Comp-off</DialogTitle>
            <DialogDescription>Request compensatory off for overtime work.</DialogDescription>
          </DialogHeader>
          <RaiseCompOffForm
            key={date ?? "today"}
            defaultDate={date}
            variant="dialog"
            onSuccess={close}
            onCancel={close}
          />
        </DialogContent>
      </Dialog>
    </Can>
  );
}
