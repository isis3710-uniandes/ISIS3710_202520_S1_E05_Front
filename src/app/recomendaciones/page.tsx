"use client";
import Recommendations from "../components/Recommendations";

export default function RecomendacionesPage() {
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Recomendaciones</h1>
        <p className="text-sm text-gray-600 mb-6">Lista de tareas y recomendaciones ordenadas por prioridad.</p>

        <Recommendations />
      </div>
    </main>
  );
}
