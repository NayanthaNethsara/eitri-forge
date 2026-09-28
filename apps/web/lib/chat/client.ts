import {
  ASSISTANT_UNAVAILABLE,
  CHAT_HISTORY_LIMIT,
  CHAT_TIMEOUT_MS,
  MESSAGE_LENGTH_LIMIT,
} from "@/lib/constants";
import { chatErrorSchema, chatRequestSchema, chatResponseSchema } from "./schema";
import type { ChatMessage, ChatResponse } from "@/types/chat";

export async function requestChat(
  messages: ChatMessage[],
  signal: AbortSignal,
): Promise<ChatResponse> {
  const payload = chatRequestSchema.parse({
    messages: messages
      .slice(-CHAT_HISTORY_LIMIT)
      .map(({ role, content }) => ({ role, content: content.slice(0, MESSAGE_LENGTH_LIMIT) })),
  });
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.any([signal, AbortSignal.timeout(CHAT_TIMEOUT_MS + 5000)]),
  });
  const result: unknown = await response.json();
  if (!response.ok) {
    const error = chatErrorSchema.safeParse(result);
    throw new Error(error.success ? error.data.detail : ASSISTANT_UNAVAILABLE);
  }
  const parsed = chatResponseSchema.safeParse(result);
  if (!parsed.success) throw new Error("The assistant returned an invalid response. Please retry.");
  return parsed.data;
}
