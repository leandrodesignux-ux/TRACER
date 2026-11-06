import { addDays, demoToday, toDateKey } from "@/lib/data/date";

export type ExperimentStatus =
  | "draft"
  | "running"
  | "ready_to_read"
  | "decided";

export type DemoExperiment = {
  id: string;
  name: string;
  status: ExperimentStatus;
  startedAt: string;
  endedAt: string;
  durationWeeks: number;
  metric: string;
  controlRate: number;
  variantRate: number;
  confidenceInterval: [number, number];
  result: "inconclusive" | "positive" | "negative";
  recommendation: "iterate" | "scale" | "discard";
};

export function createExperiments(asOf: Date = new Date()): DemoExperiment[] {
  const today = demoToday(asOf);
  const ended = addDays(today, -35);
  return [
    {
      id: "single-step-form",
      name: "Formulario en un solo paso",
      status: "ready_to_read",
      startedAt: toDateKey(addDays(ended, -20)),
      endedAt: toDateKey(ended),
      durationWeeks: 3,
      metric: "Formulario iniciado → completado",
      controlRate: 0.49,
      variantRate: 0.51,
      confidenceInterval: [-0.03, 0.07],
      result: "inconclusive",
      recommendation: "iterate",
    },
  ];
}
