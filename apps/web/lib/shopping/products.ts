import type { Product } from "@/types/shopping";

export function productKey(product: Product) {
  return `${product.shop_id}:${product.sku}`;
}
