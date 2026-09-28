"use client";

import { useEffect, useRef, useState } from "react";
import { requestChat } from "@/lib/chat/client";
import { ASSISTANT_UNAVAILABLE, MESSAGE_LENGTH_LIMIT } from "@/lib/constants";
import type { ChatMessage } from "@/types/chat";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pending = useRef<AbortController | null>(null);
  const retryMessages = useRef<ChatMessage[] | null>(null);
  useEffect(() => () => pending.current?.abort(), []);

  async function submit(next: ChatMessage[]) {
    if (pending.current) return;
    const controller = new AbortController();
    pending.current = controller;
    retryMessages.current = next;
    setMessages(next);
    setError(null);
    setIsSending(true);
    try {
      const result = await requestChat(next, controller.signal);
      setMessages([
        ...next,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.reply,
          products: result.products,
        },
      ]);
      retryMessages.current = null;
    } catch (cause) {
      setError(
        controller.signal.aborted
          ? "Response stopped. Retry when you are ready."
          : cause instanceof Error
            ? cause.message
            : ASSISTANT_UNAVAILABLE,
      );
    } finally {
      pending.current = null;
      setIsSending(false);
    }
  }

  function send(content: string) {
    if (pending.current || !content.trim() || content.length > MESSAGE_LENGTH_LIMIT) return false;
    const history = messages.at(-1)?.role === "user" ? messages.slice(0, -1) : messages;
    void submit([...history, { id: crypto.randomUUID(), role: "user", content: content.trim() }]);
    return true;
  }

  function reset() {
    if (pending.current) return;
    setMessages([]);
    setError(null);
    retryMessages.current = null;
  }

  return {
    messages,
    isSending,
    error,
    send,
    reset,
    stop: () => pending.current?.abort(),
    retry: () => {
      if (retryMessages.current) void submit(retryMessages.current);
    },
  };
}
