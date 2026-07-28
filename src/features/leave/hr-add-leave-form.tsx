"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, ChevronsUpDown, Search, Calendar } from "lucide-react";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { EmptyState } from "@/components/feedback/empty-state";
import { PageLoader } from "@/components/feedback/loading-spinner";
import { cn } from "@/lib/utils";
import {
  useBulkCreditLeaveBalanceMutation,
  useCreditLeaveBalanceMutation,
} from "@/hooks/mutations/use-leave-mutations";
import { useLeaveTypeOptions } from "@/hooks/queries/use-leave-type-options";
import { useEmployeesQuery } from "@/hooks/queries/use-employees-queries";
import type { BulkCreditLeaveBalanceResult } from "@/types/leave";

const creditFieldsSchema = z.object({
  leaveTypeCode: z.string().min(1, "Leave type is required"),
  totalDays: z.number().min(0.5, "Minimum 0.5 days"),
  reason: z.string().min(3, "Reason must be at least 3 characters").max(1000),
});

const singleSchema = creditFieldsSchema.extend({
  employeeProfileId: z.string().min(1, "Employee is required"),
});

const bulkSchema = creditFieldsSchema.extend({
  employeeProfileIds: z.array(z.string()).min(1, "Select at least one employee"),
});

type SingleFormValues = z.infer<typeof singleSchema>;
type BulkFormValues = z.infer<typeof bulkSchema>;

type LeaveOption = { code: string; name: string; leaveType: string };
type EmployeeRow = { id: string; fullName: string; employeeId: string; email?: string | null };

function CreditFields({
  register,
  setValue,
  watch,
  errors,
  options,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setValue: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  watch: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any;
  options: LeaveOption[];
}) {
  const leaveTypeCode = watch("leaveTypeCode");

  return (
    <>
      <div className="space-y-2">
        <Label>Leave Type</Label>
        <Select
          value={leaveTypeCode}
          onValueChange={(v) => setValue("leaveTypeCode", v, { shouldValidate: true })}
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

      <div className="space-y-2">
        <Label>Days to credit</Label>
        <Input
          type="number"
          step="0.5"
          min="0.5"
          placeholder="e.g. 1"
          {...register("totalDays", {
            setValueAs: (v: string) => (v === "" || v == null ? undefined : Number(v)),
          })}
        />
        <p className="text-xs text-muted-foreground">
          This adds days to the employee&apos;s leave balance (0 → 1, 1 → 2). It does not apply or
          deduct leave.
        </p>
        {errors.totalDays && (
          <p className="text-xs text-destructive">{errors.totalDays.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Reason</Label>
        <Textarea {...register("reason")} rows={3} placeholder="Opening balance / adjustment…" />
        {errors.reason && <p className="text-xs text-destructive">{errors.reason.message}</p>}
      </div>
    </>
  );
}

function SingleCreditForm({ options, employees }: { options: LeaveOption[]; employees: EmployeeRow[] }) {
  const creditMutation = useCreditLeaveBalanceMutation();
  const [employeeOpen, setEmployeeOpen] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SingleFormValues>({
    resolver: zodResolver(singleSchema),
    defaultValues: {
      employeeProfileId: "",
      leaveTypeCode: "",
      reason: "",
    },
  });

  const employeeProfileId = watch("employeeProfileId");
  const selectedEmployee = employees.find((e) => e.id === employeeProfileId);
  const selectedOption = options.find((t) => t.code === watch("leaveTypeCode"));

  const onSubmit = (values: SingleFormValues) => {
    if (!selectedOption) return;
    creditMutation.mutate(
      {
        employeeProfileId: values.employeeProfileId,
        leaveType: selectedOption.leaveType,
        leaveTypeCode: selectedOption.code,
        totalDays: values.totalDays,
        reason: values.reason,
      },
      {
        onSuccess: () =>
          reset({
            employeeProfileId: "",
            leaveTypeCode: "",
            reason: "",
            totalDays: undefined,
          }),
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>Employee</Label>
        <Popover open={employeeOpen} onOpenChange={setEmployeeOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              role="combobox"
              className="w-full justify-between font-normal"
            >
              {selectedEmployee
                ? `${selectedEmployee.fullName} (${selectedEmployee.employeeId})`
                : "Select employee…"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search by name or ID…" />
              <CommandList>
                <CommandEmpty>No employee found.</CommandEmpty>
                <CommandGroup>
                  {employees.map((employee) => (
                    <CommandItem
                      key={employee.id}
                      value={`${employee.fullName} ${employee.employeeId} ${employee.email ?? ""}`}
                      onSelect={() => {
                        setValue("employeeProfileId", employee.id, { shouldValidate: true });
                        setEmployeeOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          employeeProfileId === employee.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="truncate">
                        <span className="font-medium">{employee.fullName}</span>
                        <span className="ml-1 text-muted-foreground">({employee.employeeId})</span>
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.employeeProfileId && (
          <p className="text-xs text-destructive">{errors.employeeProfileId.message}</p>
        )}
      </div>

      <CreditFields
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
        options={options}
      />

      <Button type="submit" isLoading={creditMutation.isPending} className="w-full">
        Credit Leave Balance
      </Button>
    </form>
  );
}

function BulkCreditForm({ options, employees }: { options: LeaveOption[]; employees: EmployeeRow[] }) {
  const bulkMutation = useBulkCreditLeaveBalanceMutation();
  const [search, setSearch] = useState("");
  const [bulkResult, setBulkResult] = useState<BulkCreditLeaveBalanceResult | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BulkFormValues>({
    resolver: zodResolver(bulkSchema),
    defaultValues: {
      employeeProfileIds: [],
      leaveTypeCode: "",
      reason: "",
    },
  });

  const selectedIds = watch("employeeProfileIds") ?? [];
  const selectedOption = options.find((t) => t.code === watch("leaveTypeCode"));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter(
      (e) =>
        e.fullName.toLowerCase().includes(q) ||
        e.employeeId.toLowerCase().includes(q) ||
        e.email?.toLowerCase().includes(q)
    );
  }, [employees, search]);

  const employeeNameById = useMemo(() => {
    const map = new Map<string, string>();
    employees.forEach((e) => map.set(e.id, `${e.fullName} (${e.employeeId})`));
    return map;
  }, [employees]);

  const toggle = (id: string, checked: boolean) => {
    const next = checked
      ? Array.from(new Set([...selectedIds, id]))
      : selectedIds.filter((x) => x !== id);
    setValue("employeeProfileIds", next, { shouldValidate: true });
  };

  const onSubmit = (values: BulkFormValues) => {
    if (!selectedOption) return;
    setBulkResult(null);
    bulkMutation.mutate(
      {
        employeeProfileIds: values.employeeProfileIds,
        leaveType: selectedOption.leaveType,
        leaveTypeCode: selectedOption.code,
        totalDays: values.totalDays,
        reason: values.reason,
      },
      {
        onSuccess: (result) => {
          setBulkResult(result);
          if (result.failed === 0) {
            reset({
              employeeProfileIds: [],
              leaveTypeCode: "",
              reason: "",
              totalDays: undefined,
            });
          }
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Label>Employees</Label>
          <p className="text-xs text-muted-foreground">{selectedIds.length} selected</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Search employees…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setValue(
                "employeeProfileIds",
                Array.from(new Set([...selectedIds, ...filtered.map((e) => e.id)])),
                { shouldValidate: true }
              )
            }
          >
            Select shown
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              const remove = new Set(filtered.map((e) => e.id));
              setValue(
                "employeeProfileIds",
                selectedIds.filter((id) => !remove.has(id)),
                { shouldValidate: true }
              );
            }}
          >
            Clear shown
          </Button>
        </div>
        <div className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2">
          {filtered.map((employee) => {
            const checked = selectedIds.includes(employee.id);
            return (
              <label
                key={employee.id}
                className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(value) => toggle(employee.id, value === true)}
                />
                <span className="min-w-0 flex-1 truncate text-sm">
                  <span className="font-medium">{employee.fullName}</span>
                  <span className="ml-1 text-muted-foreground">({employee.employeeId})</span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.employeeProfileIds && (
          <p className="text-xs text-destructive">{errors.employeeProfileIds.message}</p>
        )}
      </div>

      <CreditFields
        register={register}
        setValue={setValue}
        watch={watch}
        errors={errors}
        options={options}
      />

      <Button type="submit" isLoading={bulkMutation.isPending} className="w-full">
        Credit Leave Balance for Selected
      </Button>

      {bulkResult && (
        <Alert variant={bulkResult.failed > 0 ? "destructive" : "default"}>
          <AlertTitle>
            {bulkResult.success} succeeded · {bulkResult.failed} failed
          </AlertTitle>
          {bulkResult.errors.length > 0 && (
            <AlertDescription>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm">
                {bulkResult.errors.map((err) => (
                  <li key={err.employeeProfileId}>
                    <span className="font-medium">
                      {employeeNameById.get(err.employeeProfileId) ?? err.employeeProfileId}
                    </span>
                    : {err.message}
                  </li>
                ))}
              </ul>
            </AlertDescription>
          )}
          {bulkResult.credits.length > 0 && bulkResult.failed > 0 && (
            <AlertDescription className="mt-2 text-sm">
              Credited:{" "}
              {bulkResult.credits
                .map(
                  (c) =>
                    `${employeeNameById.get(c.employeeProfileId) ?? c.employeeProfileId} (${c.previousBalance}→${c.balance})`
                )
                .join(", ")}
            </AlertDescription>
          )}
        </Alert>
      )}
    </form>
  );
}

export function HrAddLeaveForm() {
  const { options, isLoading, policyError } = useLeaveTypeOptions();
  const { data: employeesData, isLoading: employeesLoading } = useEmployeesQuery({
    page: 1,
    limit: 200,
    sort: "firstName",
    status: "active",
  });

  const employees = employeesData?.data ?? [];

  if (isLoading || employeesLoading) return <PageLoader />;

  if (!options.length) {
    return (
      <EmptyState
        icon={Calendar}
        title="No leave types available"
        description={
          policyError
            ? "Leave policy could not be loaded. Configure leave policy before crediting balance."
            : "No leave types are configured for your company yet."
        }
      />
    );
  }

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>Add Leave Balance</CardTitle>
        <CardDescription>
          Credit leave days to an employee&apos;s balance (e.g. 0 → 2). This does not create a leave
          request or mark attendance.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {policyError && (
          <Alert className="mb-4">
            <AlertDescription>
              Full policy details are unavailable. Showing leave types from available balances.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="single">
          <TabsList className="mb-4">
            <TabsTrigger value="single">Single employee</TabsTrigger>
            <TabsTrigger value="bulk">Bulk credit</TabsTrigger>
          </TabsList>
          <TabsContent value="single">
            <SingleCreditForm options={options} employees={employees} />
          </TabsContent>
          <TabsContent value="bulk">
            <BulkCreditForm options={options} employees={employees} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
