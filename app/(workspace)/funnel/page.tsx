import type { Metadata } from "next";

import { FunnelView } from "@/components/data/funnel-view";

export const metadata: Metadata = { title: "Funnel · Tracer" };

export default function FunnelPage() {
  return <FunnelView />;
}
