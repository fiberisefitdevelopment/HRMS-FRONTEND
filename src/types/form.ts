import type { Control, FieldValues, Path } from "react-hook-form";
import type { z } from "zod";

export interface FormFieldConfig<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox" | "switch" | "date" | "time";
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[];
  disabled?: boolean;
}

export interface DynamicFormProps<T extends FieldValues> {
  schema: z.ZodType<T>;
  fields: FormFieldConfig<T>[];
  onSubmit: (data: T) => void | Promise<void>;
  defaultValues?: Partial<T>;
  isLoading?: boolean;
  submitLabel?: string;
}

export type { Control, FieldValues };
