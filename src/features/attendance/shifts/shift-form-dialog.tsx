"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Shift } from "@/types/shift";

const shiftSchema = z.object({
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  startTime: z.string().min(1, "Start time required"),
  endTime: z.string().min(1, "End time required"),
  gracePeriodMinutes: z.number().optional(),
});

type ShiftFormValues = z.infer<typeof shiftSchema>;

interface ShiftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shift?: Shift | null;
  isLoading?: boolean;
  onSubmit: (values: ShiftFormValues) => void;
}

export function ShiftFormDialog({
  open,
  onOpenChange,
  shift,
  isLoading,
  onSubmit,
}: ShiftFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: { name: "", code: "", startTime: "", endTime: "", gracePeriodMinutes: 15 },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: shift?.name ?? "",
        code: shift?.code ?? "",
        startTime: shift?.startTime ?? "",
        endTime: shift?.endTime ?? "",
        gracePeriodMinutes: shift?.gracePeriodMinutes ?? 15,
      });
    }
  }, [open, shift, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{shift ? "Edit Shift" : "Create Shift"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Code</Label>
            <Input {...register("code")} disabled={!!shift} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input {...register("startTime")} placeholder="09:00 AM" />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input {...register("endTime")} placeholder="06:00 PM" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Grace Period (minutes)</Label>
            <Input type="number" {...register("gracePeriodMinutes", { valueAsNumber: true })} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              {shift ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
