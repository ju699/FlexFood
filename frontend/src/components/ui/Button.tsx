"use client";
import { cn } from "@/utils/cn";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export default function Button({ className, variant = "ghost", ...rest }: Props) {
  const base = "px-4 py-2 rounded-md transition-colors";
  const styles =
    variant === "primary"
      ? "bg-[var(--color-primary)] text-white hover:bg-red-600"
      : "bg-transparent hover:bg-black/5";
  return <button className={cn(base, styles, className)} {...rest} />;
}
