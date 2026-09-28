import { NextResponse } from "next/server";

import { chatRequestSchema, chatResponseSchema, chatErrorSchema } from "@/lib/chat/schema";
import { env } from "@/lib/env";
import { ASSISTANT_UNAVAILABLE, CHAT_TIMEOUT_MS } from "@/lib/constants";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ detail: "Invalid request body." }, { status: 400 });
  }

  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { detail: "Provide 1–20 messages of up to 4,000 characters, ending with a user message." },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(`${env.agentBackendUrl}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
    });
    const result = await response.json();
    if (!response.ok) {
      const error = chatErrorSchema.safeParse(result);
      return NextResponse.json(
        { detail: error.success ? error.data.detail : ASSISTANT_UNAVAILABLE },
        { status: response.status },
      );
    }
    const output = chatResponseSchema.safeParse(result);
    if (!output.success) {
      return NextResponse.json(
        { detail: "The assistant returned an invalid response." },
        { status: 502 },
      );
    }
    return NextResponse.json(output.data);
  } catch {
    return NextResponse.json({ detail: ASSISTANT_UNAVAILABLE }, { status: 503 });
  }
}
