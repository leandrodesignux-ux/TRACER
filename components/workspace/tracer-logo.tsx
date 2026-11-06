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

/** Marca: el glifo sobre un cuadrado con degradado de primary a lavanda. */
export function TracerBadge({
  size = "md",
  className,
}: {
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center bg-linear-to-br from-brand-from to-brand-to text-primary-foreground shadow-xs",
        size === "md" && "size-7 rounded-lg [&>svg]:size-[18px]",
        size === "lg" && "size-9 rounded-xl [&>svg]:size-6",
        className,
      )}
    >
      <TracerMark />
    </span>
  );
}

export function TracerLogo({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <TracerBadge />
      <span className="font-heading text-lg font-semibold tracking-heading">
        Tracer
      </span>
    </span>
  );
}
