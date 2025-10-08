"use client";
import { useState } from "react";
import { Task } from "../types";
import { mutate } from "swr";

type Props = { onAddTask?: (task: Task) => void };

export default function TaskForm({ onAddTask }: Props) {
  const [title, setTitle] = useState("");
  const [day, setDay] = useState(0);
  const [start, setStart] = useState(8);
  const [end, setEnd] = useState(9);
  const [project, setProject] = useState("");
  const [color, setColor] = useState("bg-blue-300");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      day,
      start,
      end,
      project,
      color,
    };

    // Callback local
    onAddTask?.(newTask);

    // Feedback visual
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 500);

    // Enviar al API
    await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTask),
    });

    // Refrescar SWR
    mutate("/api/tasks");

    // Opcional: callback local
    onAddTask?.(newTask);

    // Reset form
    setTitle("");
    setProject("");
    setStart(8);
    setEnd(9);
  };
  const [submitted, setSubmitted] = useState(false);



  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Título"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-1 rounded"
        required
      />
      <input
        type="number"
        placeholder="Día (0-6)"
        value={day}
        onChange={(e) => setDay(Number(e.target.value))}
        min={0}
        max={6}
        className="border p-1 rounded"
      />
      <input
        type="number"
        placeholder="Hora inicio"
        value={start}
        onChange={(e) => setStart(Number(e.target.value))}
        min={0}
        max={23}
        className="border p-1 rounded"
      />
      <input
        type="number"
        placeholder="Hora fin"
        value={end}
        onChange={(e) => setEnd(Number(e.target.value))}
        min={0}
        max={23}
        className="border p-1 rounded"
      />
      <input
        type="text"
        placeholder="Proyecto"
        value={project}
        onChange={(e) => setProject(e.target.value)}
        className="border p-1 rounded"
      />
      <button
        type="submit"
        className={`p-2 rounded text-white ${submitted ? "bg-green-500" : "bg-blue-500"} hover:bg-blue-600`}
      >
        Agregar
      </button>
    </form>
  );
}
