import type { Metadata } from "next";

import { SessionsView } from "@/components/data/sessions-view";

export const metadata: Metadata = { title: "Sesiones · Tracer" };

export default function SessionsPage() {
  return <SessionsView />;
}
