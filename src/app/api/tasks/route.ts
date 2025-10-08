import { NextRequest, NextResponse } from "next/server";
import { Task } from "../../types";

// Temporal: tareas en memoria (para demo)
const tasks: Task[] = [];

export async function GET() {
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const task: Task = await req.json();
  tasks.push(task);
  return NextResponse.json(task, { status: 201 });
}