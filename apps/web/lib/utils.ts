import { z } from "zod";

const imageUrlSchema = z.union([
  z
    .string()
    .regex(/^\/(?!\/)/)
    .refine((value) => !value.includes("\\")),
  z.url({ protocol: /^https$/ }).refine((value) => {
    const url = new URL(value);
    return !url.username && !url.password;
  }),
]);

export function formatMoney(minorUnits: number, currency: string) {
  const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(minorUnits / 10 ** digits);
}

export function safeImageUrl(value?: string | null): string | undefined {
  const result = imageUrlSchema.safeParse(value);
  return result.success ? result.data : undefined;
}
