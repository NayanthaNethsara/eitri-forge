"use client";

import type { PromptSuggestionsProps } from "@/types/chat";

import { starterPrompts } from "./prompts";

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <div className="grid max-w-xl grid-cols-2 gap-2" aria-label="Suggested questions">
      {starterPrompts.map(({ icon: Icon, label, prompt }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(prompt)}
          className="inline-flex items-center gap-2 rounded-xl bg-surface/70 px-3 py-3 sm:px-4 sm:py-4 text-left text-xs text-muted transition-colors hover:bg-subtle hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-muted" />
          {label}
        </button>
      ))}
    </div>
  );
}
