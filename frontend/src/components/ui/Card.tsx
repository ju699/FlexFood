import { cn } from "@/utils/cn";
import React from "react";

export default function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border border-gray-200 rounded-lg p-4 shadow-sm bg-white", className)} {...props} />;
}
