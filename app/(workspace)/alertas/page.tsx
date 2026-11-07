import type { Metadata } from "next";

import { AlertsView } from "@/components/demo/alerts-view";

export const metadata: Metadata = { title: "Alertas · Tracer" };
export default function AlertsPage() { return <AlertsView />; }
