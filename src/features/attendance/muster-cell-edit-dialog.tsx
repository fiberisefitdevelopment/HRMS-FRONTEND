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
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatIstDate, formatIstTime } from "@/lib/attendance/format";
import type { MusterCode, MusterRollDayDetail } from "@/types/attendance";

const STATUS_OPTIONS = [
  { value: "present", label: "Present (P)", code: "P" as MusterCode },
  { value: "late", label: "Late (L)", code: "L" as MusterCode },
  { value: "half_day", label: "Half day (HD)", code: "HD" as MusterCode },
  { value: "absent", label: "Absent (A)", code: "A" as MusterCode },
  { value: "leave", label: "Leave (LV)", code: "LV" as MusterCode },
  { value: "holiday", label: "Holiday (H)", code: "H" as MusterCode },
  { value: "week_off", label: "Week off (WO)", code: "WO" as MusterCode },
  { value: "missing_punch", label: "Missing punch (MP)", code: "MP" as MusterCode },
] as const;

const schema = z.object({
  attendanceStatus: z.string().min(1, "Status is required"),
  remarks: z.string().trim().min(1, "Reason is required").max(500),
});

type FormValues = z.infer<typeof schema>;

export function codeToStatus(code: MusterCode): string {
  const match = STATUS_OPTIONS.find((opt) => opt.code === code);
  return match?.value ?? "absent";
}

export interface MusterCellEditTarget {
  employeeProfileId: string;
  employeeName: string;
  employeeId: string;
  date: string;
  code: MusterCode;
  detail?: MusterRollDayDetail | null;
}

interface MusterCellEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: MusterCellEditTarget | null;
  isLoading?: boolean;
  onSubmit: (values: FormValues) => void;
}

export function MusterCellEditDialog({
  open,
  onOpenChange,
  target,
  isLoading,
  onSubmit,
}: MusterCellEditDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { attendanceStatus: "absent", remarks: "" },
  });

  const status = watch("attendanceStatus");

  useEffect(() => {
    if (!open || !target) return;
    const raw = target.detail?.attendanceStatus || "";
    const known = STATUS_OPTIONS.some((opt) => opt.value === raw);
    reset({
      attendanceStatus: known ? raw : codeToStatus(target.code),
      remarks: target.detail?.remarks?.trim() || "",
    });
  }, [open, target, reset]);

  if (!target) return null;

  const punchIn = formatIstTime(target.detail?.punchIn, target.detail?.punchInDisplay);
  const punchOut = formatIstTime(target.detail?.punchOut, target.detail?.punchOutDisplay);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit attendance</DialogTitle>
          <DialogDescription>
            {target.employeeName} · {target.employeeId} · {formatIstDate(target.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-md border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          <div className="flex justify-between gap-3">
            <span>Punch in</span>
            <span className="font-medium text-foreground">{punchIn}</span>
          </div>
          <div className="mt-1 flex justify-between gap-3">
            <span>Punch out</span>
            <span className="font-medium text-foreground">{punchOut}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setValue("attendanceStatus", value, { shouldValidate: true })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.attendanceStatus && (
              <p className="text-xs text-destructive">{errors.attendanceStatus.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea
              {...register("remarks")}
              placeholder="Why is this attendance being changed?"
              rows={3}
              maxLength={500}
            />
            {errors.remarks && (
              <p className="text-xs text-destructive">{errors.remarks.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
