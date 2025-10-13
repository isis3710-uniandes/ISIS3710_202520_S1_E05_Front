"use client";
import { useState, useMemo } from "react";
import { Task } from "../types";
import { useLocalOrgs } from "../hooks/useLocalOrgs";

const PERIODICITIES = [
  { value: "none", label: "Una vez" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Una vez a la semana" },
  { value: "biweekly", label: "Cada 2 semanas" },
  { value: "monthly", label: "Mensual" },
] as const;

type Periodicity = typeof PERIODICITIES[number]["value"];

const PRIORITIES = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
] as const;

type Priority = typeof PRIORITIES[number]["value"];

type Organization = string;

// paleta de colores alegre
const COLOR_PALETTE = [
  "bg-blue-300",
  "bg-pink-300",
  "bg-green-300",
  "bg-yellow-300",
  "bg-purple-300",
  "bg-orange-300",
  "bg-teal-300",
  "bg-red-300",
];

function getRandomColor() {
  const index = Math.floor(Math.random() * COLOR_PALETTE.length);
  return COLOR_PALETTE[index];
}

type Props = {
  onAddTask?: (task: Task) => void;
  onClosePanel?: () => void;
};

export default function TaskForm({ onAddTask, onClosePanel }: Props) {
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("");
  const [organization, setOrganization] = useState<Organization>("none");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("6:00");
  const [endTime, setEndTime] = useState("8:00");
  const [periodicity, setPeriodicity] = useState<Periodicity>("none");
  const [priority, setPriority] = useState<Priority>("low");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { orgs } = useLocalOrgs();

  const day = useMemo(() => {
    if (!date) return 0;
    const d = new Date(date + "T00:00:00");
    return d.getDay();
  }, [date]);

  const timeIsValid = useMemo(() => startTime < endTime, [startTime, endTime]);

  const canSubmit =
    title.trim().length > 0 && date !== "" && timeIsValid && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);

    const startHour = Number(startTime.split(":")[0]);
    const endHour = Number(endTime.split(":")[0]);

    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      day,
      start: startHour,
      end: endHour,
      project,
      color: getRandomColor(), // color aleatorio al crear
      date,
      startTime,
      endTime,
      periodicity,
      priority,
      organization,
      description,
    };

    onAddTask?.(newTask);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 500);

    setTitle("");
    setProject("");
    setOrganization("none");
    setDate("");
    setStartTime("12:00");
    setEndTime("13:00");
    setPeriodicity("weekly");
    setPriority("low");
    setDescription("");
    onClosePanel?.();
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <input
        type="text"
        placeholder="Nombre Tarea"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text"
          placeholder="Proyecto"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={organization}
          onChange={(e) => setOrganization(e.target.value as Organization)}
          className="border p-2 rounded"
          required
        >
          <option value="none">Ninguno</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
        <label className="text-sm text-gray-600">Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 rounded sm:col-span-2"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
        <label className="text-sm text-gray-600">Horario</label>
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="border p-2 rounded"
          step={60}
          required
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          className="border p-2 rounded"
          step={60}
          required
        />
      </div>
      {!timeIsValid && (
        <p className="text-xs text-red-600">
          La hora de fin debe ser posterior a la de inicio.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <select
          value={periodicity}
          onChange={(e) => setPeriodicity(e.target.value as Periodicity)}
          className="border p-2 rounded"
        >
          {PERIODICITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="border p-2 rounded"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <textarea
        placeholder="Descripción"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="border p-2 rounded min-h-[96px]"
      />

      <button
        type="submit"
        disabled={!canSubmit}
        className={`p-2 rounded text-white transition
          ${submitted ? "bg-green-500" : "bg-blue-500"}
          ${!canSubmit ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-600"}`}
      >
        {submitting ? "Creando..." : "Crear tarea"}
      </button>
    </form>
  );
}
