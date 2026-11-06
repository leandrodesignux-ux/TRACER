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
import { clearStored, useStored } from "@/lib/storage";

export type Message = { id: string; role: "user"; text: string };

type WorkspaceContextValue = {
  draft: string;
  setDraft: (value: string) => void;
  composerRef: RefObject<HTMLTextAreaElement | null>;
  /** Deja una pregunta en el composer y le pone el foco. */
  fillComposer: (text: string) => void;
  messages: Message[];
  sendMessage: () => void;
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

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const composerRef = useRef<HTMLTextAreaElement | null>(null);

  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [sources, setSources] = useState<SourceId[]>(SOURCES.map((s) => s.id));
  const [period, setPeriod] = useState<PeriodId>("7d");
  const [findingsOpen, setFindingsOpen] = useState(false);
  const [readIds, setReadIds] = useStored<string[]>("read-findings", EMPTY_IDS);

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
    setMessages((prev) => [
      ...prev,
      { id: `m-${prev.length + 1}`, role: "user", text },
    ]);
    setDraft("");
  }, [draft]);

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
    setMessages([]);
    setDraft("");
    if (pathname !== "/") router.push("/");
    focusComposer();
  }, [pathname, router, focusComposer]);

  const resetDemo = useCallback(() => {
    clearStored();
    setMessages([]);
    setDraft("");
    setSources(SOURCES.map((s) => s.id));
    setPeriod("7d");
  }, []);

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      draft,
      setDraft,
      composerRef,
      fillComposer,
      messages,
      sendMessage,
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
      sendMessage,
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
