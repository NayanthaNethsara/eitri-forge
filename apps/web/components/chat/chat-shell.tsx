"use client";

import { useRef, useState } from "react";
import { ChatComposer } from "./chat-composer";
import { ChatConversation } from "./chat-conversation";
import { ChatSidebar } from "./chat-sidebar";
import { PromptSuggestions } from "./prompt-suggestions";
import type { ChatMessage } from "./types";

const unavailableMessage = "The assistant is unavailable. Please try again.";

export function ChatShell() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function selectPrompt(prompt: string) {
    setDraft(prompt);
    setError(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function startNewChat() {
    setMessages([]);
    setDraft("");
    setError(null);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  async function sendMessage() {
    const content = draft.trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content },
    ];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-20).map(({ role, content }) => ({ role, content })),
        }),
      });
      const result = (await response.json()) as { reply?: unknown; detail?: unknown };

      if (!response.ok || typeof result.reply !== "string") {
        throw new Error(typeof result.detail === "string" ? result.detail : unavailableMessage);
      }

      setMessages([
        ...nextMessages,
        { id: crypto.randomUUID(), role: "assistant", content: result.reply },
      ]);
    } catch (cause) {
      setMessages(messages);
      setDraft(content);
      setError(cause instanceof Error ? cause.message : unavailableMessage);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="ambient-stage relative flex h-[100dvh] min-h-[480px] flex-col overflow-hidden text-foreground lg:flex-row">
      <ChatSidebar hasConversation={messages.length > 0} isSending={isSending} onNewChat={startNewChat} />

      <div className={`relative z-10 mx-auto flex w-full min-h-0 flex-1 flex-col px-5 sm:px-7 ${messages.length > 0 ? "max-w-4xl pb-4 pt-4" : "max-w-3xl justify-center pb-10 pt-10"}`}>
        {messages.length === 0 && (
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              What are you building?
            </h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted sm:text-base">
              Share a budget, a workload, or a part you already own.
            </p>
          </div>
        )}

        {messages.length > 0 && (
          <ChatConversation messages={messages} isSending={isSending} />
        )}

        <div className="shrink-0">
          <ChatComposer
            draft={draft}
            isSending={isSending}
            textareaRef={textareaRef}
            onDraftChange={setDraft}
            onSelectPrompt={selectPrompt}
            onSend={() => void sendMessage()}
          />
        </div>

        {error && <p role="alert" className="mt-3 text-center text-sm text-destructive">{error}</p>}

        {messages.length === 0 && (
          <div className="mt-6">
            <PromptSuggestions onSelect={selectPrompt} />
          </div>
        )}

        <p className={`text-center text-xs leading-5 text-muted/80 ${messages.length > 0 ? "mt-3" : "mt-7"}`}>
          Sample inventory only. Confirm prices and compatibility with the retailer.
        </p>
      </div>
    </main>
  );
}
