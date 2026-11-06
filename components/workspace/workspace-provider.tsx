"use client";

import { MotionConfig } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

import {
  SOURCES,
  type Finding,
  type PeriodId,
  type SourceId,
} from "@/lib/demo/home";
import { resolveDemoResponse } from "@/lib/demo/responses";
import {
  threadTitle,
  type AnalysisThread,
  type ConversationMessage,
} from "@/lib/demo/threads";
import { clearStored, useStored } from "@/lib/storage";

type WorkspaceContextValue = {
  draft: string;
  setDraft: (value: string) => void;
  composerRef: RefObject<HTMLTextAreaElement | null>;
  /** Deja una pregunta en el composer y le pone el foco. */
  fillComposer: (text: string) => void;
  messages: ConversationMessage[];
  threads: AnalysisThread[];
  currentThreadId: string | null;
  sendMessage: () => void;
  setAssistantStatus: (
    messageId: string,
    status: "complete" | "stopped",
  ) => void;
  openThread: (threadId: string) => void;
  sources: SourceId[];
  setSources: (value: SourceId[]) => void;
  period: PeriodId;
  setPeriod: (value: PeriodId) => void;
  isUnread: (finding: Finding) => boolean;
  markRead: (id: string) => void;
  findingsOpen: boolean;
  setFindingsOpen: (open: boolean) => void;
  newAnalysis: () => void;
  resetDemo: () => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

const EMPTY_IDS: string[] = [];
const EMPTY_THREADS: AnalysisThread[] = [];

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const [draft, setDraft] = useState("");
  const [sources, setSources] = useState<SourceId[]>(SOURCES.map((s) => s.id));
  const [period, setPeriod] = useState<PeriodId>("7d");
  const [findingsOpen, setFindingsOpen] = useState(false);
  const [readIds, setReadIds] = useStored<string[]>("read-findings", EMPTY_IDS);
  const [threads, setThreads] = useStored<AnalysisThread[]>(
    "analysis-threads",
    EMPTY_THREADS,
  );
  const [currentThreadId, setCurrentThreadId] = useStored<string | null>(
    "current-thread",
    null,
  );
  const currentThread = threads.find((thread) => thread.id === currentThreadId);
  const messages = useMemo(
    () => currentThread?.messages ?? [],
    [currentThread],
  );

  const focusComposer = useCallback(() => {
    // Espera al siguiente frame: el composer puede estar montándose o detrás de un Sheet.
    requestAnimationFrame(() => {
      const el = composerRef.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }, []);

  const fillComposer = useCallback(
    (text: string) => {
      setDraft(text);
      setFindingsOpen(false);
      if (pathname !== "/") router.push("/");
      focusComposer();
    },
    [pathname, router, focusComposer],
  );

  const sendMessage = useCallback(() => {
    const text = draft.trim();
    if (!text) return;
    const now = new Date().toISOString();
    const nonce = Date.now();
    const response = resolveDemoResponse({
      prompt: text,
      period,
      enabledSources: sources,
    });
    const nextMessages: ConversationMessage[] = [
      ...(currentThread?.messages ?? []),
      { id: `u-${nonce}`, role: "user", text },
      {
        id: `a-${nonce}`,
        role: "assistant",
        response,
        status: "running",
      },
    ];
    const thread: AnalysisThread = currentThread
      ? {
          ...currentThread,
          updatedAt: now,
          sources: [...new Set([...currentThread.sources, ...response.sourceIds])],
          status: "en_curso",
          messages: nextMessages,
        }
      : {
          id: `thread-${nonce}`,
          title: threadTitle(text),
          createdAt: now,
          updatedAt: now,
          sources: response.sourceIds,
          status: "en_curso",
          messages: nextMessages,
        };
    setThreads([
      thread,
      ...threads.filter((item) => item.id !== thread.id),
    ]);
    setCurrentThreadId(thread.id);
    setDraft("");
  }, [currentThread, draft, period, setCurrentThreadId, setThreads, sources, threads]);

  const setAssistantStatus = useCallback(
    (messageId: string, status: "complete" | "stopped") => {
      if (!currentThread) return;
      const messages = currentThread.messages.map((message) =>
        message.id === messageId && message.role === "assistant"
          ? { ...message, status }
          : message,
      );
      const hasRunning = messages.some(
        (message) => message.role === "assistant" && message.status === "running",
      );
      setThreads(
        threads.map((thread) =>
          thread.id === currentThread.id
            ? {
                ...thread,
                messages,
                status: hasRunning ? "en_curso" : "completo",
              }
            : thread,
        ),
      );
    },
    [currentThread, setThreads, threads],
  );

  const openThread = useCallback(
    (threadId: string) => {
      setCurrentThreadId(threadId);
      if (pathname !== "/") router.push("/");
    },
    [pathname, router, setCurrentThreadId],
  );

  const markRead = useCallback(
    (id: string) => {
      if (readIds.includes(id)) return;
      setReadIds([...readIds, id]);
    },
    [readIds, setReadIds],
  );

  const isUnread = useCallback(
    (finding: Finding) => finding.unread && !readIds.includes(finding.id),
    [readIds],
  );

  const newAnalysis = useCallback(() => {
    setCurrentThreadId(null);
    setDraft("");
    if (pathname !== "/") router.push("/");
    focusComposer();
  }, [pathname, router, focusComposer, setCurrentThreadId]);

  const resetDemo = useCallback(() => {
    clearStored();
    setThreads([]);
    setCurrentThreadId(null);
    setDraft("");
    setSources(SOURCES.map((s) => s.id));
    setPeriod("7d");
  }, [setCurrentThreadId, setThreads]);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      draft,
      setDraft,
      composerRef,
      fillComposer,
      messages,
      threads,
      currentThreadId,
      sendMessage,
      setAssistantStatus,
      openThread,
      sources,
      setSources,
      period,
      setPeriod,
      isUnread,
      markRead,
      findingsOpen,
      setFindingsOpen,
      newAnalysis,
      resetDemo,
    }),
    [
      draft,
      fillComposer,
      messages,
      threads,
      currentThreadId,
      sendMessage,
      setAssistantStatus,
      openThread,
      sources,
      period,
      isUnread,
      markRead,
      findingsOpen,
      newAnalysis,
      resetDemo,
    ],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error("useWorkspace se usa dentro de WorkspaceProvider.");
  }
  return context;
}
