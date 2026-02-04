import { cn } from "@/utils/cn";
import React from "react";

export default function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("w-full border rounded px-3 py-2 focus:ring-2 focus:ring-red-500 outline-none", className)} {...props} />;
}
