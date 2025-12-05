"use client";

import useSWR from "swr";
import { Task } from "../types";
import { mutate as swrMutate } from "swr";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Recommendations() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<Task[]>("/api/tasks/recommendations", fetcher, {
    fallbackData: [],
  });

  const tasks = data ?? [];

  async function handleDelete(id: string) {
  await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  // Refresca recomendaciones
  mutate();
  // Refresca listado general por si en algún lado se usa
  await swrMutate("/api/tasks");
}


  if (error) {
    return (
      <div className="p-4 border rounded bg-red-50 text-red-700 text-sm">
        Error cargando recomendaciones
      </div>
    );
  }

  if (isLoading && tasks.length === 0) {
    return <div className="text-sm text-gray-500">Cargando recomendaciones…</div>;
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2">Tareas recomendadas</h2>
        <p className="text-xs text-gray-500 mb-3">
          Ordenadas por prioridad y cercanía en la fecha (según el backend).
        </p>

        {tasks.length === 0 ? (
          <div className="text-sm text-gray-500">
            No hay tareas registradas todavía.
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between px-3 py-2 rounded border bg-gray-50"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{t.title}</span>
                  <span className="text-xs text-gray-500">
                    {t.project ?? "Sin proyecto"} •{" "}
                    {t.priority?.toUpperCase() ?? "SIN PRIORIDAD"} •{" "}
                    {t.date ?? "Sin fecha"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      t.priority === "high"
                        ? "bg-red-100 text-red-700"
                        : t.priority === "medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {t.priority ?? "low"}
                  </span>
                  <button
                    className="text-xs text-red-600 hover:underline"
                    onClick={() => handleDelete(t.id as string)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
