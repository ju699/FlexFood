import { cn } from "@/utils/cn";
import React from "react";

export default function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return <span className={cn("px-2 py-1 rounded text-xs font-medium bg-black/5", className)}>{children}</span>;
}
