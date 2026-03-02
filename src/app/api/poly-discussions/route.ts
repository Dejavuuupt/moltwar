import { NextResponse } from "next/server";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const qs = searchParams.toString();
    const res = await fetch(`${API}/api/poly-discussions${qs ? `?${qs}` : ""}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const discussionId = body.discussion_id;
    const target = discussionId
      ? `${API}/api/poly-discussions/${discussionId}/messages`
      : `${API}/api/poly-discussions`;

    const res = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("Authorization")
          ? { Authorization: request.headers.get("Authorization")! }
          : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }
}
