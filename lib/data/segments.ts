import { rollingRange } from "@/lib/data/date";
import type { DateRange, DeviceId } from "@/lib/data/types";

export type SegmentDimension = "device" | "country" | "channel";

export type SegmentRow = {
  id: string;
  dimension: SegmentDimension;
  label: string;
  current: { completed: number; scheduled: number };
  previous: { completed: number; scheduled: number };
};

const SEGMENT_ROWS: SegmentRow[] = [
  {
    id: "desktop",
    dimension: "device",
    label: "Desktop",
    current: { completed: 230, scheduled: 175 },
    previous: { completed: 225, scheduled: 170 },
  },
  {
    id: "ios",
    dimension: "device",
    label: "Mobile iOS",
    current: { completed: 105, scheduled: 8 },
    previous: { completed: 100, scheduled: 46 },
  },
  {
    id: "android",
    dimension: "device",
    label: "Mobile Android",
    current: { completed: 75, scheduled: 22 },
    previous: { completed: 77, scheduled: 34 },
  },
  {
    id: "chile",
    dimension: "country",
    label: "Chile",
    current: { completed: 245, scheduled: 131 },
    previous: { completed: 240, scheduled: 155 },
  },
  {
    id: "mexico",
    dimension: "country",
    label: "México",
    current: { completed: 165, scheduled: 74 },
    previous: { completed: 162, scheduled: 95 },
  },
  {
    id: "organico",
    dimension: "channel",
    label: "Orgánico",
    current: { completed: 160, scheduled: 90 },
    previous: { completed: 158, scheduled: 105 },
  },
  {
    id: "paid",
    dimension: "channel",
    label: "Paid",
    current: { completed: 140, scheduled: 60 },
    previous: { completed: 138, scheduled: 78 },
  },
  {
    id: "referidos",
    dimension: "channel",
    label: "Referidos",
    current: { completed: 70, scheduled: 37 },
    previous: { completed: 68, scheduled: 43 },
  },
  {
    id: "directo",
    dimension: "channel",
    label: "Directo",
    current: { completed: 40, scheduled: 18 },
    previous: { completed: 38, scheduled: 24 },
  },
];

export type SegmentData = {
  range: DateRange;
  rows: SegmentRow[];
};

export function createSegmentData(asOf: Date = new Date()): SegmentData {
  return { range: rollingRange(asOf, 7), rows: SEGMENT_ROWS };
}

export function isDeviceId(value: string): value is DeviceId {
  return value === "desktop" || value === "ios" || value === "android";
}
