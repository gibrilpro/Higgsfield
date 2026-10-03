"use client";
import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({ children, pending, className = "btn primary", name, value }: { children: ReactNode; pending?: string; className?: string; name?: string; value?: string }) {
  const { pending: isPending } = useFormStatus();
  return (
    <button className={className} type="submit" disabled={isPending} name={name} value={value} aria-busy={isPending}>
      {isPending && pending ? pending : children}
    </button>
  );
}
