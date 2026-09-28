import { z } from "zod";
import { CHAT_HISTORY_LIMIT, MESSAGE_LENGTH_LIMIT } from "@/lib/constants";
import { productSchema } from "@/lib/shopping/schema";

export const chatRequestSchema = z
  .object({
    messages: z
      .array(
        z
          .object({
            role: z.enum(["user", "assistant"]),
            content: z.string().trim().min(1).max(MESSAGE_LENGTH_LIMIT),
          })
          .strict(),
      )
      .min(1)
      .max(CHAT_HISTORY_LIMIT),
  })
  .strict()
  .refine(
    ({ messages }) => messages.at(-1)?.role === "user",
    "The last message must be from the user.",
  );

export const chatResponseSchema = z.object({
  reply: z.string().min(1),
  products: z.array(productSchema).default([]),
});

export const chatErrorSchema = z.object({ detail: z.string() });
