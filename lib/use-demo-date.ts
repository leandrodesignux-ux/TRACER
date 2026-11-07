"use client";

import { useMemo, useSyncExternalStore } from "react";

import { addDays } from "@/lib/data/date";
import { useStored } from "@/lib/storage";

const PRERENDER_DATE = "2026-11-06";

function subscribe() {
  return () => undefined;
}

function clientDateKey() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Mantiene el HTML estático y actualiza los rangos al día local al hidratar. */
export function useDemoDate() {
  const dateKey = useSyncExternalStore(subscribe, clientDateKey, () => PRERENDER_DATE);
  const [demoState] = useStored<"current" | "future">("demo-state", "current");
  return useMemo(() => {
    const current = new Date(`${dateKey}T12:00:00`);
    return demoState === "future" ? addDays(current, 21) : current;
  }, [dateKey, demoState]);
}
