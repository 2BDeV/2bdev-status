import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

type SiteStatus = "online" | "maintenance" | "offline";

const sites = [
  { name: "Main oldal", url: "https://2bdevon.top" },
  { name: "Backup oldal", url: "https://backup.2bdev.bot.nu" },
];

export async function GET() {
  try {
    const overrideData = await redis.get("status-overrides");
    const overrides: Record<string, SiteStatus> = overrideData
      ? JSON.parse(overrideData as string)
      : {};

    const results = await Promise.all(
      sites.map(async (site) => {
        let online = true;
        try {
          const res = await fetch(site.url, { method: "HEAD" });
          online = res.ok;
        } catch {
          online = false;
        }

        const status: SiteStatus =
          overrides[site.name] ?? (online ? "online" : "offline");

        return { name: site.name, url: site.url, status };
      })
    );

    return NextResponse.json(results);
  } catch {
    return NextResponse.json(
      sites.map((site) => ({ name: site.name, url: site.url, status: "offline" as SiteStatus }))
    );
  }
}
