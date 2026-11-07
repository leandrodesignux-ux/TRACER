import { createAlerts, type DemoAlert } from "@/lib/data/alerts";
import { createChangelog } from "@/lib/data/changelog";
import { createCrmLeads } from "@/lib/data/crm-leads";
import { createDailyDemoTimeline } from "@/lib/data/daily-demos";
import {
  DEMO_AS_OF,
  demoToday,
  formatDateRange,
  periodDays,
  rollingRange,
} from "@/lib/data/date";
import { createExperiments, type ExperimentStatus } from "@/lib/data/experiments";
import {
  createFunnelData,
  type FunnelStageId,
} from "@/lib/data/funnel";
import { createSegmentData, type SegmentDimension } from "@/lib/data/segments";
import { createSessionsData } from "@/lib/data/sessions";
import {
  SOURCE_LABELS,
  type CountryId,
  type DeviceId,
  type PeriodId,
  type SourceId,
} from "@/lib/data/types";

export type DataSource = {
  id: SourceId;
  label: string;
  query: string;
  rango: string;
  muestra: string;
};

export type CalculationDetails = {
  label: string;
  formula: string;
  inputs: SourceId[];
};

export type ToolResult<T> = {
  data: T;
  source: DataSource | DataSource[];
  calculation?: CalculationDetails;
};

type CommonFilters = {
  period?: PeriodId;
  asOf?: Date;
};

function source(
  id: SourceId,
  query: string,
  range: ReturnType<typeof rollingRange>,
  sample: string,
): DataSource {
  return {
    id,
    label: SOURCE_LABELS[id],
    query,
    rango: formatDateRange(range),
    muestra: sample,
  };
}

function conversion(completed: number, scheduled: number) {
  return completed === 0 ? 0 : scheduled / completed;
}

function percentChange(current: number, previous: number) {
  return previous === 0 ? 0 : Math.round(((current - previous) / previous) * 100);
}

export function getFunnel(
  filters: CommonFilters & { segment?: DeviceId | "all" } = {},
) {
  const period = filters.period ?? "7d";
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const dataset = createFunnelData(asOf);
  const historySize = period === "7d" ? 2 : period === "28d" ? 4 : 8;
  const history = dataset.weeks.slice(-historySize);
  const current = dataset.weeks.at(-1)!;
  const previous = dataset.weeks.at(-2)!;

  const stages = dataset.stages.map((stage, index) => {
    const priorStage = dataset.stages[index - 1];
    const currentValue = current.values[stage.id];
    const previousValue = previous.values[stage.id];
    return {
      ...stage,
      current: currentValue,
      previous: previousValue,
      changePercent: percentChange(currentValue, previousValue),
      conversionCurrent: priorStage
        ? conversion(current.values[priorStage.id], currentValue)
        : 1,
      conversionPrevious: priorStage
        ? conversion(previous.values[priorStage.id], previousValue)
        : 1,
    };
  });

  const currentDemos = current.values.demo_scheduled;
  const previousDemos = previous.values.demo_scheduled;
  const segment =
    filters.segment && filters.segment !== "all"
      ? createSegmentData(asOf).rows.find(
          (row) => row.dimension === "device" && row.id === filters.segment,
        )
      : undefined;
  const range = { start: history[0]!.range.start, end: current.range.end };

  return {
    data: {
      stages,
      history,
      currentRange: current.range,
      previousRange: previous.range,
      drop: {
        from: "demo_form_completed" as FunnelStageId,
        to: "demo_scheduled" as FunnelStageId,
        current: currentDemos,
        previous: previousDemos,
        percent: percentChange(currentDemos, previousDemos),
      },
      segment,
    },
    source: [
      source(
        "ga4",
        "eventos por etapa del funnel · agrupados por semana",
        range,
        `${current.values.site_visit.toLocaleString("es-CL")} visitas en la semana actual`,
      ),
      source(
        "crm",
        "demos, trials y clientes · agrupados por fecha de creación",
        range,
        `${currentDemos} demos agendadas en la semana actual`,
      ),
    ],
    calculation: {
      label: "Variación semanal",
      formula: "(semana actual − semana anterior) ÷ semana anterior",
      inputs: ["ga4", "crm"],
    },
  } satisfies ToolResult<unknown>;
}

export function getSegments(
  filters: CommonFilters & {
    dimension?: SegmentDimension;
    segment?: string;
  } = {},
) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const period = filters.period ?? "7d";
  const dataset = createSegmentData(asOf);
  const dimension = filters.dimension ?? "device";
  let rows = dataset.rows.filter((row) => row.dimension === dimension);
  if (filters.segment && filters.segment !== "all") {
    rows = rows.filter((row) => row.id === filters.segment);
  }

  const data = rows.map((row) => {
    const currentRate = conversion(
      row.current.completed,
      row.current.scheduled,
    );
    const previousRate = conversion(
      row.previous.completed,
      row.previous.scheduled,
    );
    return {
      ...row,
      currentRate,
      previousRate,
      changePoints: (currentRate - previousRate) * 100,
    };
  });
  const range = rollingRange(asOf, periodDays(period));

  return {
    data,
    source: [
      source(
        "ga4",
        "demo_form_completed · desglosado por dispositivo, país y canal",
        range,
        `${rows.reduce((sum, row) => sum + row.current.completed, 0)} formularios completados en las filas visibles`,
      ),
      source(
        "crm",
        "demo_scheduled · unión por lead_id",
        range,
        `${rows.reduce((sum, row) => sum + row.current.scheduled, 0)} demos agendadas en las filas visibles`,
      ),
    ],
    calculation: {
      label: "Conversión por segmento",
      formula: "demos agendadas ÷ formularios completados",
      inputs: ["ga4", "crm"],
    },
  } satisfies ToolResult<unknown>;
}

export function getSessions(
  filters: CommonFilters & {
    device?: DeviceId | "all";
    problematicOnly?: boolean;
  } = {},
) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const period = filters.period ?? "7d";
  let sessions = createSessionsData(asOf);
  if (filters.device && filters.device !== "all") {
    sessions = sessions.filter((session) => session.device === filters.device);
  }
  if (filters.problematicOnly) {
    sessions = sessions.filter(
      (session) =>
        session.calendarLoadMs > 8000 && session.rageClicks > 0,
    );
  }
  const range = rollingRange(asOf, periodDays(period));

  return {
    data: sessions,
    source: source(
      "clarity",
      "sesiones en /demo · eventos de clic y rendimiento del calendario",
      range,
      `${sessions.length} sesiones`,
    ),
  } satisfies ToolResult<typeof sessions>;
}

export function getCrmLeads(
  filters: CommonFilters & {
    device?: DeviceId | "all";
    country?: CountryId | "all";
    goodFitWithoutDemo?: boolean;
  } = {},
) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const period = filters.period ?? "28d";
  const range = rollingRange(asOf, periodDays(period));
  let leads = createCrmLeads(asOf).filter(
    (lead) =>
      lead.formCompletedAt.slice(0, 10) >= range.start &&
      lead.formCompletedAt.slice(0, 10) <= range.end,
  );
  if (filters.device && filters.device !== "all") {
    leads = leads.filter((lead) => lead.device === filters.device);
  }
  if (filters.country && filters.country !== "all") {
    leads = leads.filter((lead) => lead.country === filters.country);
  }
  if (filters.goodFitWithoutDemo) {
    leads = leads.filter(
      (lead) =>
        lead.device === "ios" &&
        lead.formCompleted &&
        !lead.demoScheduled &&
        lead.goodFit,
    );
  }
  return {
    data: leads,
    source: source(
      "crm",
      "leads de demo · estado, dispositivo, locales y fecha del formulario",
      range,
      `${leads.length} leads`,
    ),
  } satisfies ToolResult<typeof leads>;
}

export function getChangelog(filters: CommonFilters = {}) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const period = filters.period ?? "28d";
  const range = rollingRange(asOf, periodDays(period));
  const entries = createChangelog(asOf).filter(
    (entry) => entry.date >= range.start && entry.date <= range.end,
  );

  return {
    data: entries,
    source: source(
      "clarity",
      "metadatos de versión capturados en sesiones de /demo",
      range,
      `${entries.length} cambios vinculados a sesiones`,
    ),
  } satisfies ToolResult<typeof entries>;
}

export function getDropTimeline(filters: CommonFilters = {}) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const range = rollingRange(asOf, 14);
  const changelog = createChangelog(asOf)[0]!;
  const series = createDailyDemoTimeline(asOf);
  const deployedAt = new Date(`${changelog.date}T12:00:00`);
  const daysSinceDeploy = Math.round(
    (demoToday(asOf).getTime() - deployedAt.getTime()) / 86_400_000,
  );
  return {
    data: { changelog, daysSinceDeploy, series },
    source: [
      source(
        "ga4",
        "demo_scheduled diario · dispositivo iOS y Android",
        range,
        `${series.length} días`,
      ),
      source(
        "clarity",
        "versión del calendario observada en sesiones de /demo",
        range,
        "Despliegue v2.3 vinculado a sesiones",
      ),
    ],
  } satisfies ToolResult<unknown>;
}

export function getExperiments(
  filters: CommonFilters & { status?: ExperimentStatus } = {},
) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const range = rollingRange(asOf, periodDays(filters.period ?? "90d"));
  const experiments = createExperiments(asOf).filter(
    (experiment) =>
      (!filters.status || experiment.status === filters.status) &&
      experiment.endedAt >= range.start &&
      experiment.startedAt <= range.end,
  );

  return {
    data: experiments,
    source: source(
      "ga4",
      "experimentos · asignación, exposición y eventos de conversión",
      range,
      `${experiments.length} experimento${experiments.length === 1 ? "" : "s"}`,
    ),
    calculation: {
      label: "Efecto de la variante",
      formula: "conversión variante − conversión control",
      inputs: ["ga4"],
    },
  } satisfies ToolResult<typeof experiments>;
}

export function estimateDuration({
  baselineRate,
  minimumEffect,
  weeklyTraffic,
  asOf = DEMO_AS_OF,
}: {
  baselineRate: number;
  minimumEffect: number;
  weeklyTraffic: number;
  asOf?: Date;
}) {
  if (baselineRate <= 0 || baselineRate >= 1) {
    throw new RangeError("baselineRate debe estar entre 0 y 1.");
  }
  if (minimumEffect <= 0 || baselineRate + minimumEffect >= 1) {
    throw new RangeError("minimumEffect debe producir una tasa entre 0 y 1.");
  }
  if (weeklyTraffic <= 0) {
    throw new RangeError("weeklyTraffic debe ser mayor que cero.");
  }

  const variantRate = baselineRate + minimumEffect;
  const pooledRate = (baselineRate + variantRate) / 2;
  const zAlpha = 1.959964;
  const zPower = 0.841621;
  const numerator =
    zAlpha * Math.sqrt(2 * pooledRate * (1 - pooledRate)) +
    zPower *
      Math.sqrt(
        baselineRate * (1 - baselineRate) +
          variantRate * (1 - variantRate),
      );
  const perVariant = Math.ceil((numerator / minimumEffect) ** 2);
  const totalSample = perVariant * 2;
  const weeks = Math.ceil(totalSample / weeklyTraffic);
  const range = rollingRange(asOf, 7);

  return {
    data: {
      baselineRate,
      variantRate,
      minimumEffect,
      weeklyTraffic,
      perVariant,
      totalSample,
      weeks,
      confidence: 0.95,
      power: 0.8,
    },
    source: source(
      "ga4",
      "demo_form_completed · volumen semanal",
      range,
      `${weeklyTraffic} personas por semana`,
    ),
    calculation: {
      label: "Tamaño de muestra para dos proporciones",
      formula: "α 5 %, poder 80 %, dos variantes y efecto mínimo absoluto",
      inputs: ["ga4"],
    },
  } satisfies ToolResult<unknown>;
}

export function getDemoExperimentOutcome({
  baselineRate,
  asOf = DEMO_AS_OF,
}: {
  baselineRate: number;
  asOf?: Date;
}) {
  const range = rollingRange(asOf, 21);
  const variantRate = Math.min(0.99, baselineRate + 0.1);
  return {
    data: {
      controlRate: baselineRate,
      variantRate,
      confidenceInterval: [0.04, 0.16] as [number, number],
      result: "positive" as const,
      recommendation: "scale" as const,
    },
    source: source(
      "ga4",
      "experimento agenda_integrada · exposición y demo_scheduled",
      range,
      "Muestra completa de control y variante",
    ),
    calculation: {
      label: "Efecto de la variante",
      formula: "conversión variante − conversión control",
      inputs: ["ga4"],
    },
  } satisfies ToolResult<unknown>;
}

export function getAlerts(
  filters: CommonFilters & { severity?: DemoAlert["severity"] } = {},
) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const range = rollingRange(asOf, periodDays(filters.period ?? "7d"));
  const alerts = createAlerts(asOf).filter(
    (alert) =>
      (!filters.severity || alert.severity === filters.severity) &&
      alert.detectedAt.slice(0, 10) >= range.start &&
      alert.detectedAt.slice(0, 10) <= range.end,
  );
  return {
    data: alerts,
    source: [
      source(
        "ga4",
        "cambios semanales por evento y dispositivo",
        range,
        `${alerts.length} alertas activas`,
      ),
      source(
        "crm",
        "demos agendadas unidas por lead_id",
        range,
        "Cobertura completa de leads de demo",
      ),
    ],
    calculation: {
      label: "Cambio detectado",
      formula: "(periodo actual − periodo anterior) ÷ periodo anterior",
      inputs: ["ga4", "crm"],
    },
  } satisfies ToolResult<typeof alerts>;
}

export function getSourceHealth(filters: CommonFilters = {}) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const range = rollingRange(asOf, periodDays(filters.period ?? "7d"));
  const data = [
    {
      id: "ga4" as const,
      status: "connected" as const,
      lastSyncMinutes: 2,
      mappedEvents: [
        "site_visit",
        "pricing_view",
        "demo_form_started",
        "demo_form_completed",
      ],
    },
    {
      id: "clarity" as const,
      status: "connected" as const,
      lastSyncMinutes: 5,
      mappedEvents: ["page_view", "click", "rage_click", "exit"],
    },
    {
      id: "crm" as const,
      status: "connected" as const,
      lastSyncMinutes: 7,
      mappedEvents: [
        "demo_scheduled",
        "demo_completed",
        "trial_active",
        "paying_customer",
      ],
    },
  ];
  return {
    data,
    source: data.map((item) =>
      source(
        item.id,
        "estado de conexión y eventos mapeados",
        range,
        `${item.mappedEvents.length} eventos mapeados`,
      ),
    ),
  } satisfies ToolResult<typeof data>;
}

export function getWeeklyReport(filters: CommonFilters = {}) {
  const asOf = filters.asOf ?? DEMO_AS_OF;
  const funnel = getFunnel({ asOf, period: filters.period ?? "7d" });
  const segments = getSegments({ asOf, period: filters.period ?? "7d" });
  const sessions = getSessions({ asOf, period: filters.period ?? "7d", problematicOnly: true });
  const leads = getCrmLeads({ asOf, period: "28d", goodFitWithoutDemo: true });
  const experiment = getExperiments({ asOf, status: "ready_to_read" });
  const timeline = getDropTimeline({ asOf });
  const ios = segments.data.find((row) => row.id === "ios")!;
  const funnelSources = Array.isArray(funnel.source) ? funnel.source : [funnel.source];
  const segmentSources = Array.isArray(segments.source) ? segments.source : [segments.source];
  return {
    data: {
      range: funnel.data.currentRange,
      demos: funnel.data.drop.current,
      demoChangePercent: funnel.data.drop.percent,
      iosConversion: ios.currentRate,
      iosChangePoints: ios.changePoints,
      problematicSessions: sessions.data.length,
      recoverableLeads: leads.data.length,
      experiment: experiment.data[0],
      cause: {
        title: timeline.data.changelog.title,
        date: timeline.data.changelog.date,
        daysSinceDeploy: timeline.data.daysSinceDeploy,
      },
      dropStep: {
        from: funnel.data.stages.find((stage) => stage.id === funnel.data.drop.from)!.label,
        to: funnel.data.stages.find((stage) => stage.id === funnel.data.drop.to)!.label,
        previous: funnel.data.drop.previous,
        current: funnel.data.drop.current,
      },
      metricSources: {
        demos: funnelSources.filter((item) => item.id === "crm"),
        ios: segmentSources,
        sessions: sessions.source,
        leads: leads.source,
        cause: timeline.source,
      },
      metricCalculations: {
        ios: segments.calculation,
      },
    },
    source: [
      ...funnelSources,
      ...segmentSources,
      sessions.source,
      leads.source,
      ...timeline.source,
    ],
    calculation: funnel.calculation,
  } satisfies ToolResult<unknown>;
}
