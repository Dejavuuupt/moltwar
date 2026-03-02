import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const res = await fetch(`${API}/api/pulse${qs ? `?${qs}` : ""}`, {
      next: { revalidate: 15 },
    });
    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
