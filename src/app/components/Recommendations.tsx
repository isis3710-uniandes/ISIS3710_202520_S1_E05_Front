"use client";
import { useMemo, useState } from "react";
import { useLocalTasks } from "../hooks/useLocalTasks";

export default function Recommendations() {
  const { tasks, removeTask, sortTasks } = useLocalTasks();
  const [sortedByPriority, setSortedByPriority] = useState(false);

  const prioritized = useMemo(() => {
    const copy = [...tasks];
    const order: Record<string, number> = { high: 0, medium: 1, low: 2 };
    copy.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
    return copy;
  }, [tasks]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="font-semibold mb-2">Todas las tareas</h2>
        <ul className="space-y-2">
          {tasks.length === 0 && <li className="text-sm text-gray-500">No hay tareas</li>}
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">{t.project} • {t.priority}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-sm text-red-600" onClick={() => removeTask?.(t.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold mb-2">Recomendadas (por prioridad)</h2>
          <button
            className="text-sm px-2 py-1 rounded border"
            onClick={() => {
              if (sortedByPriority) {
                // restaurar (no hacemos nada especial, solo flip)
                setSortedByPriority(false);
              } else {
                // delegar al hook si está disponible
                sortTasks?.("priority");
                setSortedByPriority(true);
              }
            }}
          >
            {sortedByPriority ? "Restaurar" : "Ordenar"}
          </button>
        </div>

        <ul className="space-y-2">
          {prioritized.length === 0 && <li className="text-sm text-gray-500">No hay tareas</li>}
          {(sortedByPriority ? prioritized : tasks).map((t) => (
            <li key={t.id} className="flex items-center justify-between">
              <div>
                <div className="font-medium">{t.title}</div>
                <div className="text-xs text-gray-500">{t.project} • {t.priority}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-sm text-red-600" onClick={() => removeTask?.(t.id)}>Eliminar</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
