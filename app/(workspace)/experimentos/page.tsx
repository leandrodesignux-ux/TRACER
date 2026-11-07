import type { Metadata } from "next";

import { ExperimentsView } from "@/components/demo/experiments-view";

export const metadata: Metadata = { title: "Experimentos · Tracer" };

export default function ExperimentsPage() {
  return <ExperimentsView />;
}
