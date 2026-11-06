/**
 * Textos y hallazgos del inicio (Fase 1).
 *
 * Las cifras viven aquí, nunca en los componentes. DEMO_DROP es provisional:
 * la Fase 2 la reemplaza por el resultado de getFunnel() con su fuente.
 */

export type SourceId = "ga4" | "clarity" | "crm";

export const SOURCES: { id: SourceId; label: string }[] = [
  { id: "ga4", label: "GA4" },
  { id: "clarity", label: "Clarity" },
  { id: "crm", label: "CRM" },
];

/** Caída semanal de demos agendadas (205 vs 250). Fase 2: getFunnel(). */
export const DEMO_DROP = { value: -18, unit: "%", source: "crm" } as const;

export function formatDelta({ value, unit }: { value: number; unit: string }) {
  const sign = value < 0 ? "−" : "+";
  return `${sign}${Math.abs(value)} ${unit}`;
}

export const COMPANY = {
  name: "Cuadra",
  user: {
    name: "Valentina R.",
    initials: "VR",
    role: "PM de Growth",
  },
  dataNote: "Datos demo",
};

export const PERIODS = [
  { id: "7d", label: "Últimos 7 días" },
  { id: "28d", label: "Últimos 28 días" },
  { id: "90d", label: "Últimos 90 días" },
] as const;

export type PeriodId = (typeof PERIODS)[number]["id"];

/* ---------- Navegación ---------- */

export type NavIcon =
  | "home"
  | "analysis"
  | "experiments"
  | "reports"
  | "sources"
  | "alerts";

export const TOP_NAV = [
  { label: "Resumen", href: "/resumen" },
  { label: "Funnel", href: "/funnel" },
  { label: "Segmentos", href: "/segmentos" },
  { label: "Sesiones", href: "/sesiones" },
  { label: "CRM", href: "/crm" },
  { label: "Asistente", href: "/" },
] as const;

export const SIDE_NAV: { label: string; href: string; icon: NavIcon }[] = [
  { label: "Inicio", href: "/", icon: "home" },
  { label: "Análisis", href: "/analisis", icon: "analysis" },
  { label: "Experimentos", href: "/experimentos", icon: "experiments" },
  { label: "Informes", href: "/informes", icon: "reports" },
  { label: "Fuentes", href: "/fuentes", icon: "sources" },
];

/** Vistas que llegan en próximas fases. Se prerenderizan como Empty. */
export const UPCOMING_VIEWS: Record<
  string,
  { title: string; description: string; phase: string }
> = {
  resumen: {
    title: "Resumen",
    description: "Las métricas clave de la semana, cada una con su fuente.",
    phase: "Fase 2",
  },
  funnel: {
    title: "Funnel",
    description: "Las etapas del funnel con el paso que más cae marcado.",
    phase: "Fase 2",
  },
  segmentos: {
    title: "Segmentos",
    description: "La conversión por dispositivo, canal y país.",
    phase: "Fase 2",
  },
  sesiones: {
    title: "Sesiones",
    description: "Grabaciones de Clarity que respaldan cada hipótesis.",
    phase: "Fase 3",
  },
  crm: {
    title: "CRM",
    description: "Los leads que se quedaron a mitad de camino.",
    phase: "Fase 3",
  },
  analisis: {
    title: "Análisis",
    description: "Tus hilos de análisis y en qué quedó cada uno.",
    phase: "Fase 3",
  },
  experimentos: {
    title: "Experimentos",
    description: "El tablero de experimentos: por diseñar, en curso, para leer y decidido.",
    phase: "Fase 4",
  },
  informes: {
    title: "Informes",
    description: "Resúmenes listos para compartir con tu equipo.",
    phase: "Fase 5",
  },
  fuentes: {
    title: "Fuentes",
    description: "El estado de GA4, Clarity y CRM, y las etapas del funnel.",
    phase: "Fase 5",
  },
  alertas: {
    title: "Alertas",
    description: "Las caídas que Tracer detecta solo, listas para analizar.",
    phase: "Fase 5",
  },
};

/* ---------- Asistente ---------- */

export const ASSISTANT = {
  title: "Asistente",
  status: "Conectado a GA4, Clarity y CRM",
  emptyTitle: "¿Qué quieres analizar hoy?",
  placeholder: "Pregunta algo sobre tu funnel…",
  thinking: "Analizando…",
  thinkingNote: "Las respuestas llegan en la Fase 3.",
};

export const SUGGESTIONS = [
  {
    id: "fuga",
    label: "Encontrar la fuga",
    prompt: "¿En qué paso del funnel y en qué segmento estamos perdiendo más conversión?",
  },
  {
    id: "caida",
    label: "Explicar la caída de demos",
    prompt: "¿Por qué cayeron las demos agendadas esta semana?",
  },
  {
    id: "experimento",
    label: "Diseñar un experimento",
    prompt: "Diseña un experimento para recuperar las demos agendadas en mobile.",
  },
] as const;

/* ---------- Hallazgos ---------- */

export type FindingCategory = "alertas" | "experimentos" | "fuentes";
export type FindingIcon = "drop" | "deploy" | "experiment" | "sync";
export type FindingTone = "destructive" | "warning" | "primary" | "muted";

export type Finding = {
  id: string;
  category: FindingCategory;
  icon: FindingIcon;
  tone: FindingTone;
  title: string;
  detail?: string;
  /** Minutos desde que apareció. Determinista: no depende del reloj del cliente. */
  minutesAgo: number;
  unread: boolean;
  /** Pregunta que deja en el composer al tocarlo. */
  prompt: string;
};

export const FINDING_TABS: { id: "todo" | FindingCategory; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "alertas", label: "Alertas" },
  { id: "experimentos", label: "Experimentos" },
  { id: "fuentes", label: "Fuentes" },
];

const HOUR = 60;
const DAY = 24 * HOUR;

export const FINDINGS: Finding[] = [
  {
    id: "demos-drop",
    category: "alertas",
    icon: "drop",
    tone: "destructive",
    title: `Demos agendadas ${formatDelta(DEMO_DROP)}`,
    detail: "Formulario completado → demo agendada",
    minutesAgo: 2 * HOUR,
    unread: true,
    prompt: "¿Por qué cayeron las demos agendadas esta semana?",
  },
  {
    id: "android-step",
    category: "alertas",
    icon: "drop",
    tone: "warning",
    title: "Android también baja en agendar demo",
    detail: "Mismo paso, menos fuerte que en iOS",
    minutesAgo: 5 * HOUR,
    unread: true,
    prompt: "¿Cuánto cayó el paso a demo agendada en Android?",
  },
  {
    id: "calendar-deploy",
    category: "alertas",
    icon: "deploy",
    tone: "muted",
    title: "Calendario v2.3 desplegado",
    detail: "Widget de agenda de demos",
    minutesAgo: 9 * DAY,
    unread: false,
    prompt: "¿El calendario v2.3 tiene que ver con la caída de demos?",
  },
  {
    id: "experiment-ready",
    category: "experimentos",
    icon: "experiment",
    tone: "primary",
    title: "Experimento listo para leer",
    detail: "Formulario en un solo paso",
    minutesAgo: 1 * DAY + 3 * HOUR,
    unread: false,
    prompt: "Resume el resultado del experimento del formulario en un solo paso.",
  },
  {
    id: "clarity-sync",
    category: "fuentes",
    icon: "sync",
    tone: "muted",
    title: "Clarity sincronizado",
    detail: "Sesiones de esta semana",
    minutesAgo: 15,
    unread: false,
    prompt: "¿Qué muestran las sesiones de Clarity de esta semana?",
  },
];

export const ALERT_COUNT = FINDINGS.filter((f) => f.category === "alertas").length;

export const FINDINGS_FOOTER = "Datos demo de Cuadra";

export function formatAgo(minutes: number) {
  if (minutes < HOUR) return `hace ${minutes} min`;
  if (minutes < DAY) return `hace ${Math.round(minutes / HOUR)} h`;
  const days = Math.floor(minutes / DAY);
  return days === 1 ? "ayer" : `hace ${days} días`;
}
