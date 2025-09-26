import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";

type Q = { text: string; author: string };

export async function GET() {
  // key by date: quote:YYYY-MM-DD
  const key = `quote:${new Date().toISOString().slice(0, 10)}`;

  // 1) Try cache
  const cached = await redis.get<Q>(key);
  if (cached) return NextResponse.json(cached, { status: 200 });

  // 2) Fetch upstream
  try {
    const r = await fetch("https://zenquotes.io/api/today", { cache: "no-store" });
    const data = await r.json();
    const q: Q = Array.isArray(data) && data.length
      ? { text: data[0].q as string, author: data[0].a as string }
      : { text: "Stay consistent. Your future self will thank you.", author: "Unknown" };

    // 3) Store in Redis for 24h
    await redis.set(key, q, { ex: 60 * 60 * 24 });

    return NextResponse.json(q, { status: 200 });
  } catch {
    const fallback: Q = { text: "Stay consistent. Your future self will thank you.", author: "Unknown" };
    return NextResponse.json(fallback, { status: 200 });
  }
}
