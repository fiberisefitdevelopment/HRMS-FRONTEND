"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RaiseRegularizationForm } from "./raise-regularization-form";
import { useRegularizationDialogStore } from "@/store/regularization-dialog-store";
import { Can } from "@/components/guards/permission-guard";

export function RaiseRegularizationDialog() {
  const open = useRegularizationDialogStore((s) => s.open);
  const date = useRegularizationDialogStore((s) => s.date);
  const close = useRegularizationDialogStore((s) => s.close);

  return (
    <Can permission="regularization.create">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto p-0 sm:max-w-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Raise regularization</DialogTitle>
            <DialogDescription>
              Request attendance regularization for a late punch-in.
            </DialogDescription>
          </DialogHeader>
          <RaiseRegularizationForm
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
