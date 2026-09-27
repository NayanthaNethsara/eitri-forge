"use client";

import { motion } from "framer-motion";
import { CircuitBoard } from "lucide-react";
import { useEffect, useRef } from "react";
import type { ChatMessage } from "./types";

type ChatConversationProps = {
  messages: ChatMessage[];
  isSending: boolean;
};

export function ChatConversation({ messages, isSending }: ChatConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isSending]);

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Conversation with Eitri"
      aria-live="polite"
      aria-relevant="additions"
      className="min-h-0 flex-1 space-y-8 overflow-y-auto px-1 pb-6 pt-5 sm:px-4 sm:pt-8"
    >
      {messages.map((message) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role === "assistant" && (
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
              <CircuitBoard aria-hidden="true" className="h-4 w-4" />
            </div>
          )}
          <div className={`${message.role === "user" ? "max-w-[85%] rounded-2xl rounded-tr-md bg-subtle px-4 py-3 sm:max-w-[75%]" : "max-w-[92%] pt-1 sm:max-w-[86%]"}`}>
            {message.role === "assistant" && (
              <p className="mb-1 text-xs font-semibold text-accent">Eitri</p>
            )}
            <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">{message.content}</p>
          </div>
        </motion.div>
      ))}
      {isSending && (
        <div role="status" className="flex items-center gap-3 text-sm text-muted">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
            <CircuitBoard aria-hidden="true" className="h-4 w-4" />
          </div>
          Eitri is thinking<span aria-hidden="true" className="animate-pulse">...</span>
        </div>
      )}
    </div>
  );
}
