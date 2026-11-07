import type { Metadata } from "next";

import { SourcesView } from "@/components/demo/sources-view";

export const metadata: Metadata = { title: "Fuentes · Tracer" };
export default function SourcesPage() { return <SourcesView />; }
