export type SourceId = "ga4" | "clarity" | "crm";

export type PeriodId = "7d" | "28d" | "90d";

export type DeviceId = "desktop" | "ios" | "android";

export type CountryId = "chile" | "mexico";

export type ChannelId = "organico" | "paid" | "referidos" | "directo";

export type DateRange = {
  start: string;
  end: string;
};

export const SOURCE_LABELS: Record<SourceId, string> = {
  ga4: "GA4",
  clarity: "Clarity",
  crm: "CRM",
};
