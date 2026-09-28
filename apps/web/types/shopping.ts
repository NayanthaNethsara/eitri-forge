import type { z } from "zod";
import type { cartItemSchema, productCategorySchema, productSchema } from "@/lib/shopping/schema";

export type ProductCategory = z.infer<typeof productCategorySchema>;
export type Product = z.infer<typeof productSchema>;
export type CartItem = z.infer<typeof cartItemSchema>;

export type CartPanelProps = {
  items: CartItem[];
  subtotal: number;
  isSending: boolean;
  onClose: () => void;
  onQuantity: (key: string, quantity: number) => void;
  onReview: () => void;
};

export type ProductImageProps = { src?: string | null; name: string; category?: ProductCategory };
export type ProductCardProps = {
  product: Product;
  quantity: number;
  onAdd: (product: Product) => void;
  onAsk: (prompt: string) => void;
};
