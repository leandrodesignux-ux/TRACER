import { addDays, demoToday, toDateKey } from "@/lib/data/date";

export type DemoAlert = {
  id: string;
  detectedAt: string;
  metric: string;
  segment: string;
  changePercent: number;
  severity: "high" | "medium" | "low";
  unread: boolean;
  prompt: string;
};

export function createAlerts(asOf: Date = new Date()): DemoAlert[] {
  const today = demoToday(asOf);
  return [
    {
      id: "demos-drop",
      detectedAt: `${toDateKey(today)}T10:00:00`,
      metric: "Demos agendadas",
      segment: "Todos",
      changePercent: -18,
      severity: "high",
      unread: true,
      prompt: "¿Por qué cayeron las demos agendadas esta semana?",
    },
    {
      id: "ios-drop",
      detectedAt: `${toDateKey(addDays(today, -1))}T16:00:00`,
      metric: "Formulario completado → demo agendada",
      segment: "Mobile iOS",
      changePercent: -38,
      severity: "high",
      unread: true,
      prompt: "¿Qué explica la caída del paso a demo en iOS?",
    },
    {
      id: "android-drop",
      detectedAt: `${toDateKey(addDays(today, -1))}T17:00:00`,
      metric: "Formulario completado → demo agendada",
      segment: "Mobile Android",
      changePercent: -15,
      severity: "medium",
      unread: true,
      prompt: "¿Cuánto cayó el paso a demo agendada en Android?",
    },
  ];
}
