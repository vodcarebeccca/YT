import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-border bg-background-elevated text-slate-300",
        cyan: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
        green: "border-accent-green/30 bg-accent-green/10 text-accent-green",
        red: "border-accent-red/30 bg-accent-red/10 text-accent-red",
        amber: "border-accent-amber/30 bg-accent-amber/10 text-accent-amber",
        purple: "border-accent-purple/30 bg-accent-purple/10 text-accent-purple",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
