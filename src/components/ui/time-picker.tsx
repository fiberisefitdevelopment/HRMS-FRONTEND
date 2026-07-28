"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TimePickerProps {
  value?: string;
  onChange?: (time: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  const period = hours < 12 ? "AM" : "PM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const value = `${String(hours).padStart(2, "0")}:${minutes}`;
  const label = `${displayHours}:${minutes} ${period}`;
  return { value, label };
});

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled,
  className,
}: TimePickerProps) {
  const displayValue = TIME_OPTIONS.find((t) => t.value === value)?.label ?? value;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="max-h-[240px] overflow-y-auto p-1">
          {TIME_OPTIONS.map((time) => (
            <button
              key={time.value}
              type="button"
              className={cn(
                "flex w-full rounded-sm px-3 py-1.5 text-sm hover:bg-accent",
                value === time.value && "bg-accent font-medium"
              )}
              onClick={() => onChange?.(time.value)}
            >
              {time.label}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function TimeInput({
  value,
  onChange,
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative">
      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="time"
        value={value}
        onChange={onChange}
        className={cn("pl-9", className)}
        {...props}
      />
    </div>
  );
}
