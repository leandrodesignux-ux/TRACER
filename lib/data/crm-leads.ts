import { addDays, demoToday, toDateKey } from "@/lib/data/date";
import {
  createSeededRandom,
  integerSeeded,
  pickSeeded,
} from "@/lib/data/seed";
import type {
  ChannelId,
  CountryId,
  DeviceId,
} from "@/lib/data/types";

export const CRM_LEADS_SEED = 424242;

export type CrmLeadStatus = "incompleto" | "sin_demo" | "demo_agendada";

export type CrmLead = {
  id: string;
  company: string;
  locations: number;
  country: CountryId;
  device: DeviceId;
  channel: ChannelId;
  status: CrmLeadStatus;
  formCompleted: boolean;
  formCompletedAt: string;
  demoScheduled: boolean;
  goodFit: boolean;
};

const COMPANY_ROOTS = [
  "Don Rafa",
  "La Caleta",
  "Tacos del Norte",
  "Patio Central",
  "Casa Brasa",
  "Mercado Sur",
  "Canto del Mar",
  "Barrio Origen",
  "Sazón Andino",
  "Cocina Mestiza",
  "Mesa Norte",
  "Ruta del Maíz",
] as const;
const COMPANY_SUFFIXES = [
  "Restaurantes",
  "Cocinas",
  "Grupo Gastronómico",
  "Parrillas",
  "Cantinas",
  "Bistrós",
  "Taquerías",
  "Comedores",
  "Terrazas",
  "Fonditas",
] as const;
const COUNTRIES: CountryId[] = ["chile", "mexico"];
const CHANNELS: ChannelId[] = ["organico", "paid", "referidos", "directo"];
const DEVICES: DeviceId[] = ["desktop", "ios", "android"];

function companyName(index: number) {
  const root = COMPANY_ROOTS[index % COMPANY_ROOTS.length]!;
  const suffix = COMPANY_SUFFIXES[Math.floor(index / COMPANY_ROOTS.length)]!;
  return `${root} ${suffix}`;
}

export function createCrmLeads(asOf: Date = new Date()) {
  const today = demoToday(asOf);
  const random = createSeededRandom(CRM_LEADS_SEED);

  const followUp: CrmLead[] = Array.from({ length: 42 }, (_, index) => {
    const locations = integerSeeded(21, 68, random);
    return {
      id: `lead-ios-${String(index + 1).padStart(3, "0")}`,
      company: companyName(index),
      locations,
      country: pickSeeded(COUNTRIES, random),
      device: "ios",
      channel: pickSeeded(CHANNELS, random),
      status: "sin_demo",
      formCompleted: true,
      formCompletedAt: `${toDateKey(addDays(today, -integerSeeded(0, 6, random)))}T12:00:00`,
      demoScheduled: false,
      goodFit: true,
    };
  });

  const contrast: CrmLead[] = Array.from({ length: 78 }, (_, offset) => {
    const index = offset + followUp.length;
    const device = pickSeeded(DEVICES, random);
    const formCompleted = random() > 0.16;
    let locations = integerSeeded(3, 52, random);
    let demoScheduled = formCompleted && random() > 0.38;

    // Evita que los registros de contraste cumplan por accidente el filtro de 42.
    if (device === "ios" && formCompleted && !demoScheduled && locations > 20) {
      if (index % 2 === 0) demoScheduled = true;
      else locations = integerSeeded(4, 20, random);
    }

    const status: CrmLeadStatus = !formCompleted
      ? "incompleto"
      : demoScheduled
        ? "demo_agendada"
        : "sin_demo";

    return {
      id: `lead-${String(index + 1).padStart(3, "0")}`,
      company: companyName(index),
      locations,
      country: pickSeeded(COUNTRIES, random),
      device,
      channel: pickSeeded(CHANNELS, random),
      status,
      formCompleted,
      formCompletedAt: `${toDateKey(addDays(today, -integerSeeded(0, 27, random)))}T12:00:00`,
      demoScheduled,
      goodFit: locations > 20,
    };
  });

  return [...followUp, ...contrast];
}
