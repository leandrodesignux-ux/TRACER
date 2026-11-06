"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

import { Composer } from "@/components/workspace/composer";
import { Panel } from "@/components/workspace/panel";
import { TracerMark } from "@/components/workspace/tracer-logo";
import { ViewHeader } from "@/components/workspace/view-header";
import { useWorkspace } from "@/components/workspace/workspace-provider";
import { ASSISTANT, SUGGESTIONS } from "@/lib/demo/home";

export function AssistantView() {
  const { messages, fillComposer } = useWorkspace();
  const empty = messages.length === 0;
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  return (
    <>
      <ViewHeader title={ASSISTANT.title} status={ASSISTANT.status} actions />

      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4 sm:px-6">
          {empty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="m-auto flex flex-col items-center gap-3 py-10 text-center"
            >
              <TracerMark className="size-6 text-primary" />
              <h2 className="max-w-[14ch] font-heading text-3xl leading-tight font-light tracking-tighter text-balance sm:text-4xl">
                {ASSISTANT.emptyTitle}
              </h2>
            </motion.div>
          ) : (
            <ol className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-2">
              <AnimatePresence initial={false}>
                {messages.map((m) => (
                  <motion.li
                    key={m.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-nav-active px-3.5 py-2 text-sm text-nav-active-foreground"
                  >
                    <span className="sr-only">Tú: </span>
                    {m.text}
                  </motion.li>
                ))}
              </AnimatePresence>
              <Thinking />
              <div ref={endRef} />
            </ol>
          )}
        </div>

        <div className="grid gap-3 p-3 sm:p-4">
          {empty && (
            <ul
              aria-label="Sugerencias"
              className="-mx-3 flex gap-2 overflow-x-auto px-3 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
            >
              {SUGGESTIONS.map((s, i) => (
                <motion.li
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: 0.2 + i * 0.05 }}
                  className="shrink-0"
                >
                  <button
                    type="button"
                    onClick={() => fillComposer(s.prompt)}
                    className="flex h-8 items-center gap-2 rounded-full border border-panel-border bg-card/70 px-3 text-xs whitespace-nowrap shadow-xs transition-colors outline-none hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <TracerMark className="size-3.5 text-primary" />
                    {s.label}
                  </button>
                </motion.li>
              ))}
            </ul>
          )}
          <Composer />
        </div>
      </Panel>
    </>
  );
}

function Thinking() {
  return (
    <li
      role="status"
      className="flex items-start gap-3 text-sm text-muted-foreground"
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <TracerMark className="size-4" />
      </span>
      <span className="grid gap-0.5 pt-1">
        <span className="flex items-center gap-1.5 text-foreground">
          {ASSISTANT.thinking}
          <span aria-hidden className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1 animate-pulse rounded-full bg-primary motion-reduce:animate-none"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
        </span>
        <span className="text-xs">{ASSISTANT.thinkingNote}</span>
      </span>
    </li>
  );
}
