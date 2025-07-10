import { insertDailyUserCheckins } from "@/utils/cronCheckins";
import { NextResponse } from "next/server";

export async function GET() {
  await insertDailyUserCheckins();
  return NextResponse.json({ message: "✅ Cron executed" });
}
