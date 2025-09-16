import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

type SiteStatus = "online" | "maintenance" | "offline";

type OverrideStatus = {
  [key: string]: SiteStatus;
};

// Redis kliens
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// GET → visszaadja a Redis-ben lévő státuszokat
export async function GET() {
  try {
    const data = await redis.get("status-overrides");
    const overrides: OverrideStatus = data ? (JSON.parse(data as string) as OverrideStatus) : {};
    return NextResponse.json(overrides);
  } catch (err) {
    console.error(err);
    return NextResponse.json({}, { status: 500 });
  }
}

// POST → frissíti a Redis-ben lévő státuszokat
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<OverrideStatus>;

    const existingData = await redis.get("status-overrides");
    const existing: OverrideStatus = existingData
      ? (JSON.parse(existingData as string) as OverrideStatus)
      : {};

    // Csak a meglévő kulcsokat frissítjük
    const updated: OverrideStatus = { ...existing };
    for (const key of Object.keys(body)) {
      if (existing[key] !== undefined) {
        updated[key] = body[key]!;
      }
    }

    await redis.set("status-overrides", JSON.stringify(updated));

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Nem sikerült menteni" }, { status: 500 });
  }
}
