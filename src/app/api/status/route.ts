import { NextResponse } from "next/server";

// Ide írd a monitorozni kívánt oldalaid URL-jét
const sites = [
  { name: "Main oldal", url: "https://2bdevon.top" },
  { name: "Backup oldal", url: "https://backup.2bdev.bot.nu" },
];

export async function GET() {
  const results = await Promise.all(
    sites.map(async (site) => {
      try {
        const res = await fetch(site.url, { method: "HEAD" });
        return { name: site.name, url: site.url, online: res.ok };
      } catch (err) {
        return { name: site.name, url: site.url, online: false };
      }
    })
  );

  return NextResponse.json(results);
}
