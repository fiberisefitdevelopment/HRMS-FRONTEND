"use client";

import * as React from "react";
import {
  useForm,
  FormProvider,
  Controller,
  type FieldValues,
  type DefaultValues,
  type Path,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { TimeInput } from "@/components/ui/time-picker";
import { cn } from "@/lib/utils";
import type { FormFieldConfig } from "@/types/form";

interface FormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  fields: FormFieldConfig<T>[];
  onSubmit: (data: T) => void | Promise<void>;
  defaultValues?: DefaultValues<T>;
  isLoading?: boolean;
  submitLabel?: string;
  className?: string;
}

export function DynamicForm<T extends FieldValues>({
  schema,
  fields,
  onSubmit,
  defaultValues,
  isLoading,
  submitLabel = "Submit",
  className,
}: FormProps<T>) {
  const form = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  return (
    <FormProvider {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        {fields.map((field) => (
          <FormField
            key={String(field.name)}
            label={field.label}
            description={field.description}
            error={errors[field.name]?.message as string}
          >
            <DynamicField control={control} field={field} />
          </FormField>
        ))}
        <Button type="submit" isLoading={isLoading} className="w-full sm:w-auto">
          {submitLabel}
        </Button>
      </form>
    </FormProvider>
  );
}

interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormField({ label, description, error, children, className }: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label className={error ? "text-destructive" : ""}>{label}</Label>
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function DynamicField<T extends FieldValues>({
  control,
  field,
}: {
  control: ReturnType<typeof useForm<T>>["control"];
  field: FormFieldConfig<T>;
}) {
  return (
    <Controller
      control={control}
      name={field.name as Path<T>}
      render={({ field: formField }) => {
        switch (field.type) {
          case "textarea":
            return (
              <Textarea
                {...formField}
                placeholder={field.placeholder}
                disabled={field.disabled}
                value={formField.value ?? ""}
              />
            );
          case "select":
            return (
              <Select
                value={formField.value}
                onValueChange={formField.onChange}
                disabled={field.disabled}
              >
                <SelectTrigger>
                  <SelectValue placeholder={field.placeholder} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          case "checkbox":
            return (
              <Checkbox
                checked={formField.value}
                onCheckedChange={formField.onChange}
                disabled={field.disabled}
              />
            );
          case "switch":
            return (
              <Switch
                checked={formField.value}
                onCheckedChange={formField.onChange}
                disabled={field.disabled}
              />
            );
          case "date":
            return (
              <DatePicker
                value={formField.value}
                onChange={formField.onChange}
                placeholder={field.placeholder}
                disabled={field.disabled}
              />
            );
          case "time":
            return (
              <TimeInput
                value={formField.value}
                onChange={formField.onChange}
                disabled={field.disabled}
              />
            );
          default:
            return (
              <Input
                {...formField}
                type={field.type}
                placeholder={field.placeholder}
                disabled={field.disabled}
                value={formField.value ?? ""}
              />
            );
        }
      }}
    />
  );
}
