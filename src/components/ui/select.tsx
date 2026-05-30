"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Minimal native <select> styled to match the design system. We avoid a custom
 * combobox for now since forms are admin-only and short.
 */
export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "flex h-11 w-full appearance-none rounded-2xl border border-border bg-input/40 px-4 py-2 pr-8 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      style={{
        backgroundImage:
          "url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 fill=%27none%27 viewBox=%270 0 24 24%27 stroke=%27%238B1A23%27 stroke-width=%272.5%27%3e%3cpath stroke-linecap=%27round%27 stroke-linejoin=%27round%27 d=%27M19 9l-7 7-7-7%27/%3e%3c/svg%3e')",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.75rem center",
        backgroundSize: "1rem",
      }}
      {...props}
    >
      {children}
    </select>
  ),
);
Select.displayName = "Select";
