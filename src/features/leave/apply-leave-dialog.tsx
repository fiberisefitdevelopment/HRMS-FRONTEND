"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Can } from "@/components/guards/permission-guard";
import { ApplyLeaveForm } from "./apply-leave-form";
import { useApplyLeaveDialogStore } from "@/store/apply-leave-dialog-store";

export function ApplyLeaveDialog() {
  const open = useApplyLeaveDialogStore((s) => s.open);
  const date = useApplyLeaveDialogStore((s) => s.date);
  const close = useApplyLeaveDialogStore((s) => s.close);

  return (
    <Can permission="leave.create">
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) close();
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-0 sm:max-w-5xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Apply Leave</DialogTitle>
            <DialogDescription>Submit a leave request for the selected date.</DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <ApplyLeaveForm
              key={date ?? "today"}
              defaultDate={date}
              variant="dialog"
              onSuccess={close}
              onCancel={close}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Can>
  );
}
