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
import { useApplyWfhMutation } from "@/hooks/mutations/use-wfh-mutations";
import { toLocalDateKey } from "@/lib/date/calendar";

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  reason: z.string().max(1000).optional(),
});

type FormValues = z.infer<typeof schema>;

function todayLocalKey() {
  return toLocalDateKey(new Date());
}

interface RaiseWfhFormProps {
  defaultDate?: string;
  onSuccess?: () => void;
}

export function RaiseWfhForm({ defaultDate, onSuccess }: RaiseWfhFormProps) {
  const applyMutation = useApplyWfhMutation();
  const {
    register,
    handleSubmit,
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

  useEffect(() => {
    if (defaultDate) setValue("date", toLocalDateKey(defaultDate));
  }, [defaultDate, setValue]);

  const onSubmit = (values: FormValues) => {
    const reason = values.reason?.trim();
    applyMutation.mutate(
      { date: values.date, ...(reason ? { reason } : {}) },
      {
        onSuccess: () => {
          reset({ date: values.date, reason: "" });
          onSuccess?.();
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Apply Work From Home</CardTitle>
        <CardDescription>
          Submit a request for manager approval. Once approved, that day&apos;s attendance is marked
          as work from home.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Date</Label>
            <Input type="date" {...register("date")} />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Reason (optional)</Label>
            <Textarea
              {...register("reason")}
              rows={3}
              placeholder="Optional note for this WFH day"
            />
            {errors.reason && (
              <p className="text-xs text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <Button type="submit" isLoading={applyMutation.isPending}>
            Apply WFH
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
