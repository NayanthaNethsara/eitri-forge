"use client";

import { useEffect, useState } from "react";
import { cartSchema } from "@/lib/shopping/schema";
import { CART_STORAGE_KEY } from "@/lib/constants";
import { productKey } from "@/lib/shopping/products";
import type { CartItem, Product } from "@/types/shopping";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = cartSchema.safeParse(
        JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? "[]"),
      );
      if (stored.success) {
        setItems(
          stored.data
            .map((item) => ({
              ...item,
              quantity: Math.min(item.quantity, item.product.stock_quantity),
            }))
            .filter((item) => item.quantity > 0),
        );
      } else {
        setNotice("Saved cart data was invalid. Start a new cart to continue.");
      }
    } catch {
      setNotice("Cart storage is unavailable. You can still shop in this session.");
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      setNotice("Your cart could not be saved on this device.");
    }
  }, [items, ready]);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  function add(product: Product) {
    if (!ready) return;
    if (
      items.length &&
      (items[0].product.shop_id !== product.shop_id ||
        items[0].product.currency !== product.currency)
    ) {
      setNotice("Start an empty cart before adding items from another store or currency.");
      return;
    }
    const existing = items.find((item) => productKey(item.product) === productKey(product));
    if ((existing?.quantity ?? 0) >= product.stock_quantity) {
      setNotice("The cart has reached this part's available quantity.");
      return;
    }
    setItems((current) => {
      const index = current.findIndex((item) => productKey(item.product) === productKey(product));
      return index < 0
        ? [...current, { product, quantity: 1 }]
        : current.map((item, i) =>
            i === index
              ? { product, quantity: Math.min(item.quantity + 1, product.stock_quantity) }
              : item,
          );
    });
    setNotice(`${product.name} added to cart.`);
  }

  function setQuantity(key: string, quantity: number) {
    setItems((current) =>
      current
        .map((item) =>
          productKey(item.product) === key
            ? { ...item, quantity: Math.min(Math.max(0, quantity), item.product.stock_quantity) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.product.price_minor, 0);
  return { items, count, subtotal, notice, add, setQuantity };
}
