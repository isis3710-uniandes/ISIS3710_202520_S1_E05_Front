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
    <main className="min-h-screen flex flex-col relative">
      <section className="flex-1 flex gap-8 p-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Mi Horario</h2>
          <Schedule tasks={tasks} handlers={{ removeTask, updateTask, sortTasks }} />
        </div>

        {/* Panel lateral para crear tarea - Desktop (hidden on mobile) */}
        {isTaskPanelOpen && (
          <div className="hidden lg:block w-80">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
              {/* Botón X para cerrar el panel */}
              <button
                type="button"
                onClick={closeTaskPanel}
                className="text-lg font-bold text-gray-500 hover:text-gray-700"
                title="Cerrar panel"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold text-gray-900">Nueva tarea</h2>
            </div>

            <TaskForm onAddTask={addTask} onClosePanel={closeTaskPanel} />
          </div>
        )}
      </section>

      {/* Modal/Drawer para crear tarea - Mobile & Tablet */}
      {isTaskPanelOpen && (
        <>
          {/* Backdrop oscuro */}
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={closeTaskPanel}
          />

          {/* Panel deslizable desde la derecha */}
          <div className="lg:hidden fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-white z-50 shadow-2xl overflow-y-auto animate-slide-in">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center gap-3">
              {/* Botón X para cerrar el panel */}
              <button
                type="button"
                onClick={closeTaskPanel}
                className="size-8 grid place-items-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                title="Cerrar panel"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24">
                  <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              <h2 className="text-xl font-bold text-gray-900">Nueva tarea</h2>
            </div>

            <div className="p-4">
              <TaskForm onAddTask={addTask} onClosePanel={closeTaskPanel} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}
