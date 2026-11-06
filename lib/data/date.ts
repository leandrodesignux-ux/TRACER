import type { DateRange, PeriodId } from "@/lib/data/types";

/** Reloj estable del prototipo: mantiene el prerender determinista. */
export const DEMO_AS_OF = new Date("2026-11-06T12:00:00-03:00");

/** Normaliza el reloj a mediodía local para evitar saltos por horario de verano. */
export function demoToday(asOf: Date = new Date()) {
  return new Date(
    asOf.getFullYear(),
    asOf.getMonth(),
    asOf.getDate(),
    12,
  );
}

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function rollingRange(asOf: Date, days: number): DateRange {
  const end = demoToday(asOf);
  return {
    start: toDateKey(addDays(end, -(days - 1))),
    end: toDateKey(end),
  };
}

export function periodDays(period: PeriodId) {
  if (period === "7d") return 7;
  if (period === "28d") return 28;
  return 90;
}

export function formatDateRange(range: DateRange) {
  const format = new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
  const start = new Date(`${range.start}T12:00:00Z`);
  const end = new Date(`${range.end}T12:00:00Z`);
  return `${format.format(start)} – ${format.format(end)}`;
}
