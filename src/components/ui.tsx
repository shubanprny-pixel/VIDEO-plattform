import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-sm text-sm font-medium tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40";

const variants = {
  primary: "bg-indigo px-4 py-2 text-paper hover:bg-indigo-soft",
  secondary:
    "border border-ink/30 px-4 py-2 text-ink hover:border-indigo hover:text-indigo",
  ghost: "px-1 py-1 text-ink-soft underline-offset-4 hover:text-indigo hover:underline",
  danger: "px-1 py-1 text-stamp underline-offset-4 hover:underline",
} as const;

export type ButtonVariant = keyof typeof variants;

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { variant?: ButtonVariant }) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export function LinkButton({
  variant = "primary",
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof Link> & { variant?: ButtonVariant }) {
  return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function Card({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={`rounded-sm border border-rule bg-paper-raised ${className}`}
      {...props}
    />
  );
}

/** Hanko-style completion seal — a red double-ring stamp bearing 済 ("settled/done"). */
export function Stamp({
  size = "sm",
  label = "済",
  className = "",
}: {
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const dim = size === "sm" ? "h-6 w-6 text-[10px]" : "h-9 w-9 text-sm";
  return (
    <span
      aria-hidden="true"
      className={`inline-flex ${dim} shrink-0 -rotate-6 items-center justify-center rounded-full border-[3px] border-double border-stamp font-display font-bold text-stamp ${className}`}
    >
      {label}
    </span>
  );
}

/** Two-digit monospace index used for numbering real sequential content (sections, lessons). */
export function IndexNumber({
  n,
  className = "",
}: {
  n: number;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-xs tabular-nums text-indigo-soft ${className}`}
    >
      {String(n).padStart(2, "0")}
    </span>
  );
}

export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-mono text-xs tracking-[0.2em] text-muted uppercase ${className}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  active,
  activeLabel,
  inactiveLabel,
}: {
  active: boolean;
  activeLabel: string;
  inactiveLabel: string;
}) {
  return (
    <span
      className={
        active
          ? "rounded-sm border border-indigo/30 bg-indigo/10 px-2 py-0.5 font-mono text-xs text-indigo"
          : "rounded-sm border border-rule px-2 py-0.5 font-mono text-xs text-muted"
      }
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
