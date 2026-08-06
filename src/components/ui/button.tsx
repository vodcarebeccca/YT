import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-accent-cyan text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:brightness-110",
        secondary:
          "bg-background-elevated text-slate-200 border border-border hover:border-accent-cyan/40 hover:bg-background-card",
        outline:
          "border border-border bg-transparent text-slate-200 hover:bg-background-card hover:border-accent-cyan/40",
        ghost: "text-slate-300 hover:bg-background-card hover:text-white",
        destructive:
          "bg-accent-red/90 text-white hover:bg-accent-red shadow-lg shadow-accent-red/20",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
