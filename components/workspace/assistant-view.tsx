"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";

import { AssistantResponse } from "@/components/demo/assistant-response";
import { Composer } from "@/components/workspace/composer";
import { Panel } from "@/components/workspace/panel";
import { TracerBadge, TracerMark } from "@/components/workspace/tracer-logo";
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

      <Panel className="flex min-h-0 flex-1 flex-col overflow-hidden glow-bottom">
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pt-4 sm:px-6">
          {empty ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
              className="m-auto flex flex-col items-center gap-3 py-10 text-center"
            >
              <TracerBadge />
              <h2 className="max-w-[14ch] font-heading text-2xl leading-tight font-medium tracking-heading text-balance sm:text-3xl">
                {ASSISTANT.emptyTitle}
              </h2>
            </motion.div>
          ) : (
            <ol className="mx-auto flex w-full max-w-2xl flex-col gap-4 py-2">
              <AnimatePresence initial={false}>
                {messages.map((message) =>
                  message.role === "user" ? (
                    <motion.li
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-nav-active px-3.5 py-2 text-sm text-nav-active-foreground"
                    >
                      <span className="sr-only">Tú: </span>
                      {message.text}
                    </motion.li>
                  ) : (
                    <motion.li
                      key={message.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                    >
                      <AssistantResponse message={message} />
                    </motion.li>
                  ),
                )}
              </AnimatePresence>
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
                    className="flex h-8 items-center gap-2 rounded-full border border-panel-outline bg-card/80 px-3 text-xs whitespace-nowrap shadow-xs transition-colors outline-none hover:bg-card focus-visible:ring-3 focus-visible:ring-ring/50"
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
