import type { Metadata } from "next";

import { CrmView } from "@/components/data/crm-view";

export const metadata: Metadata = { title: "CRM · Tracer" };

export default function CrmPage() {
  return <CrmView />;
}
