import type { Metadata } from "next";

import { SummaryView } from "@/components/data/summary-view";

export const metadata: Metadata = { title: "Resumen · Tracer" };

export default function SummaryPage() {
  return <SummaryView />;
}
