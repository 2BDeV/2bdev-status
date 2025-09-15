import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type OverrideStatus = {
  [key: string]: "online" | "maintenance" | "offline";
};

const DEFAULT_STATUS: OverrideStatus = {
  "Main oldal": "online",
  "Backup oldal": "online",
};

// GET endpoint: lekéri a státuszokat
export async function GET() {
  const data = await redis.get("status-overrides");
  const overrides = data ? JSON.parse(data) : {};
  return NextResponse.json({ ...DEFAULT_STATUS, ...overrides });
}

// POST endpoint: frissíti a státuszokat
export async function POST(req: Request) {
  const newOverrides: OverrideStatus = await req.json();
  await redis.set("status-overrides", JSON.stringify(newOverrides));
  return NextResponse.json({ success: true, overrides: newOverrides });
}
