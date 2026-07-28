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
import { TimePicker } from "@/components/ui/time-picker";
import { useRegularizationEligibilityQuery } from "@/hooks/queries/use-regularization-queries";
import { useRaiseRegularizationMutation } from "@/hooks/mutations/use-regularization-mutations";
import {
  combineDateAndTimeToIso,
  formatLateBy,
  formatRegularizationDate,
  formatRegularizationPunchTime,
  formatStatusLabel,
} from "@/lib/regularization/format";
import { getErrorMessage } from "@/services/api/error-handler";
import { toLocalDateKey } from "@/lib/date/calendar";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(1000),
  requestedPunchIn: z.string().optional(),
  requestedPunchOut: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function todayLocalKey() {
  return toLocalDateKey(new Date());
}

interface RaiseRegularizationFormProps {
  defaultDate?: string;
  variant?: "card" | "dialog";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RaiseRegularizationForm({
  defaultDate,
  variant = "card",
  onSuccess,
  onCancel,
}: RaiseRegularizationFormProps) {
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
      requestedPunchIn: "",
      requestedPunchOut: "",
    },
  });

  const date = watch("date");
  const requestedPunchIn = watch("requestedPunchIn");
  const requestedPunchOut = watch("requestedPunchOut");

  useEffect(() => {
    if (defaultDate) {
      setValue("date", toLocalDateKey(defaultDate));
    }
  }, [defaultDate, setValue]);

  const {
    data: eligibility,
    isLoading,
    isFetching,
    isError,
    error,
  } = useRegularizationEligibilityQuery(date);
  const raiseMutation = useRaiseRegularizationMutation();

  const canSubmit = Boolean(eligibility?.isEligible && !eligibility.hasExistingRequest);

  const onSubmit = (values: FormValues) => {
    raiseMutation.mutate(
      {
        date: values.date,
        reason: values.reason,
        requestedPunchIn: combineDateAndTimeToIso(values.date, values.requestedPunchIn),
        requestedPunchOut: combineDateAndTimeToIso(values.date, values.requestedPunchOut),
      },
      {
        onSuccess: () => {
          reset({
            date: values.date,
            reason: "",
            requestedPunchIn: "",
            requestedPunchOut: "",
          });
          onSuccess?.();
        },
      }
    );
  };

  const formBody = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="regularization-date">Attendance date</Label>
        <Input id="regularization-date" type="date" {...register("date")} />
        {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
      </div>

      {(isLoading || isFetching) && <Skeleton className="h-32" />}

      {isError && (
        <Alert variant="destructive">
          <AlertDescription>{getErrorMessage(error)}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && eligibility && (
        <div className="space-y-3">
          <div className="grid gap-2 rounded-md border bg-muted/30 p-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Policy window</p>
              <p className="font-medium">
                {eligibility.windowDisplay ??
                  (eligibility.policy?.windowStart && eligibility.policy?.windowEnd
                    ? `${eligibility.policy.windowStart} – ${eligibility.policy.windowEnd}`
                    : "—")}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Punch in</p>
              <p className="font-medium">
                {formatRegularizationPunchTime(
                  eligibility.punchInAt,
                  eligibility.punchInDisplay
                )}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Late by</p>
              <p className="font-medium">{formatLateBy(eligibility.lateByMinutes)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Original status</p>
              <p className="font-medium capitalize">
                {formatStatusLabel(eligibility.originalStatus)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Remaining this month</p>
              <p className="font-medium">
                {eligibility.remaining ?? "—"}
                {eligibility.policy?.monthlyLimit != null
                  ? ` of ${eligibility.policy.monthlyLimit}`
                  : ""}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Used this month</p>
              <p className="font-medium">{eligibility.usedThisMonth ?? "—"}</p>
            </div>
            <div className="sm:col-span-2 text-xs text-muted-foreground">
              Date: {formatRegularizationDate(eligibility.date)}
              {eligibility.policy?.exceedingAction
                ? ` · Over limit → ${formatStatusLabel(eligibility.policy.exceedingAction)}`
                : ""}
            </div>
          </div>

          {eligibility.message && (
            <Alert variant={canSubmit ? "default" : "destructive"}>
              <AlertDescription>{eligibility.message}</AlertDescription>
            </Alert>
          )}

          {eligibility.hasExistingRequest && !eligibility.message && (
            <Alert>
              <AlertDescription>
                A {eligibility.existingStatus ?? "existing"} request already exists for this date.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Corrected punch in (optional)</Label>
          <TimePicker
            value={requestedPunchIn || undefined}
            onChange={(time) => setValue("requestedPunchIn", time)}
            placeholder="Use actual punch in"
            disabled={!canSubmit}
          />
        </div>
        <div className="space-y-2">
          <Label>Corrected punch out (optional)</Label>
          <TimePicker
            value={requestedPunchOut || undefined}
            onChange={(time) => setValue("requestedPunchOut", time)}
            placeholder="Use actual punch out"
            disabled={!canSubmit}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="regularization-reason">Reason</Label>
        <Textarea
          id="regularization-reason"
          {...register("reason")}
          rows={3}
          placeholder="Why should this attendance be regularized?"
          disabled={!canSubmit && !isLoading}
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
          disabled={!canSubmit || isLoading || isFetching}
          isLoading={raiseMutation.isPending}
        >
          Submit regularization
        </Button>
      </div>
    </form>
  );

  if (variant === "dialog") {
    return (
      <div className="space-y-1 p-6">
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold">Raise regularization</h2>
          <p className="text-sm text-muted-foreground">
            Request correction when your punch-in falls in the company late window.
          </p>
        </div>
        {formBody}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Raise regularization</CardTitle>
        <CardDescription>
          Request correction when your punch-in falls in the company late window. Eligibility and
          monthly limits come from company policy.
        </CardDescription>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
