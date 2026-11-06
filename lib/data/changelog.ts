import { addDays, demoToday, toDateKey } from "@/lib/data/date";

export type ChangelogEntry = {
  id: string;
  date: string;
  title: string;
  detail: string;
  version?: string;
  area: "demo_form" | "pricing" | "analytics";
};

export function createChangelog(asOf: Date = new Date()): ChangelogEntry[] {
  const today = demoToday(asOf);
  return [
    {
      id: "calendar-2-3",
      date: toDateKey(addDays(today, -9)),
      title: "Widget de calendario v2.3 desplegado",
      detail: "Actualización del selector de horarios en el formulario de demo.",
      version: "2.3",
      area: "demo_form",
    },
    {
      id: "pricing-copy",
      date: toDateKey(addDays(today, -24)),
      title: "Copy de precios actualizado",
      detail: "Se aclaró la facturación por local en Chile y México.",
      area: "pricing",
    },
    {
      id: "ga4-event",
      date: toDateKey(addDays(today, -38)),
      title: "Evento demo_form_completed revisado",
      detail: "Validación del evento y sus parámetros de dispositivo y país.",
      area: "analytics",
    },
  ];
}
