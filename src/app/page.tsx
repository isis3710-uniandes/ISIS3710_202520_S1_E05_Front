"use client";
import { useState } from "react";
import Schedule from "./components/Schedule";
import TaskForm from "./components/TaskForm";
import { Task } from "./types";
import { useTaskPanel } from "./context/TaskPanelContext";

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { isTaskPanelOpen, closeTaskPanel } = useTaskPanel();

  const handleAddTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex gap-8 p-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Mi Horario</h2>
          <Schedule tasks={tasks} />
        </div>

        {/* Panel lateral para crear tarea */}
        {isTaskPanelOpen && (
          <div className="w-80">
            <div className="flex items-center gap-2 mb-2">
              {/* Botón X para cerrar el panel */}
              <button
                type="button"
                onClick={closeTaskPanel}
                className="text-lg font-bold text-gray-500 hover:text-gray-700"
                title="Cerrar panel"
              >
                x
              </button>

              <h2 className="text-xl font-bold">Nueva tarea</h2>
            </div>

            <TaskForm onAddTask={handleAddTask} onClosePanel={closeTaskPanel} />
          </div>
        )}
      </section>
    </main>
  );
}
