"use client";

import { ArrowRight, CircuitBoard, ShoppingBag, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { APP_NAME, MESSAGE_LENGTH_LIMIT } from "@/lib/constants";
import { formatMoney } from "@/lib/utils";
import { ChatComposer } from "./chat-composer";
import { ChatConversation } from "./chat-conversation";
import { ChatSidebar } from "./chat-sidebar";
import { PromptSuggestions } from "./prompt-suggestions";
import { useChat } from "./use-chat";
import { CartPanel } from "@/components/shopping/cart-panel";
import { useCart } from "@/components/shopping/use-cart";

export function ChatShell() {
  const [draft, setDraft] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chat = useChat();
  const cart = useCart();
  const hasMessages = chat.messages.length > 0;

  function selectPrompt(prompt: string) {
    setDraft(prompt.slice(0, MESSAGE_LENGTH_LIMIT));
    requestAnimationFrame(() => textareaRef.current?.focus());
  }

  function reviewCart() {
    setCartOpen(false);
    selectPrompt(
      `Please review these selected parts for compatibility, missing components, and current availability. Recheck inventory before recommending changes:\n${cart.items.map(({ product, quantity }) => `${quantity} × ${product.name} (SKU ${product.sku})`).join("\n")}`,
    );
  }

  return (
    <main className="ambient-stage relative flex h-[100dvh] min-h-[400px] flex-col overflow-hidden text-foreground lg:flex-row">
      <ChatSidebar
        hasConversation={hasMessages}
        conversationTitle={chat.messages[0]?.content}
        isSending={chat.isSending}
        onNewChat={() => {
          chat.reset();
          setDraft("");
          textareaRef.current?.focus();
        }}
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between px-5 sm:px-8">
          <div>
            <p className="text-sm font-medium">Build assistant</p>
            <p className="mt-0.5 text-[11px] text-muted">
              Find the right parts. Put them together.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 rounded-full bg-surface px-4 py-2.5 text-xs font-medium ring-1 ring-border/60 hover:bg-subtle"
            aria-label={`Open cart, ${cart.count} items`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            Cart
            <span className="rounded-full bg-subtle px-2 py-0.5 text-[10px] tabular-nums">
              {cart.count}
            </span>
          </button>
        </header>
        <div
          className={`mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col px-5 pb-3 sm:px-8 ${hasMessages ? "" : "overflow-y-auto"}`}
        >
          {!hasMessages && (
            <div className="flex flex-1 flex-col justify-center py-6 sm:py-14">
              <div className="mb-7 flex items-center gap-3 text-muted">
                <CircuitBoard className="h-6 w-6 stroke-[1.5]" />
                <span className="text-xs tracking-wide">{APP_NAME}</span>
              </div>
              <h1 className="max-w-xl text-3xl font-medium leading-[1.15] tracking-tight sm:text-5xl">
                A better build
                <br />
                <span className="text-muted">starts here.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-muted">
                Find parts that fit your budget and the way you work or play. We’ll figure it out
                together.
              </p>
              <div className="mt-9">
                <PromptSuggestions onSelect={selectPrompt} />
              </div>
            </div>
          )}
          {hasMessages && (
            <ChatConversation
              messages={chat.messages}
              isSending={chat.isSending}
              cart={cart.items}
              onAdd={cart.add}
              onAsk={selectPrompt}
            />
          )}
          <div className="shrink-0">
            {cart.count > 0 && (
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="mb-3 flex w-full items-center justify-between rounded-xl bg-surface/70 px-4 py-3 text-xs"
              >
                <span className="flex items-center gap-2 text-muted">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {cart.count} {cart.count === 1 ? "part" : "parts"} in your cart
                </span>
                <span className="flex items-center gap-3">
                  {formatMoney(cart.subtotal, cart.items[0].product.currency)}
                  <ArrowRight className="h-3.5 w-3.5 text-muted" />
                </span>
              </button>
            )}
            {chat.error && (
              <div
                role="alert"
                className="mb-3 flex items-center justify-between gap-3 rounded-xl bg-destructive/10 px-4 py-3 text-xs"
              >
                <p className="text-destructive">{chat.error}</p>
                <button
                  type="button"
                  onClick={chat.retry}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1.5 hover:bg-subtle"
                >
                  <RotateCcw className="h-3 w-3" />
                  Retry
                </button>
              </div>
            )}
            <ChatComposer
              draft={draft}
              isSending={chat.isSending}
              textareaRef={textareaRef}
              onDraftChange={setDraft}
              onSelectPrompt={selectPrompt}
              onSend={() => {
                if (chat.send(draft)) setDraft("");
              }}
              onStop={chat.stop}
            />
            <p className="mt-3 text-center text-[10px] leading-5 text-muted">
              Sample inventory · Verify compatibility and final prices with your retailer.
            </p>
          </div>
        </div>
      </div>
      {cart.notice && (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none absolute left-1/2 top-20 z-30 max-w-[85%] -translate-x-1/2 rounded-xl border border-border bg-surface px-4 py-3 text-xs shadow-lg"
        >
          {cart.notice}
        </div>
      )}
      {cartOpen && (
        <CartPanel
          items={cart.items}
          subtotal={cart.subtotal}
          isSending={chat.isSending}
          onClose={() => setCartOpen(false)}
          onQuantity={cart.setQuantity}
          onReview={reviewCart}
        />
      )}
    </main>
  );
}
