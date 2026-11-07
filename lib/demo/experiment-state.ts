import {
  getDemoExperimentOutcome,
  getExperiments,
  getFunnel,
  type CalculationDetails,
  type DataSource,
} from "@/lib/ai/tools";
import type { ExperimentPlanResponseBlock } from "@/lib/demo/responses";
import { readStored, writeStored } from "@/lib/storage";

export type BoardExperimentStatus =
  | "draft"
  | "running"
  | "ready_to_read"
  | "decided";

export type ExperimentDecision = "scale" | "iterate" | "discard";

export type StoredExperiment = {
  id: string;
  name: string;
  status: BoardExperimentStatus;
  hypothesis: string;
  change: string;
  primaryMetric: string;
  guardrail: string;
  segment: string;
  minimumEffect: number;
  baselineRate: number;
  weeklyTraffic: number;
  durationWeeks: number;
  totalSample: number;
  source: DataSource | DataSource[];
  calculation?: CalculationDetails;
  result?: {
    controlRate: number;
    variantRate: number;
    confidenceInterval: [number, number];
    outcome: "inconclusive" | "positive" | "negative";
  };
  decision?: ExperimentDecision;
  decidedAt?: string;
};

function tracerSource(): DataSource {
  return {
    id: "tracer",
    label: "Tracer",
    query: "experimento creado por la usuaria",
    rango: "Estado actual del workspace",
    muestra: "1 experimento",
  };
}

export function getPreviousBoardExperiment(asOf?: Date): StoredExperiment {
  const previous = getExperiments({ status: "ready_to_read", asOf });
  const previousFunnel = getFunnel({ asOf });
  const previousItem = previous.data[0]!;
  const previousSource = Array.isArray(previous.source)
    ? previous.source[0]!
    : previous.source;
  const previousWeeklyTraffic = previousFunnel.data.stages.find(
    (stage) => stage.id === "demo_form_completed",
  )!.current;

  return {
    id: previousItem.id,
    name: previousItem.name,
    status: previousItem.status,
    hypothesis:
      "Si mostramos el formulario en un solo paso, aumentará la finalización porque reducimos la fricción percibida.",
    change: "Unificar los pasos del formulario de demo.",
    primaryMetric: previousItem.metric,
    guardrail: "Calidad del lead",
    segment: "Todo el tráfico",
    minimumEffect: 0.05,
    baselineRate: previousItem.controlRate,
    weeklyTraffic: previousWeeklyTraffic,
    durationWeeks: previousItem.durationWeeks,
    totalSample: previousItem.durationWeeks * previousWeeklyTraffic,
    source: previousSource,
    calculation: previous.calculation,
    result: {
      controlRate: previousItem.controlRate,
      variantRate: previousItem.variantRate,
      confidenceInterval: previousItem.confidenceInterval,
      outcome: previousItem.result,
    },
  };
}

export function experimentFromPlan(
  block: ExperimentPlanResponseBlock,
): StoredExperiment {
  return {
    id: "agenda-integrada",
    name: block.name,
    status: "draft",
    hypothesis: block.hypothesis,
    change: "Integrar la selección de horario dentro del formulario.",
    primaryMetric: block.primaryMetric,
    guardrail: block.guardrail,
    segment: block.segment,
    minimumEffect: block.estimate.minimumEffect,
    baselineRate: block.estimate.baselineRate,
    weeklyTraffic: block.estimate.weeklyTraffic,
    durationWeeks: block.estimate.weeks,
    totalSample: block.estimate.totalSample,
    source: [tracerSource(), block.source],
    calculation: block.calculation,
  };
}

export function persistExperiment(experiment: StoredExperiment) {
  const stored = readStored<StoredExperiment[]>("saved-experiments", []);
  writeStored("saved-experiments", [
    experiment,
    ...stored.filter((item) => item.id !== experiment.id),
  ]);
}

export function advanceExperiment(experiment: StoredExperiment, asOf?: Date) {
  const outcome = getDemoExperimentOutcome({
    baselineRate: experiment.baselineRate,
    asOf,
  });
  return {
    ...experiment,
    status: "ready_to_read" as const,
    source: [
      ...(Array.isArray(experiment.source) ? experiment.source : [experiment.source]),
      outcome.source,
    ],
    calculation: outcome.calculation,
    result: {
      controlRate: outcome.data.controlRate,
      variantRate: outcome.data.variantRate,
      confidenceInterval: outcome.data.confidenceInterval,
      outcome: outcome.data.result,
    },
  };
}
