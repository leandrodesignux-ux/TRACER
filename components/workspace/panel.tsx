"use client";

import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

/** Panel traslúcido del workspace: entra con un fundido corto. */
export function Panel({
  className,
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn(
        "rounded-2xl border border-panel-border bg-panel shadow-xs backdrop-blur-xl",
        className,
      )}
      {...props}
    />
  );
}
