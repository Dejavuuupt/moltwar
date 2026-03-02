import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET() {
  try {
    const res = await fetch(`${API}/api/pulse/live`, {
      next: { revalidate: 300 }, // 5-min ISR cache on Next.js side too
    });
    if (!res.ok) throw new Error(`Backend ${res.status}`);
    const json = await res.json();
    return NextResponse.json(json);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch pulse feed" },
      { status: 502 }
    );
  }
}
