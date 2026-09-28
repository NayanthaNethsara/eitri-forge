"use client";

import type { MessageContentProps } from "@/types/chat";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ProductImage } from "@/components/shopping/product-image";

export function ChatMarkdown({ content }: MessageContentProps) {
  return (
    <div className="chat-markdown">
      <Markdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <span className="my-3 inline-flex h-48 w-full max-w-sm overflow-hidden rounded-xl bg-surface">
              <ProductImage
                src={typeof src === "string" ? src : undefined}
                name={alt || "Chat image"}
              />
            </span>
          ),
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-xl border border-border">
              <table>{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
