import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

type SiteStatus = "online" | "maintenance" | "offline";

type OverrideStatus = {
  [key: string]: SiteStatus;
};

const DEFAULT_STATUS: OverrideStatus = {
  main: "online",
  backup: "online",
};

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function GET() {
  try {
    const data = await redis.get("status-overrides"); // string | null

    if (!data) {

      return NextResponse.json(DEFAULT_STATUS);
    }

    const overrides: OverrideStatus = JSON.parse(data as string);
    return NextResponse.json(overrides);
  } catch (err) {
    console.error(err);
    return NextResponse.json(DEFAULT_STATUS, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<OverrideStatus>;

    const existingData = await redis.get("status-overrides");
    const existing: OverrideStatus = existingData
      ? (JSON.parse(existingData as string) as OverrideStatus)
      : DEFAULT_STATUS;

    const updated: OverrideStatus = { ...existing, ...body };

    await redis.set("status-overrides", JSON.stringify(updated));

    return NextResponse.json(updated);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Nem sikerült menteni" }, { status: 500 });
  }
}
