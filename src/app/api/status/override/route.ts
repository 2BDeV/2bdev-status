import { NextResponse } from "next/server";

let overrideStatus: { [key: string]: "online" | "maintenance" | "offline" } = {};

export async function GET() {
  return NextResponse.json(overrideStatus);
}

export async function POST(request: Request) {
  const data = await request.json();
  overrideStatus = { ...overrideStatus, ...data };
  return NextResponse.json({ ok: true, overrideStatus });
}
