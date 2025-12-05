import { NextResponse } from "next/server";
import { Task } from "../../../types";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3000";

export async function GET() {
  const res = await fetch(`${BACKEND_URL}/tasks/recommendations`, {
    cache: "no-store",
  });
  const data: Task[] = await res.json();
  return NextResponse.json(data, { status: res.status });
}
