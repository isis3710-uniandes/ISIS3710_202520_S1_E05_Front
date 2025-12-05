import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;

  try {
    const res = await fetch(`${BACKEND_URL}/organizations/${id}`, {
      method: "DELETE",
    });

    // Si el backend responde con error, propagamos el código y texto
    if (!res.ok) {
      const text = await res.text();
      return new NextResponse(text, { status: res.status });
    }

    // Podemos devolver un JSON simple
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (e) {
    console.error("Error en /api/organizations/[id] DELETE", e);
    return NextResponse.json(
      { message: "Error al eliminar organización" },
      { status: 500 },
    );
  }
}
