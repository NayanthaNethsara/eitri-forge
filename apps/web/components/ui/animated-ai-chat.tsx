"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Cpu, HardDrive, Monitor, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const suggestions = [
  {
    icon: Cpu,
    label: "Gaming build",
    prompt: "Help me choose parts for a gaming PC. Ask for my budget and target games first.",
  },
  {
    icon: Monitor,
    label: "Workstation",
    prompt: "Help me plan a workstation PC. Ask about my software and budget first.",
  },
  {
    icon: HardDrive,
    label: "Check a part",
    prompt: "Help me find a part in stock. Ask which category and specs I need.",
  },
];

export function AnimatedAIChat() {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationRef.current?.scrollTo({
      top: conversationRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isSending]);

  function resizeTextarea() {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }

  async function sendMessage(prompt = draft) {
    const content = prompt.trim();
    if (!content || isSending) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setError(null);
    setIsSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-20) }),
      });
      const result: { reply?: string; detail?: string } = await response.json();
      if (!response.ok || !result.reply) {
        throw new Error(result.detail ?? "The assistant is unavailable. Please try again.");
      }
      setMessages((current) => [...current, { role: "assistant", content: result.reply! }]);
    } catch (cause) {
      setMessages(messages);
      setDraft(content);
      setError(cause instanceof Error ? cause.message : "The assistant is unavailable. Please try again.");
    } finally {
      setIsSending(false);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage();
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12 text-foreground sm:px-6">
      <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-1/4 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-9 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium tracking-wide text-accent">
            <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
            EITRI FORGE
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Build a PC that fits your world.
          </h1>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Explore parts, compare options, and check demo inventory with Eitri.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          aria-label="Chat with Eitri"
          className="overflow-hidden rounded-2xl border border-muted/20 bg-surface/90 shadow-2xl shadow-background/60 backdrop-blur-xl"
        >
          <div
            ref={conversationRef}
            role="log"
            aria-live="polite"
            aria-relevant="additions"
            className="max-h-[55vh] min-h-32 space-y-4 overflow-y-auto px-5 py-5 sm:px-6"
          >
            {messages.length === 0 ? (
              <p className="py-5 text-center text-sm text-muted">
                Tell me your budget, your workload, or a part you are looking for.
              </p>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-accent text-background" : "border border-muted/20 bg-background text-foreground"}`}>
                      {message.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            {isSending && <p className="text-sm text-muted" role="status">Eitri is thinking...</p>}
          </div>

          <div className="border-t border-muted/20 p-3 sm:p-4">
            <label htmlFor="chat-message" className="sr-only">Message Eitri</label>
            <textarea
              ref={textareaRef}
              id="chat-message"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value);
                resizeTextarea();
              }}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a build, a part, or stock availability..."
              rows={2}
              maxLength={4000}
              disabled={isSending}
              className="max-h-44 min-h-16 w-full resize-none bg-transparent px-2 py-2 text-sm text-foreground outline-none placeholder:text-muted/70 disabled:opacity-60"
            />
            <div className="flex items-center justify-between gap-3 px-2 pb-1">
              <span className="text-xs text-muted">Enter to send. Shift + Enter for a new line.</span>
              <button
                type="button"
                onClick={() => void sendMessage()}
                disabled={!draft.trim() || isSending}
                aria-label="Send message"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-background transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                <ArrowUp aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.section>

        {error && <p role="alert" className="mt-3 text-center text-sm text-destructive">{error}</p>}

        {messages.length === 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {suggestions.map(({ icon: Icon, label, prompt }) => (
              <button
                key={label}
                type="button"
                onClick={() => void sendMessage(prompt)}
                disabled={isSending}
                className="inline-flex items-center gap-2 rounded-xl border border-muted/20 bg-surface/70 px-4 py-2.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
              >
                <Icon aria-hidden="true" className="h-4 w-4 text-accent" />
                {label}
              </button>
            ))}
          </div>
        )}

        <p className="mt-7 text-center text-xs text-muted/80">
          Inventory shown here is sample data. Confirm prices and compatibility with the retailer.
        </p>
      </div>
    </main>
  );
}
