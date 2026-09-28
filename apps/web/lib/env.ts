import "server-only";
import { z } from "zod";

const backendUrlSchema = z.url({ protocol: /^https?$/ }).refine((value) => {
  const url = new URL(value);
  return !url.username && !url.password && !url.search && !url.hash;
}, "Backend URL must not contain credentials, a query, or a fragment.");

const envSchema = z.object({
  AGENT_BACKEND_URL: backendUrlSchema.default("http://127.0.0.1:8000"),
});

const parsed = envSchema.safeParse({ AGENT_BACKEND_URL: process.env.AGENT_BACKEND_URL });
if (!parsed.success) {
  throw new Error(
    "AGENT_BACKEND_URL must be an absolute HTTP or HTTPS URL without credentials, query, or fragment.",
  );
}

export const env = { agentBackendUrl: parsed.data.AGENT_BACKEND_URL.replace(/\/$/, "") };
