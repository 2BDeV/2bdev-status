import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

type OverrideStatus = {
  [key: string]: "online" | "maintenance" | "offline";
};

// Default státuszok, ha nincs felülírás
const DEFAULT_STATUS: OverrideStatus = {
  "Main oldal": "online",
  "Backup oldal": "online",
};

// Upstash Redis kliens létrehozása a környezeti változókból
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// GET: lekérdezi az override státuszokat
export async function GET() {
  try {
    const data = await redis.get("status-overrides"); // string | null
    const overrides: OverrideStatus = data ? (JSON.parse(data) as OverrideStatus) : {};

    return NextResponse.json({ ...DEFAULT_STATUS, ...overrides });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ...DEFAULT_STATUS }, { status: 500 });
  }
}

// POST: frissíti az override státuszokat
export async function POST(req: Request) {
  try {
    const body: OverrideStatus = await req.json();

    // Mentés Redis-be
    await redis.set("status-overrides", JSON.stringify(body));

    return NextResponse.json({ message: "Override státuszok frissítve", data: body });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Hiba történt" }, { status: 500 });
  }
}
