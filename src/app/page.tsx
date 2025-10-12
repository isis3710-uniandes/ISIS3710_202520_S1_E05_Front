"use client";
// ...existing code...
import Schedule from "./components/Schedule";
import TaskForm from "./components/TaskForm";
// ...existing code...
import { useTaskPanel } from "./context/TaskPanelContext";
import { useLocalTasks } from "./hooks/useLocalTasks";

export default function Home() {
  const { tasks, addTask, removeTask, updateTask, sortTasks } = useLocalTasks();
  const { isTaskPanelOpen, closeTaskPanel } = useTaskPanel();

  return (
    <main className="min-h-screen flex flex-col">
      <section className="flex-1 flex gap-8 p-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Mi Horario</h2>
          <Schedule tasks={tasks} handlers={{ removeTask, updateTask, sortTasks }} />
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

            <TaskForm onAddTask={addTask} onClosePanel={closeTaskPanel} />
          </div>
        )}
      </section>
    </main>
  );
}
