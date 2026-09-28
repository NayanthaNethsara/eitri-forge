import { z } from "zod";

export const productCategorySchema = z.enum([
  "cpu",
  "motherboard",
  "ram",
  "gpu",
  "psu",
  "cooler",
  "case",
]);

export const productSchema = z.object({
  shop_id: z.string().min(1).max(100),
  sku: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  price_minor: z.int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  stock_quantity: z.int().nonnegative(),
  specs: z
    .object({ category: productCategorySchema })
    .catchall(z.union([z.string(), z.number(), z.array(z.string())])),
  image_url: z.url({ protocol: /^https?$/ }).nullish(),
});

export const cartItemSchema = z.object({
  product: productSchema,
  quantity: z.int().positive(),
});

export const cartSchema = z
  .array(cartItemSchema)
  .max(100)
  .refine((items) => {
    const keys = new Set(items.map(({ product }) => `${product.shop_id}:${product.sku}`));
    return (
      keys.size === items.length &&
      items.every(
        ({ product }) =>
          product.shop_id === items[0].product.shop_id &&
          product.currency === items[0].product.currency,
      )
    );
  }, "Cart items must be unique and belong to one shop and currency.");
