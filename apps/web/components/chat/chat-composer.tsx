"use client";

import type { ChatComposerProps } from "@/types/chat";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Command, Square } from "lucide-react";
import { useEffect, useState } from "react";
import type { KeyboardEvent } from "react";
import { MESSAGE_LENGTH_LIMIT } from "@/lib/constants";
import { starterPrompts } from "./prompts";

export function ChatComposer({
  draft,
  isSending,
  textareaRef,
  onDraftChange,
  onSelectPrompt,
  onSend,
  onStop,
}: ChatComposerProps) {
  const [activeCommand, setActiveCommand] = useState(0);
  const [commandsDismissed, setCommandsDismissed] = useState(false);
  const commandMatches =
    !commandsDismissed && draft.startsWith("/") && !draft.includes(" ")
      ? starterPrompts.filter(({ command }) => command.startsWith(draft.toLowerCase()))
      : [];

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
  }, [draft, textareaRef]);

  function updateDraft(value: string) {
    onDraftChange(value);
    setActiveCommand(0);
    setCommandsDismissed(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.nativeEvent.isComposing) return;
    if (commandMatches.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveCommand((index) => (index + 1) % commandMatches.length);
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveCommand((index) => (index - 1 + commandMatches.length) % commandMatches.length);
        return;
      }
      if (event.key === "Enter" || event.key === "Tab") {
        event.preventDefault();
        onSelectPrompt(commandMatches[activeCommand]?.prompt ?? commandMatches[0].prompt);
        setCommandsDismissed(true);
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        setCommandsDismissed(true);
        return;
      }
    }

    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
      className="glass-control relative rounded-[26px] p-3 transition-colors focus-within:border-accent/35 sm:p-4"
    >
      <AnimatePresence>
        {commandMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="glass-control absolute inset-x-0 bottom-full z-20 mb-2 overflow-hidden rounded-2xl p-1.5"
            role="listbox"
            aria-label="Prompt commands"
          >
            {commandMatches.map(({ icon: Icon, label, command, prompt }, index) => (
              <button
                key={command}
                type="button"
                role="option"
                aria-selected={index === activeCommand}
                onClick={() => {
                  onSelectPrompt(prompt);
                  setCommandsDismissed(true);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${index === activeCommand ? "bg-subtle text-foreground" : "text-muted hover:bg-subtle hover:text-foreground"}`}
              >
                <Icon aria-hidden="true" className="h-4 w-4 text-accent" />
                <span className="flex-1">{label}</span>
                <span className="text-xs text-muted">{command}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <label htmlFor="chat-message" className="sr-only">
        Message Eitri
      </label>
      <textarea
        ref={textareaRef}
        id="chat-message"
        value={draft}
        onChange={(event) => updateDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask about your next build..."
        rows={2}
        maxLength={MESSAGE_LENGTH_LIMIT}
        className="max-h-44 min-h-16 w-full resize-none bg-transparent px-2 py-2 text-sm leading-relaxed text-foreground outline-none placeholder:text-muted/70 disabled:opacity-60"
      />
      <div className="flex items-center justify-between gap-3 border-t border-border/50 px-1 pt-3">
        <button
          type="button"
          onClick={() => {
            updateDraft("/");
            textareaRef.current?.focus();
          }}
          disabled={isSending}
          aria-label="Browse prompt commands"
          className="flex h-9 items-center gap-2 rounded-full px-3 text-xs text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent disabled:opacity-40"
        >
          <Command aria-hidden="true" className="h-4 w-4" />
          <span>Prompts</span>
        </button>
        {isSending ? (
          <button
            type="button"
            onClick={onStop}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-medium text-background"
          >
            <Square className="h-3 w-3" />
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!draft.trim() || isSending}
            className="inline-flex h-9 items-center gap-2 rounded-full border border-foreground/20 bg-accent px-4 text-sm font-semibold text-accent-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.3)] transition-colors hover:bg-accent/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40"
          >
            Send <ArrowUp aria-hidden="true" className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}
