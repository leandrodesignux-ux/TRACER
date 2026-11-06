import { addDays, demoToday, toDateKey } from "@/lib/data/date";
import type { DateRange, SourceId } from "@/lib/data/types";

export type FunnelStageId =
  | "site_visit"
  | "pricing_view"
  | "demo_form_started"
  | "demo_form_completed"
  | "demo_scheduled"
  | "demo_completed"
  | "trial_active"
  | "paying_customer";

export type FunnelStage = {
  id: FunnelStageId;
  label: string;
  sourceId: SourceId;
};

export type FunnelWeek = {
  id: string;
  range: DateRange;
  values: Record<FunnelStageId, number>;
};

export const FUNNEL_STAGES: FunnelStage[] = [
  { id: "site_visit", label: "Visitas al sitio", sourceId: "ga4" },
  { id: "pricing_view", label: "Vista de precios", sourceId: "ga4" },
  {
    id: "demo_form_started",
    label: "Formulario de demo iniciado",
    sourceId: "ga4",
  },
  {
    id: "demo_form_completed",
    label: "Formulario completado",
    sourceId: "ga4",
  },
  { id: "demo_scheduled", label: "Demo agendada", sourceId: "crm" },
  { id: "demo_completed", label: "Demo realizada", sourceId: "crm" },
  { id: "trial_active", label: "Trial activo", sourceId: "crm" },
  { id: "paying_customer", label: "Cliente pagando", sourceId: "crm" },
];

const HISTORY: Record<FunnelStageId, number[]> = {
  site_visit: [11920, 12080, 12150, 12040, 12180, 12220, 12100, 12400],
  pricing_view: [2980, 3030, 3070, 3020, 3060, 3090, 3050, 3100],
  demo_form_started: [790, 800, 815, 805, 818, 825, 810, 820],
  demo_form_completed: [394, 400, 407, 401, 408, 411, 402, 410],
  demo_scheduled: [242, 246, 249, 244, 252, 247, 250, 205],
  demo_completed: [177, 179, 181, 178, 184, 180, 182, 150],
  trial_active: [86, 87, 89, 86, 90, 87, 88, 74],
  paying_customer: [23, 23, 24, 23, 25, 24, 24, 21],
};

export function createFunnelData(asOf: Date = new Date()) {
  const today = demoToday(asOf);
  const weeks: FunnelWeek[] = Array.from({ length: 8 }, (_, index) => {
    const weeksAgo = 7 - index;
    const end = addDays(today, -7 * weeksAgo);
    const start = addDays(end, -6);
    const values = Object.fromEntries(
      FUNNEL_STAGES.map((stage) => [stage.id, HISTORY[stage.id][index]]),
    ) as Record<FunnelStageId, number>;

    return {
      id: toDateKey(end),
      range: { start: toDateKey(start), end: toDateKey(end) },
      values,
    };
  });

  return { stages: FUNNEL_STAGES, weeks };
}
