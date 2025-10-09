"use client";
import { useState } from "react";
import Schedule from "./components/Schedule";
import TaskForm from "./components/TaskForm";
import { Task } from "./types";

//..

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleAddTask = (task: Task) => {
    setTasks((prev) => [...prev, task]);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* ...navbar igual... */}
      <section className="flex-1 flex gap-8 p-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-4">Mi Horario</h2>
          <Schedule tasks={tasks} />
        </div>

        <div className="w-80">
          <h2 className="text-xl font-bold mb-4">Nueva tarea</h2>
          <TaskForm onAddTask={handleAddTask} />
        </div>
      </section>
    </main>
  );
}
