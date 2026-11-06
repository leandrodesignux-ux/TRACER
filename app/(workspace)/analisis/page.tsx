import type { Metadata } from "next";

import { AnalysisView } from "@/components/demo/analysis-view";

export const metadata: Metadata = { title: "Análisis · Tracer" };

export default function AnalysisPage() {
  return <AnalysisView />;
}
