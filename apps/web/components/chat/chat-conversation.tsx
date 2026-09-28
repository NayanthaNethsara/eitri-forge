"use client";

import type { ChatConversationProps, MessageContentProps } from "@/types/chat";

import { ArrowDown, Check, Copy, CircuitBoard } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { productKey } from "@/lib/shopping/products";
import { ProductCard } from "@/components/shopping/product-card";
import { ChatMarkdown } from "./chat-markdown";

function CopyReply({ content }: MessageContentProps) {
  const [status, setStatus] = useState("Copy reply");
  useEffect(() => {
    if (status === "Copy reply") return;
    const timer = setTimeout(() => setStatus("Copy reply"), 2500);
    return () => clearTimeout(timer);
  }, [status]);
  async function copy() {
    try {
      await navigator.clipboard.writeText(content);
      setStatus("Copied");
    } catch {
      setStatus("Could not copy");
    }
  }
  return (
    <button
      type="button"
      onClick={() => void copy()}
      aria-label={status}
      title={status}
      className="mt-3 inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-muted hover:bg-subtle hover:text-foreground"
    >
      {status === "Copied" ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span aria-live="polite">{status}</span>
    </button>
  );
}

export function ChatConversation({
  messages,
  isSending,
  cart,
  onAdd,
  onAsk,
}: ChatConversationProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const [showLatest, setShowLatest] = useState(false);

  function scrollToLatest() {
    const scroller = scrollRef.current;
    scroller?.scrollTo({ top: scroller.scrollHeight, behavior: "instant" });
    nearBottom.current = true;
    setShowLatest(false);
  }

  useEffect(() => {
    if (nearBottom.current || messages.at(-1)?.role === "user") scrollToLatest();
    else setShowLatest(true);
  }, [messages, isSending]);

  return (
    <div className="relative min-h-0 flex-1">
      <div
        ref={scrollRef}
        onScroll={() => {
          const node = scrollRef.current;
          if (node) {
            nearBottom.current = node.scrollHeight - node.scrollTop - node.clientHeight < 100;
            setShowLatest(!nearBottom.current);
          }
        }}
        role="log"
        aria-label="Conversation with Eitri"
        aria-live="polite"
        aria-relevant="additions"
        className="h-full space-y-8 overflow-y-auto overscroll-contain px-1 pb-8 pt-6 sm:px-4"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.role === "assistant" && (
              <div className="mt-1 hidden h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-subtle text-muted sm:flex">
                <CircuitBoard aria-hidden="true" className="h-4 w-4" />
              </div>
            )}
            <div
              className={
                message.role === "user"
                  ? "max-w-[90%] rounded-2xl rounded-tr-md bg-subtle px-4 py-3 sm:max-w-[80%]"
                  : "min-w-0 flex-1 pt-1"
              }
            >
              {message.role === "assistant" ? (
                <>
                  <p className="mb-3 text-xs font-medium text-muted">Eitri</p>
                  <ChatMarkdown content={message.content} />
                  {Boolean(message.products?.length) && (
                    <section className="mt-5" aria-label="Inventory results">
                      <p className="mb-3 text-xs text-muted">
                        From the sample inventory · {message.products!.length} results
                      </p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {message.products!.map((product) => (
                          <ProductCard
                            key={productKey(product)}
                            product={product}
                            quantity={
                              cart.find((item) => productKey(item.product) === productKey(product))
                                ?.quantity ?? 0
                            }
                            onAdd={onAdd}
                            onAsk={onAsk}
                          />
                        ))}
                      </div>
                    </section>
                  )}
                  <CopyReply content={message.content} />
                </>
              ) : (
                <p className="whitespace-pre-wrap break-words text-sm leading-7">
                  {message.content}
                </p>
              )}
            </div>
          </div>
        ))}
        {isSending && (
          <div role="status" className="flex items-center gap-3 text-sm text-muted">
            <CircuitBoard className="h-4 w-4" aria-hidden="true" />
            <span className="motion-safe:animate-pulse">Working on your request...</span>
          </div>
        )}
      </div>
      {showLatest && (
        <button
          type="button"
          onClick={scrollToLatest}
          className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-xs shadow-lg"
        >
          <ArrowDown className="h-3 w-3" />
          Latest message
        </button>
      )}
    </div>
  );
}
