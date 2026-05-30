import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary",
        success: "bg-[color:var(--success)]/15 text-[color:var(--success)]",
        warning: "bg-[color:var(--warning)]/15 text-[color:var(--warning)]",
        destructive: "bg-destructive/15 text-destructive",
        secondary: "bg-secondary text-secondary-foreground",
        accent: "bg-accent/15 text-accent-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
