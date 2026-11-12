import type { ComponentProps } from "react";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export type BadgeVariant = "verified" | "gold" | "neutral";

export type BadgeProps = ComponentProps<"span"> & {
  variant?: BadgeVariant;
};

const variantClasses: Record<BadgeVariant, string> = {
  verified: "bg-sage-green/10 text-sage-green",
  gold: "bg-amber-gold/15 text-espresso",
  neutral: "bg-sand-surface text-muted-cocoa",
};

export function Badge({
  variant = "neutral",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-none",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {variant === "verified" && (
        <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0" />
      )}
      {children}
    </span>
  );
}
