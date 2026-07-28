"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageLoader } from "@/components/feedback/loading-spinner";
import { Calendar, FileText, X } from "lucide-react";
import { useApplyLeaveMutation } from "@/hooks/mutations/use-leave-mutations";
import { useLeaveTypeOptions } from "@/hooks/queries/use-leave-type-options";
import { useRegularizationEligibilityQuery } from "@/hooks/queries/use-regularization-queries";
import { PolicyPreview } from "./policy-preview";

const PRESCRIPTION_ACCEPT = "image/jpeg,image/png,image/jpg,application/pdf";

function isMedicalLeave(code?: string, leaveType?: string) {
  const c = code?.toUpperCase();
  const t = leaveType?.toLowerCase();
  return c === "ML" || t === "medical_leave" || t === "medical leave";
}

const applyLeaveSchema = z
  .object({
    leaveTypeCode: z.string().min(1, "Leave type is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isHalfDay: z.boolean().optional(),
    halfDaySession: z.enum(["morning", "afternoon"]).optional(),
    reason: z.string().min(3, "Reason must be at least 3 characters").max(1000),
  })
  .refine((data) => !data.isHalfDay || !!data.halfDaySession, {
    message: "Select half-day session",
    path: ["halfDaySession"],
  });

type ApplyLeaveFormValues = z.infer<typeof applyLeaveSchema>;

interface ApplyLeaveFormProps {
  defaultDate?: string;
  variant?: "page" | "dialog";
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ApplyLeaveForm({
  defaultDate,
  variant = "page",
  onSuccess,
  onCancel,
}: ApplyLeaveFormProps = {}) {
  const { options, isLoading, balancesQuery, policyError } = useLeaveTypeOptions();
  const applyMutation = useApplyLeaveMutation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [prescriptionError, setPrescriptionError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leaveTypeCode: "",
      startDate: "",
      endDate: "",
      isHalfDay: false,
      reason: "",
    },
  });

  const leaveTypeCode = watch("leaveTypeCode");
  const startDate = watch("startDate");
  const isHalfDay = watch("isHalfDay");

  useEffect(() => {
    if (!defaultDate) return;
    setValue("startDate", defaultDate, { shouldValidate: true });
    setValue("endDate", defaultDate, { shouldValidate: true });
  }, [defaultDate, setValue]);

  const selectedOption = useMemo(
    () => options.find((t) => t.code === leaveTypeCode),
    [options, leaveTypeCode]
  );

  const selectedBalance = useMemo(
    () => balancesQuery.data?.find((b) => b.leaveTypeCode === leaveTypeCode),
    [balancesQuery.data, leaveTypeCode]
  );

  const medical = isMedicalLeave(selectedOption?.code, selectedOption?.leaveType);

  const { data: regEligibility } = useRegularizationEligibilityQuery(
    startDate,
    Boolean(startDate)
  );
  const regConflictWarn =
    Boolean(startDate) &&
    Boolean(regEligibility?.hasExistingRequest) &&
    ["pending", "approved"].includes(String(regEligibility?.existingStatus ?? "").toLowerCase());

  const clearPrescription = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPrescriptionFile(null);
    setPrescriptionError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onPickFile = (file: File | undefined) => {
    if (!file) return;
    const okType =
      ["image/jpeg", "image/png", "image/jpg", "application/pdf"].includes(file.type) ||
      /\.(jpe?g|png|pdf)$/i.test(file.name);
    if (!okType) {
      setPrescriptionError("Prescription must be a JPG, PNG, or PDF file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPrescriptionError("File must be 10MB or smaller");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPrescriptionError(null);
    setPrescriptionFile(file);
    if (file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const onSubmit = (values: ApplyLeaveFormValues) => {
    const type = selectedOption;
    if (!type) return;

    if (isMedicalLeave(type.code, type.leaveType) && !prescriptionFile) {
      setPrescriptionError("Prescription is required for medical leave");
      return;
    }

    applyMutation.mutate(
      {
        leaveType: type.leaveType,
        leaveTypeCode: type.code,
        startDate: values.startDate,
        endDate: values.endDate,
        isHalfDay: values.isHalfDay,
        halfDaySession: values.halfDaySession,
        reason: values.reason,
        ...(prescriptionFile && isMedicalLeave(type.code, type.leaveType)
          ? { prescriptionFile }
          : {}),
      },
      {
        onSuccess: () => {
          clearPrescription();
          reset({
            leaveTypeCode: "",
            startDate: defaultDate ?? "",
            endDate: defaultDate ?? "",
            isHalfDay: false,
            reason: "",
          });
          onSuccess?.();
        },
      }
    );
  };

  if (isLoading) return <PageLoader />;

  if (!options.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="No leave types available"
        description={
          policyError
            ? "Leave policy could not be loaded and no leave balances were found. Contact HR to configure leave policy or credit balances."
            : "No leave types are configured for your company yet. Contact HR to set up leave policy and balances."
        }
      />
    );
  }

  const formBody = (
    <>
      {policyError && (
        <Alert className={variant === "page" ? "lg:col-span-2" : ""}>
          <AlertDescription>
            Full policy details are unavailable. Showing leave types from your available balances.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Apply Leave</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Leave Type</Label>
              <Select
                value={leaveTypeCode}
                onValueChange={(v) => {
                  setValue("leaveTypeCode", v, { shouldValidate: true });
                  if (!isMedicalLeave(v, options.find((o) => o.code === v)?.leaveType)) {
                    clearPrescription();
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select leave type" />
                </SelectTrigger>
                <SelectContent>
                  {options.map((t) => (
                    <SelectItem key={t.code} value={t.code}>
                      {t.name} ({t.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.leaveTypeCode && (
                <p className="text-xs text-destructive">{errors.leaveTypeCode.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" {...register("startDate")} />
                {errors.startDate && (
                  <p className="text-xs text-destructive">{errors.startDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" {...register("endDate")} />
                {errors.endDate && (
                  <p className="text-xs text-destructive">{errors.endDate.message}</p>
                )}
              </div>
            </div>

            {regConflictWarn && (
              <Alert variant="destructive">
                <AlertDescription>
                  Regularization is already {regEligibility?.existingStatus} for{" "}
                  {startDate}. Applying leave on this date may be rejected.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center gap-2">
              <Checkbox
                id="isHalfDay"
                checked={!!isHalfDay}
                onCheckedChange={(v) => setValue("isHalfDay", !!v)}
              />
              <Label htmlFor="isHalfDay">Half day</Label>
            </div>

            {isHalfDay && (
              <div className="space-y-2">
                <Label>Session</Label>
                <Select
                  onValueChange={(v) =>
                    setValue("halfDaySession", v as "morning" | "afternoon")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Morning or afternoon" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning</SelectItem>
                    <SelectItem value="afternoon">Afternoon</SelectItem>
                  </SelectContent>
                </Select>
                {errors.halfDaySession && (
                  <p className="text-xs text-destructive">{errors.halfDaySession.message}</p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea {...register("reason")} rows={4} />
              {errors.reason && (
                <p className="text-xs text-destructive">{errors.reason.message}</p>
              )}
            </div>

            {medical && (
              <div className="space-y-2">
                <Label>Prescription (required)</Label>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept={PRESCRIPTION_ACCEPT}
                  onChange={(e) => onPickFile(e.target.files?.[0])}
                />
                <p className="text-xs text-muted-foreground">JPG, PNG, or PDF · max 10MB</p>
                {prescriptionFile && (
                  <div className="flex items-start gap-3 rounded-md border p-3">
                    {previewUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Prescription preview"
                        className="h-16 w-16 rounded object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded bg-muted">
                        <FileText className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{prescriptionFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(prescriptionFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={clearPrescription}
                      aria-label="Remove prescription"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {prescriptionError && (
                  <p className="text-xs text-destructive">{prescriptionError}</p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {variant === "dialog" && onCancel && (
                <Button type="button" variant="outline" className="w-full" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" isLoading={applyMutation.isPending} className="w-full">
                Submit Leave Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <PolicyPreview leaveType={selectedOption?.config} balance={selectedBalance} />
    </>
  );

  if (variant === "dialog") {
    return <div className="grid gap-6 lg:grid-cols-2">{formBody}</div>;
  }

  return <div className="grid gap-6 lg:grid-cols-2">{formBody}</div>;
}
