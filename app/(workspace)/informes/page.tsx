import type { Metadata } from "next";

import { ReportsView } from "@/components/demo/reports-view";

export const metadata: Metadata = { title: "Informes · Tracer" };
export default function ReportsPage() { return <ReportsView />; }
