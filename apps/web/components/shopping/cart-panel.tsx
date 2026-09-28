"use client";

import type { CartPanelProps } from "@/types/shopping";

import { Minus, Plus, ShoppingBag, Trash2, X, ArrowUpRight } from "lucide-react";
import { useEffect, useRef } from "react";
import { formatMoney } from "@/lib/utils";
import { productKey } from "@/lib/shopping/products";
import { ProductImage } from "./product-image";

export function CartPanel({
  items,
  subtotal,
  isSending,
  onClose,
  onQuantity,
  onReview,
}: CartPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="cart-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      className="fixed inset-y-0 left-auto right-0 m-0 h-[100dvh] max-h-none w-full max-w-md border-l border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-background/65 backdrop:backdrop-blur-sm sm:rounded-l-2xl"
    >
      <div className="flex h-full flex-col">
        <header className="flex items-center justify-between px-6 py-6">
          <div>
            <h2 id="cart-title" className="text-lg font-semibold">
              Your cart
            </h2>
            <p className="mt-1 text-xs text-muted">A shortlist for your next build</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="rounded-lg p-2 text-muted hover:bg-subtle"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
            <ShoppingBag className="mb-5 h-10 w-10 stroke-1 text-muted" aria-hidden="true" />
            <h3 className="text-base font-medium">Room for your next build</h3>
            <p className="mt-3 text-sm leading-6 text-muted">
              Ask Eitri to find parts. Add the ones you like from the product cards in your
              conversation.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full bg-foreground px-5 py-3 text-sm text-background"
            >
              Continue chatting
            </button>
          </div>
        ) : (
          <ul className="min-h-0 flex-1 overflow-y-auto px-6">
            {items.map(({ product, quantity }) => (
              <li key={productKey(product)} className="border-b border-border/60 py-5">
                <div className="flex gap-4">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-surface">
                    <ProductImage
                      src={product.image_url}
                      name={product.name}
                      category={product.specs.category}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-5">{product.name}</p>
                    <p className="mt-1 text-xs text-muted">{product.sku}</p>
                    <p className="mt-3 text-sm font-semibold tabular-nums">
                      {formatMoney(product.price_minor * quantity, product.currency)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="inline-flex items-center rounded-lg bg-subtle">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${product.name}`}
                      onClick={() => onQuantity(productKey(product), quantity - 1)}
                      className="p-2.5"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-7 text-center text-xs tabular-nums">{quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${product.name}`}
                      disabled={quantity >= product.stock_quantity}
                      onClick={() => onQuantity(productKey(product), quantity + 1)}
                      className="p-2.5 disabled:opacity-30"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    aria-label={`Remove ${product.name} from cart`}
                    onClick={() => onQuantity(productKey(product), 0)}
                    className="rounded-lg p-2 text-muted hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <footer className="border-t border-border px-6 py-6">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Estimated subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatMoney(subtotal, items[0].product.currency)}
              </span>
            </div>
            <button
              type="button"
              disabled={isSending}
              onClick={onReview}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3 text-sm font-medium text-background disabled:opacity-40"
            >
              Ask Eitri to review these parts
              <ArrowUpRight className="h-4 w-4" />
            </button>
            <p className="mt-3 text-xs leading-5 text-muted">
              Demo cart. Prices and availability are snapshots, not reservations. Taxes and shipping
              are excluded. Checkout is not connected.
            </p>
          </footer>
        )}
      </div>
    </dialog>
  );
}
