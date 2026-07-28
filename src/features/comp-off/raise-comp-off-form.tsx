"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompOffEligibilityQuery } from "@/hooks/queries/use-comp-off-queries";
import { useRaiseCompOffMutation } from "@/hooks/mutations/use-comp-off-mutations";
import { getErrorMessage } from "@/services/api/error-handler";
import { formatLeaveDate } from "@/lib/leave/format";
import { toLocalDateKey } from "@/lib/date/calendar";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

function todayLocalKey() {
  return toLocalDateKey(new Date());
}

function formatMinutes(mins?: number) {
  if (mins == null) return "—";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  return m ? `${h}h ${m}m` : `${h}h`;
}

interface RaiseCompOffFormProps {
  defaultDate?: string;
  variant?: "card" | "dialog";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RaiseCompOffForm({
  defaultDate,
  variant = "card",
  onSuccess,
  onCancel,
}: RaiseCompOffFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: defaultDate ? toLocalDateKey(defaultDate) : todayLocalKey(),
      reason: "",
    },
  });

  const date = watch("date");

  useEffect(() => {
    if (defaultDate) setValue("date", toLocalDateKey(defaultDate));
  }, [defaultDate, setValue]);

  const {
    data: eligibility,
    isLoading,
    isFetching,
    isError,
    error,
  } = useCompOffEligibilityQuery(date);
  const raiseMutation = useRaiseCompOffMutation();

  const blockedReason = (() => {
    if (!eligibility) return null;
    if (eligibility.hasExistingRequest) {
      return `A ${eligibility.existingStatus ?? "existing"} request already exists for this date.`;
    }
    if (!eligibility.isEligible) {
      return "Need at least 1 hour after shift end to raise a comp-off.";
    }
    return null;
  })();

  const canSubmit = Boolean(eligibility?.isEligible && !eligibility.hasExistingRequest);

  const onSubmit = (values: FormValues) => {
    const reason = values.reason?.trim();
    raiseMutation.mutate(
      { date: values.date, ...(reason ? { reason } : {}) },
      {
        onSuccess: () => {
          reset({ date: values.date, reason: "" });
          onSuccess?.();
        },
      }
    );
  };

  const formBody = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Attendance date</Label>
        <Input type="date" {...register("date")} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      {(isLoading || isFetching) && <Skeleton className="h-28" />}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && eligibility && (
        <div className="grid gap-2 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Shift end</p>
            <p className="font-medium">
              {eligibility.shiftEndDisplay ??
                (eligibility.shiftEndTime
                  ? new Date(eligibility.shiftEndTime).toLocaleTimeString()
                  : "—")}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Punch out</p>
            <p className="font-medium">
              {eligibility.punchOutAt
                ? new Date(eligibility.punchOutAt).toLocaleTimeString()
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Overtime</p>
            <p className="font-medium">{formatMinutes(eligibility.overtimeMinutes)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Eligible credit</p>
            <p className="font-medium">
              {eligibility.eligibleDays > 0 ? `${eligibility.eligibleDays} day` : "Not eligible"}
            </p>
          </div>
          <div className="sm:col-span-2 text-xs text-muted-foreground">
            Date: {formatLeaveDate(eligibility.date)}
          </div>
        </div>
      )}

      {blockedReason && (
        <Alert>
          <AlertDescription>{blockedReason}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Reason (optional)</Label>
        <Textarea
          {...register("reason")}
          rows={3}
          placeholder="Why are you raising this comp-off? (optional)"
        />
        {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          className={onCancel ? "sm:min-w-40" : "w-full"}
          disabled={!canSubmit || isLoading}
          isLoading={raiseMutation.isPending}
        >
          Submit Comp-off Request
        </Button>
      </div>
    </form>
  );

  if (variant === "dialog") {
    return (
      <div className="space-y-1 p-6">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold">Raise Comp-off</h2>
          <p className="text-sm text-muted-foreground">
            Claim compensatory off for overtime (including work on week offs).
          </p>
        </div>
        {formBody}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raise Comp-off</CardTitle>
        <CardDescription>
          OT after shift end: &lt;1h not eligible · 1–4h = 0.5 day · ≥4h = 1 day. Manager approval
          credits COMP_OFF balance.
        </CardDescription>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
