// src/app/types.ts
export interface Task {
  id: string;
  title: string;
  day: number;   // 0 = lunes, 1 = martes, etc.
  start: number; // hora inicio (ej: 8)
  end: number;   // hora fin (ej: 10)
  project: string;
  color: string; // clase de Tailwind, ej: "bg-blue-200"
}
