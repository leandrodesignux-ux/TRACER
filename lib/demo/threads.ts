import {
  resolveDemoResponse,
  type DemoResponse,
} from "@/lib/demo/responses";
import type { SourceId } from "@/lib/data/types";
import type { PeriodId } from "@/lib/data/types";

export type UserMessage = {
  id: string;
  role: "user";
  text: string;
};

export type AssistantMessage = {
  id: string;
  role: "assistant";
  intent: string;
  prompt: string;
  period: PeriodId;
  sources: SourceId[];
  asOf: string;
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

export function responseForMessage(message: AssistantMessage): DemoResponse {
  return resolveDemoResponse({
    prompt: message.prompt,
    period: message.period,
    enabledSources: message.sources,
    asOf: message.asOf ? new Date(message.asOf) : undefined,
  });
}
