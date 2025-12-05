import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/organizations`, {
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Error en /api/organizations GET", e);
    return NextResponse.json(
      { message: "Error al obtener organizaciones" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const res = await fetch(`${BACKEND_URL}/organizations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    console.error("Error en /api/organizations POST", e);
    return NextResponse.json(
      { message: "Error al crear organización" },
      { status: 500 },
    );
  }
}
