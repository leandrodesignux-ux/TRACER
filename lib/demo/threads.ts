import type { DemoResponse } from "@/lib/demo/responses";
import type { SourceId } from "@/lib/data/types";

export type UserMessage = {
  id: string;
  role: "user";
  text: string;
};

export type AssistantMessage = {
  id: string;
  role: "assistant";
  response: DemoResponse;
  status: "running" | "complete" | "stopped";
};

export type ConversationMessage = UserMessage | AssistantMessage;

export type AnalysisThread = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  sources: SourceId[];
  status: "en_curso" | "completo";
  messages: ConversationMessage[];
};

export function threadTitle(prompt: string) {
  const clean = prompt.trim().replace(/\s+/g, " ");
  return clean.length > 48 ? `${clean.slice(0, 47)}…` : clean;
}
