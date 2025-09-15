import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type OverrideStatus = {
  [key: string]: "online" | "maintenance" | "offline";
};

const OVERRIDE_FILE = path.join(process.cwd(), "status-override.json");

const DEFAULT_STATUS: OverrideStatus = {
  "Main oldal": "online",
  "Backup oldal": "online",
};

function readOverrides(): OverrideStatus {
  try {
    if (fs.existsSync(OVERRIDE_FILE)) {
      const data = fs.readFileSync(OVERRIDE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Hiba a JSON olvasásakor:", err);
  }
  return {};
}

function writeOverrides(overrides: OverrideStatus) {
  try {
    fs.writeFileSync(OVERRIDE_FILE, JSON.stringify(overrides, null, 2), "utf-8");
  } catch (err) {
    console.error("Hiba a JSON írásakor:", err);
  }
}

export async function GET() {
  const overrides = readOverrides();
  const combined = { ...DEFAULT_STATUS, ...overrides };
  return NextResponse.json(combined);
}

export async function POST(request: Request) {
  try {
    const newOverrides: OverrideStatus = await request.json();
    writeOverrides(newOverrides);
    return NextResponse.json({ success: true, overrides: newOverrides });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, error: "Hiba a státusz mentésekor." }, { status: 500 });
  }
}
