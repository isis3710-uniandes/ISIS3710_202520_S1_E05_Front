import { NextRequest, NextResponse } from "next/server";
import { Task } from "../../../types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

type Params = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = params;

  const res = await fetch(`${BACKEND_URL}/tasks/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = params;
  const patch = await req.json();

  const res = await fetch(`${BACKEND_URL}/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// Por compatibilidad con Schedule, aceptamos también PUT
export async function PUT(req: NextRequest, ctx: Params) {
  // Internamente lo tratamos como PATCH en el backend
  return PATCH(req, ctx);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = params;

  const res = await fetch(`${BACKEND_URL}/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json(
      { message: "Backend delete error", detail: text },
      { status: res.status },
    );
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
