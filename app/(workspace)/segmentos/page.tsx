import type { Metadata } from "next";

import { SegmentsView } from "@/components/data/segments-view";

export const metadata: Metadata = { title: "Segmentos · Tracer" };

export default function SegmentsPage() {
  return <SegmentsView />;
}
