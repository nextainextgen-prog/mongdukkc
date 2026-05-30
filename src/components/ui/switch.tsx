"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked, defaultChecked, onCheckedChange, disabled, className, id, name }, ref) => {
    const [internal, setInternal] = React.useState(defaultChecked ?? false);
    const isControlled = checked !== undefined;
    const value = isControlled ? checked : internal;
    return (
      <button
        ref={ref}
        id={id}
        name={name}
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => {
          const next = !value;
          if (!isControlled) setInternal(next);
          onCheckedChange?.(next);
        }}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          value ? "bg-primary" : "bg-muted",
          className,
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
            value ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    );
  },
);
Switch.displayName = "Switch";
