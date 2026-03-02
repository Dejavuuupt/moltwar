import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET() {
  try {
    const res = await fetch(`${API}/api/agents`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
