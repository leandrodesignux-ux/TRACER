import {
  estimateDuration,
  getCrmLeads,
  getExperiments,
  getFunnel,
  getSegments,
  getSessions,
  type CalculationDetails,
  type DataSource,
} from "@/lib/ai/tools";
import type { CrmLead } from "@/lib/data/crm-leads";
import type { DemoExperiment } from "@/lib/data/experiments";
import type { DemoSession } from "@/lib/data/sessions";
import type { PeriodId, SourceId } from "@/lib/data/types";

type Sources = DataSource | DataSource[];

export type ResponseStep = {
  label: string;
  source: DataSource;
};

export type FunnelResponseBlock = {
  kind: "funnel";
  stages: ReturnType<typeof getFunnel>["data"]["stages"];
  source: Sources;
  calculation?: CalculationDetails;
};

export type SegmentsResponseBlock = {
  kind: "segments";
  rows: ReturnType<typeof getSegments>["data"];
  source: Sources;
  calculation?: CalculationDetails;
};

export type SessionsResponseBlock = {
  kind: "sessions";
  sessions: DemoSession[];
  source: DataSource;
};

export type LeadsResponseBlock = {
  kind: "leads";
  leads: CrmLead[];
  source: DataSource;
};

export type ExperimentPlanResponseBlock = {
  kind: "experiment-plan";
  name: string;
  hypothesis: string;
  primaryMetric: string;
  guardrail: string;
  segment: string;
  estimate: ReturnType<typeof estimateDuration>["data"];
  source: DataSource;
  calculation?: CalculationDetails;
};

export type ExperimentResultResponseBlock = {
  kind: "experiment-result";
  experiment: DemoExperiment;
  source: Sources;
  calculation?: CalculationDetails;
};

export type ResponseBlock =
  | FunnelResponseBlock
  | SegmentsResponseBlock
  | SessionsResponseBlock
  | LeadsResponseBlock
  | ExperimentPlanResponseBlock
  | ExperimentResultResponseBlock;

export type DemoResponse = {
  id: string;
  intent: string;
  steps: ResponseStep[];
  text: string;
  blocks: ResponseBlock[];
  suggestions: string[];
  sourceIds: SourceId[];
};

function sourcesList(source: Sources) {
  return Array.isArray(source) ? source : [source];
}

function sourceById(source: Sources, id: SourceId) {
  return sourcesList(source).find((item) => item.id === id)!;
}

function normalize(text: string) {
  return text
    .toLocaleLowerCase("es")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function resolveDemoResponse({
  prompt,
  period,
  enabledSources,
}: {
  prompt: string;
  period: PeriodId;
  enabledSources: SourceId[];
}): DemoResponse {
  const query = normalize(prompt);
  const funnel = getFunnel({ period });
  const segments = getSegments({ dimension: "device", period });
  const sessions = getSessions({ problematicOnly: true, period });
  const leads = getCrmLeads({ goodFitWithoutDemo: true, period: "28d" });
  const responseId = `r-${prompt.length}-${query.slice(0, 16).replaceAll(" ", "-")}`;
  const canUse = (id: SourceId) => enabledSources.includes(id);

  if (query.includes("experimento") && !query.includes("formulario en un solo paso")) {
    const estimate = estimateDuration({
      baselineRate: funnel.data.stages.find((stage) => stage.id === "demo_scheduled")!.conversionPrevious,
      minimumEffect: 0.08,
      weeklyTraffic: funnel.data.stages.find((stage) => stage.id === "demo_form_completed")!.current,
    });
    return {
      id: responseId,
      intent: "design-experiment",
      steps: [
        { label: "Midiendo el volumen elegible", source: sourceById(funnel.source, "ga4") },
        { label: "Separando el bug de la hipótesis", source: sessions.source },
        { label: "Calculando duración y muestra", source: estimate.source },
      ],
      text: "El problema de Safari iOS es un bug: conviene corregirlo y monitorearlo, sin someterlo a un test. La oportunidad experimental es reducir el cambio de contexto y permitir que la demo se agende dentro del mismo formulario.",
      blocks: [{
        kind: "experiment-plan",
        name: "Agenda integrada en el formulario",
        hypothesis: "Si permitimos agendar dentro del formulario, entonces aumentará la conversión a demo porque eliminamos la espera y el cambio de contexto.",
        primaryMetric: "Formulario completado → demo agendada",
        guardrail: "Tasa de demos realizadas",
        segment: "Todo el tráfico elegible, después de corregir iOS",
        estimate: estimate.data,
        source: estimate.source,
        calculation: estimate.calculation,
      }],
      suggestions: ["¿Qué arreglamos primero en iOS?", "¿Cómo medimos el experimento?"],
      sourceIds: ["ga4", "clarity"],
    };
  }

  if (query.includes("formulario en un solo paso") || query.includes("experimento anterior")) {
    const experiments = getExperiments({ status: "ready_to_read" });
    return {
      id: responseId,
      intent: "previous-experiment",
      steps: [{ label: "Leyendo el experimento anterior", source: sourceById(experiments.source, "ga4") }],
      text: "El experimento anterior no dio evidencia suficiente para escalar. La dirección sigue siendo interesante, pero hace falta iterar el cambio y medir una parte más cercana a la agenda de la demo.",
      blocks: [{ kind: "experiment-result", experiment: experiments.data[0]!, source: experiments.source, calculation: experiments.calculation }],
      suggestions: ["Diseña el siguiente experimento", "¿Por qué fue no concluyente?"],
      sourceIds: ["ga4"],
    };
  }

  if (query.includes("android")) {
    return {
      id: responseId,
      intent: "android-followup",
      steps: [{ label: "Filtrando el funnel por dispositivo", source: sourceById(segments.source, "ga4") }],
      text: "Android también pierde conversión en el paso a demo, aunque la caída es menor que en iOS. Conviene vigilarlo después de corregir el calendario.",
      blocks: [{ kind: "segments", rows: segments.data.filter((row) => row.id === "android"), source: segments.source, calculation: segments.calculation }],
      suggestions: ["¿Qué pasa en iOS?", "Diseña un experimento"],
      sourceIds: ["ga4", "crm"],
    };
  }

  if (query.includes("lead") || query.includes("recontact")) {
    return {
      id: responseId,
      intent: "crm-followup",
      steps: [{ label: "Buscando formularios sin demo", source: leads.source }],
      text: "Hay una cohorte clara para recontactar: completaron el formulario, tienen buen encaje y no alcanzaron a agendar. La lista ya está preparada para el equipo comercial.",
      blocks: [{ kind: "leads", leads: leads.data, source: leads.source }],
      suggestions: ["¿Qué mensaje de recontacto usarías?", "Diseña un experimento"],
      sourceIds: ["crm"],
    };
  }

  if (query.includes("clarity") || query.includes("sesion") || query.includes("calendario") || query.includes("ios")) {
    return {
      id: responseId,
      intent: "sessions-evidence",
      steps: [{ label: "Revisando sesiones con fricción", source: sessions.source }],
      text: "Las sesiones problemáticas comparten el mismo patrón: Safari en iOS, una espera prolongada al cargar el calendario, clics repetidos y salida antes de confirmar.",
      blocks: [{ kind: "sessions", sessions: sessions.data, source: sessions.source }],
      suggestions: ["¿Cuántos leads hay que recontactar?", "Diseña un experimento"],
      sourceIds: ["clarity"],
    };
  }

  if (query.includes("fuga") || query.includes("caida") || query.includes("demos") || query.includes("conversion")) {
    const blocks: ResponseBlock[] = [
      { kind: "funnel", stages: funnel.data.stages, source: funnel.source, calculation: funnel.calculation },
      { kind: "segments", rows: segments.data, source: segments.source, calculation: segments.calculation },
    ];
    if (canUse("clarity")) blocks.push({ kind: "sessions", sessions: sessions.data, source: sessions.source });
    if (canUse("crm")) blocks.push({ kind: "leads", leads: leads.data, source: leads.source });
    return {
      id: responseId,
      intent: "explain-drop",
      steps: [
        { label: "Consultando el funnel semanal", source: sourceById(funnel.source, "ga4") },
        { label: "Comparando dispositivos", source: sourceById(segments.source, "crm") },
        ...(canUse("clarity") ? [{ label: "Buscando evidencia de sesión", source: sessions.source }] : []),
        ...(canUse("crm") ? [{ label: "Cruzando formularios con leads", source: leads.source }] : []),
      ],
      text: "La fuga está entre formulario completado y demo agendada. Se concentra en iOS y coincide con sesiones donde el calendario tarda en cargar; el CRM confirma una cohorte recuperable que quedó sin demo.",
      blocks,
      suggestions: ["¿Y en Android?", "¿Cuántos leads hay que recontactar?", "Diseña un experimento"],
      sourceIds: ["ga4", ...(canUse("clarity") ? ["clarity" as const] : []), ...(canUse("crm") ? ["crm" as const] : [])],
    };
  }

  return {
    id: responseId,
    intent: "fallback",
    steps: [],
    text: "No tengo un guion fiable para esa pregunta todavía. Puedo encontrar la fuga del funnel, revisar la evidencia de iOS, preparar los leads para recontacto o diseñar el experimento.",
    blocks: [],
    suggestions: ["Encontrar la fuga", "Revisar sesiones de iOS", "Diseñar un experimento"],
    sourceIds: [],
  };
}
