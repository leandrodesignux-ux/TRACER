import { cn } from "@/lib/utils";

/** Ícono de Tracer: tres líneas que convergen en un punto y siguen como una sola. */
export function TracerMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn("size-5", className)}
    >
      <path d="M3 5c5 0 8 7 12 7" />
      <path d="M3 12h12" />
      <path d="M3 19c5 0 8-7 12-7" />
      <path d="M15 12h6" />
      <circle cx="15" cy="12" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TracerLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <TracerMark className="text-primary" />
      <span className="font-heading text-xl font-light tracking-tight">
        Tracer
      </span>
    </span>
  );
}
