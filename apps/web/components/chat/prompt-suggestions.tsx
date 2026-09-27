"use client";

import { starterPrompts } from "./prompts";

type PromptSuggestionsProps = {
  onSelect: (prompt: string) => void;
};

export function PromptSuggestions({ onSelect }: PromptSuggestionsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2.5" aria-label="Suggested questions">
      {starterPrompts.map(({ icon: Icon, label, prompt }) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(prompt)}
          className="glass-control inline-flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm text-muted transition-colors hover:border-accent/50 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Icon aria-hidden="true" className="h-4 w-4 text-accent" />
          {label}
        </button>
      ))}
    </div>
  );
}
