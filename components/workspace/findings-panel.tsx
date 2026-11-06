"use client";

import {
  FlaskConical,
  RefreshCw,
  Rocket,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import {
  FINDING_TABS,
  FINDINGS,
  FINDINGS_FOOTER,
  formatAgo,
  type Finding,
  type FindingCategory,
  type FindingIcon,
  type FindingTone,
} from "@/lib/demo/home";
import { cn } from "@/lib/utils";

const ICONS: Record<FindingIcon, LucideIcon> = {
  drop: TrendingDown,
  deploy: Rocket,
  experiment: FlaskConical,
  sync: RefreshCw,
};

const TONES: Record<FindingTone, string> = {
  destructive: "bg-destructive/10 text-destructive",
  warning: "bg-chart-2/15 text-source-ga4",
  primary: "bg-primary/10 text-primary",
  muted: "bg-muted text-muted-foreground",
};

type TabId = "todo" | FindingCategory;

export function FindingsPanel({ className }: { className?: string }) {
  const [tab, setTab] = useState<TabId>("todo");
  const items =
    tab === "todo" ? FINDINGS : FINDINGS.filter((f) => f.category === tab);

  return (
    <section
      aria-labelledby="hallazgos-titulo"
      className={cn("flex min-h-0 flex-1 flex-col", className)}
    >
      <h2
        id="hallazgos-titulo"
        className="px-4 pt-4 font-heading text-base font-light tracking-tight"
      >
        Hallazgos
      </h2>

      <Tabs
        value={tab}
        onValueChange={(value) => setTab(value as TabId)}
        className="px-3 pt-3"
      >
        <TabsList className="h-8 w-full rounded-full border border-panel-border bg-panel p-0.5">
          {FINDING_TABS.map((t) => (
            <TabsTrigger
              key={t.id}
              value={t.id}
              // El hover base de Tabs gana en especificidad: el texto activo va con !.
              className="rounded-full text-[11px] font-normal data-active:bg-nav-active data-active:text-nav-active-foreground! data-active:shadow-none dark:data-active:border-transparent dark:data-active:bg-nav-active"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <motion.ul
        key={tab}
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.05 } } }}
        className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3"
      >
        {items.map((finding) => (
          <motion.li
            key={finding.id}
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <FindingItem finding={finding} />
          </motion.li>
        ))}
        {items.length === 0 && (
          <li className="px-1 py-6 text-center text-xs text-muted-foreground">
            No hay hallazgos en esta vista.
          </li>
        )}
      </motion.ul>

      <p className="px-4 pt-1 pb-4 text-[11px] text-muted-foreground">
        {FINDINGS_FOOTER}
      </p>
    </section>
  );
}

function FindingItem({ finding }: { finding: Finding }) {
  const { isUnread, markRead, fillComposer } = useWorkspace();
  const unread = isUnread(finding);
  const Icon = ICONS[finding.icon];

  return (
    <button
      type="button"
      onClick={() => {
        markRead(finding.id);
        fillComposer(finding.prompt);
      }}
      className="group flex w-full items-start gap-3 rounded-xl border border-panel-border bg-card/70 p-3 text-left shadow-xs transition-colors outline-none hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-lg",
          TONES[finding.tone],
        )}
      >
        <Icon className="size-3.5" aria-hidden />
      </span>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-xs leading-snug font-medium">{finding.title}</span>
        {finding.detail && (
          <span className="text-[11px] leading-snug text-muted-foreground">
            {finding.detail}
          </span>
        )}
        <span className="text-[11px] text-muted-foreground">
          {formatAgo(finding.minutesAgo)}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "mt-1.5 size-1.5 shrink-0 rounded-full bg-primary transition-opacity duration-300",
          unread ? "opacity-100" : "opacity-0",
        )}
      />
      {unread && <span className="sr-only">Sin leer.</span>}
    </button>
  );
}
