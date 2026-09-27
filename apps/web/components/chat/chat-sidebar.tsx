"use client";

import { CircuitBoard, Database, MessageSquare, PanelLeft, PanelLeftClose, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

type ChatSidebarProps = {
  hasConversation: boolean;
  isSending: boolean;
  onNewChat: () => void;
};

type SidebarContentProps = ChatSidebarProps & {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
};

function SidebarContent({
  hasConversation,
  isSending,
  onNewChat,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarContentProps) {
  return (
    <div className={`flex h-full flex-col pb-5 pt-6 ${isCollapsed ? "px-3" : "px-4"}`}>
      <div className={`flex h-9 items-center ${isCollapsed ? "justify-center" : "justify-between px-2"}`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent/20 bg-accent/10 text-accent">
              <CircuitBoard aria-hidden="true" className="h-[19px] w-[19px]" />
            </div>
            <div>
              <p className="text-sm font-semibold tracking-tight text-foreground">Eitri Forge</p>
              <p className="text-xs text-muted">Build assistant</p>
            </div>
          </div>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!isCollapsed}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-foreground/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          >
            {isCollapsed ? <PanelLeft aria-hidden="true" className="h-5 w-5" /> : <PanelLeftClose aria-hidden="true" className="h-5 w-5" />}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNewChat}
        disabled={isSending}
        aria-label={isCollapsed ? "New chat" : undefined}
        title={isCollapsed ? "New chat" : undefined}
        className={`mt-9 flex h-11 w-full items-center rounded-xl border border-foreground/10 bg-foreground/5 text-sm font-medium text-foreground shadow-[inset_0_1px_0_hsl(var(--foreground)/0.08)] transition-colors hover:bg-foreground/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40 ${isCollapsed ? "justify-center" : "gap-3 px-3"}`}
      >
        <Plus aria-hidden="true" className="h-4 w-4 shrink-0" />
        {!isCollapsed && "New chat"}
      </button>

      <div className="mt-9">
        {!isCollapsed && <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Conversation</p>}
        {hasConversation ? (
          <div
            aria-current="page"
            aria-label={isCollapsed ? "Current chat" : undefined}
            title={isCollapsed ? "Current chat" : undefined}
            className={`flex items-center rounded-xl bg-foreground/10 py-3 text-sm text-foreground ${isCollapsed ? "justify-center" : "mt-3 gap-3 px-3"}`}
          >
            <MessageSquare aria-hidden="true" className="h-4 w-4 shrink-0 text-accent" />
            {!isCollapsed && <span className="truncate">Current chat</span>}
          </div>
        ) : (
          !isCollapsed && <p className="mt-3 px-3 text-sm leading-6 text-muted">No conversation yet</p>
        )}
      </div>

      <div className={`mt-auto border-t border-border/60 pt-5 ${isCollapsed ? "flex justify-center" : "px-3"}`}>
        <div className="flex items-start gap-3" title={isCollapsed ? "Sample inventory" : undefined}>
          <Database aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
          {!isCollapsed && (
            <div>
              <p className="text-xs font-medium text-foreground">Sample inventory</p>
              <p className="mt-1 text-xs leading-5 text-muted">Prices and stock are for demonstration.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatSidebar({ hasConversation, isSending, onNewChat }: ChatSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [isOpen]);

  function startNewChat() {
    onNewChat();
    setIsOpen(false);
  }

  return (
    <>
      <aside aria-label="Chat navigation" className={`hidden h-full shrink-0 overflow-hidden border-r border-border/70 bg-surface/60 backdrop-blur-2xl transition-[width] duration-200 lg:block ${isCollapsed ? "w-[72px]" : "w-64"}`}>
        <SidebarContent
          hasConversation={hasConversation}
          isSending={isSending}
          onNewChat={startNewChat}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed((current) => !current)}
        />
      </aside>

      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border/60 bg-surface/50 px-5 backdrop-blur-xl lg:hidden">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open sidebar"
          aria-expanded={isOpen}
          aria-controls="mobile-chat-sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-foreground/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        >
          <PanelLeft aria-hidden="true" className="h-5 w-5" />
        </button>
        <span className="text-sm font-semibold">Eitri Forge</span>
        <div className="h-9 w-9" aria-hidden="true" />
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close sidebar"
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
          />
          <aside id="mobile-chat-sidebar" aria-label="Chat navigation" className="absolute inset-y-0 left-0 w-72 border-r border-border/70 bg-surface shadow-2xl">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close sidebar"
              className="absolute right-4 top-6 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-foreground/10 hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
            <SidebarContent hasConversation={hasConversation} isSending={isSending} onNewChat={startNewChat} />
          </aside>
        </div>
      )}
    </>
  );
}
