import { cn } from "@/utils/cn";
import React from "react";

export default function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border rounded-lg p-4 shadow-sm bg-[var(--card-bg)] border-[var(--card-border)]", className)} {...props} />;
}
