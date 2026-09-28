"use client";

import { Plus, Check } from "lucide-react";
import { formatMoney } from "@/lib/utils";
import type { ProductCardProps } from "@/types/shopping";
import { ProductImage } from "./product-image";

export function ProductCard({ product, quantity, onAdd, onAsk }: ProductCardProps) {
  const available = product.stock_quantity > quantity;
  const specs = Object.entries(product.specs)
    .filter(([key]) => key !== "category")
    .slice(0, 3);
  return (
    <article className="min-w-0 overflow-hidden rounded-2xl bg-surface ring-1 ring-border/50">
      <div className="relative flex h-32 items-center justify-center bg-subtle/40">
        <ProductImage
          src={product.image_url}
          name={product.name}
          category={product.specs.category}
        />
        <span className="absolute left-3 top-3 rounded-md bg-surface/90 px-2 py-1 text-[10px] uppercase tracking-wider text-muted">
          {product.specs.category}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium leading-5">{product.name}</h3>
        <p className="mt-1 truncate text-[10px] text-muted">{product.sku}</p>
        <dl className="my-3 space-y-1 text-xs text-muted">
          {specs.map(([key, value]) => (
            <div key={key} className="flex justify-between gap-2">
              <dt className="capitalize">{key.replaceAll("_", " ")}</dt>
              <dd className="text-right text-foreground/80">
                {Array.isArray(value) ? value.join(", ") : value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-base font-semibold tabular-nums">
            {formatMoney(product.price_minor, product.currency)}
          </p>
          <p
            className={`text-[11px] ${product.stock_quantity > 0 ? "text-success" : "text-muted"}`}
          >
            {product.stock_quantity > 0
              ? `${product.stock_quantity} in sample stock`
              : "Out of stock"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onAdd(product)}
          disabled={!available}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-xs font-medium text-background hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {quantity ? (
            <Check className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {quantity
            ? `${quantity} in cart${available ? " · Add another" : ""}`
            : available
              ? "Add to cart"
              : "Unavailable"}
        </button>
        <button
          type="button"
          onClick={() =>
            onAsk(
              `Tell me more about ${product.name} (SKU ${product.sku}) and whether it fits my build.`,
            )
          }
          className="mt-2 w-full rounded-lg py-2 text-xs text-muted hover:bg-subtle hover:text-foreground"
        >
          Ask about this part
        </button>
      </div>
    </article>
  );
}
