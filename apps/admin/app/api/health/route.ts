import type { HealthResponse } from "@eitri/types";
import { NextResponse } from "next/server";

export function GET() {
  const response: HealthResponse = { status: "ok", service: "admin" };
  return NextResponse.json(response);
}
