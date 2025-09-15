import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

// Redis kliens konfiguráció (Upstash környezeti változókból)
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export type OverrideStatus = {
  [key: string]: "online" | "maintenance" | "offline";
};

// Alapértelmezett státuszok (itt az összes oldal)
const DEFAULT_STATUS: OverrideStatus = {
  "Main oldal": "online",
  "Backup oldal": "online",
};

// GET: lekéri az override státuszokat
export async function GET() {
  try {
    const data = await redis.get("status-overrides"); // string | null
    const overrides: OverrideStatus = data ? (JSON.parse(data) as OverrideStatus) : {} as OverrideStatus;

    return NextResponse.json({ ...DEFAULT_STATUS, ...overrides });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ...DEFAULT_STATUS }, { status: 500 });
  }
}

// POST: frissíti az override státuszokat
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as OverrideStatus;

    // Mentés Redisbe
    await redis.set("status-overrides", JSON.stringify(body));

    return NextResponse.json({ ...DEFAULT_STATUS, ...body });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Hiba történt" }, { status: 500 });
  }
}
