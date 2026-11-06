import { addDays, demoToday, toDateKey } from "@/lib/data/date";
import {
  createSeededRandom,
  integerSeeded,
  pickSeeded,
} from "@/lib/data/seed";
import type { CountryId, DeviceId } from "@/lib/data/types";

export const SESSIONS_SEED = 20261106;

export type SessionEventType =
  | "page_view"
  | "click"
  | "wait"
  | "rage_click"
  | "exit"
  | "demo_scheduled";

export type DemoSessionEvent = {
  atMs: number;
  type: SessionEventType;
  target: string;
};

export type DemoSession = {
  id: string;
  occurredAt: string;
  device: DeviceId;
  browser: string;
  country: CountryId;
  durationSeconds: number;
  rageClicks: number;
  page: string;
  calendarLoadMs: number;
  outcome: "exit" | "demo_scheduled";
  events: DemoSessionEvent[];
};

const NORMAL_PROFILES = [
  { device: "desktop" as const, browser: "Chrome", country: "chile" as const },
  { device: "desktop" as const, browser: "Edge", country: "mexico" as const },
  { device: "desktop" as const, browser: "Safari", country: "chile" as const },
  { device: "android" as const, browser: "Chrome", country: "mexico" as const },
];

export function createSessionsData(asOf: Date = new Date()) {
  const today = demoToday(asOf);
  const random = createSeededRandom(SESSIONS_SEED);
  const problematicLoads = [9300, 10800, 12600];

  const problematic: DemoSession[] = problematicLoads.map((load, index) => ({
    id: `clarity-ios-${index + 1}`,
    occurredAt: `${toDateKey(addDays(today, -(index * 2 + 1)))}T${String(10 + index * 3).padStart(2, "0")}:20:00`,
    device: "ios",
    browser: "Safari",
    country: index === 1 ? "mexico" : "chile",
    durationSeconds: 32 + index * 7,
    rageClicks: index === 1 ? 4 : 3,
    page: "/demo",
    calendarLoadMs: load,
    outcome: "exit",
    events: [
      { atMs: 0, type: "page_view", target: "Formulario de demo" },
      { atMs: 4200, type: "click", target: "Elegir horario" },
      { atMs: load, type: "wait", target: "Calendario cargando" },
      { atMs: load + 1400, type: "rage_click", target: "Elegir horario" },
      { atMs: load + 5200, type: "exit", target: "Salida de la página" },
    ],
  }));

  const normal: DemoSession[] = Array.from({ length: 9 }, (_, index) => {
    const profile = pickSeeded(NORMAL_PROFILES, random);
    const load = integerSeeded(480, 1750, random);
    const durationSeconds = integerSeeded(41, 118, random);
    const offset = integerSeeded(0, 6, random);
    return {
      id: `clarity-normal-${index + 1}`,
      occurredAt: `${toDateKey(addDays(today, -offset))}T${String(integerSeeded(9, 18, random)).padStart(2, "0")}:10:00`,
      ...profile,
      durationSeconds,
      rageClicks: 0,
      page: "/demo",
      calendarLoadMs: load,
      outcome: "demo_scheduled" as const,
      events: [
        { atMs: 0, type: "page_view" as const, target: "Formulario de demo" },
        { atMs: 3500, type: "click" as const, target: "Elegir horario" },
        { atMs: 3500 + load, type: "click" as const, target: "Horario disponible" },
        {
          atMs: Math.min(durationSeconds * 1000 - 1000, 18000),
          type: "demo_scheduled" as const,
          target: "Demo confirmada",
        },
      ],
    };
  });

  return [...problematic, ...normal].sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  );
}
