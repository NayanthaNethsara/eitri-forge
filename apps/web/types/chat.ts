import type { z } from "zod";
import type { chatResponseSchema } from "@/lib/chat/schema";
import type { RefObject } from "react";
import type { LucideIcon } from "lucide-react";
import type { CartItem, Product } from "@/types/shopping";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  products?: Product[];
};

export type ChatResponse = z.infer<typeof chatResponseSchema>;

export type ChatConversationProps = {
  messages: ChatMessage[];
  isSending: boolean;
  cart: CartItem[];
  onAdd: (product: Product) => void;
  onAsk: (prompt: string) => void;
};

export type PromptSuggestionsProps = {
  onSelect: (prompt: string) => void;
};

export type ChatComposerProps = {
  draft: string;
  isSending: boolean;
  textareaRef: RefObject<HTMLTextAreaElement | null>;
  onDraftChange: (draft: string) => void;
  onSelectPrompt: (prompt: string) => void;
  onSend: () => void;
  onStop: () => void;
};

export type StarterPrompt = {
  icon: LucideIcon;
  label: string;
  command: string;
  prompt: string;
};

export type ChatSidebarProps = {
  hasConversation: boolean;
  conversationTitle?: string;
  isSending: boolean;
  onNewChat: () => void;
};

export type SidebarContentProps = ChatSidebarProps & {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

export type MessageContentProps = { content: string };
