import type { Metadata } from "next";

import { UpcomingView } from "@/components/workspace/upcoming-view";
import { UPCOMING_VIEWS } from "@/lib/demo/home";

/** Arma la página y la metadata de una vista que llega en otra fase. */
export function upcomingPage(slug: keyof typeof UPCOMING_VIEWS) {
  const view = UPCOMING_VIEWS[slug];

  const metadata: Metadata = { title: `${view.title} · Tracer` };

  function Page() {
    return (
      <UpcomingView
        title={view.title}
        description={view.description}
        phase={view.phase}
      />
    );
  }

  return { metadata, Page };
}
