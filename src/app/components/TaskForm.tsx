"use client";

import { useState, useMemo } from "react";
import { mutate as swrMutate } from "swr";
import { Task } from "../types";
import { useLocalOrgs } from "../hooks/useLocalOrgs";

const PERIODICITIES = [
  { value: "none", label: "Una vez" },
  { value: "daily", label: "Diariamente" },
  { value: "weekly", label: "Una vez a la semana" },
  { value: "biweekly", label: "Cada 2 semanas" },
  { value: "monthly", label: "Mensual" },
] as const;

type Periodicity = (typeof PERIODICITIES)[number]["value"];

const PRIORITIES = [
  { value: "low", label: "Baja" },
  { value: "medium", label: "Media" },
  { value: "high", label: "Alta" },
] as const;

type Priority = (typeof PRIORITIES)[number]["value"];

type Organization = "none" | string;

const COLOR_PALETTE = [
  "bg-blue-300",
  "bg-green-300",
  "bg-yellow-300",
  "bg-purple-300",
  "bg-pink-300",
  "bg-orange-300",
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
  const [startTime, setStartTime] = useState("12:00");
  const [endTime, setEndTime] = useState("13:00");
  const [periodicity, setPeriodicity] = useState<Periodicity>("weekly");
  const [priority, setPriority] = useState<Priority>("low");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { orgs } = useLocalOrgs();

  // día de la semana calculado a partir de la fecha (0 = domingo)
  const day = useMemo(() => {
    if (!date) return 0;
    // forzar formato ISO completo para evitar problemas de zona horaria
    const d = new Date(`${date}T00:00:00`);
    const dow = d.getDay();
    return Number.isNaN(dow) ? 0 : dow;
  }, [date]);

  const canSubmit = useMemo(() => {
    return (
      !!title.trim() &&
      !!date &&
      !!startTime &&
      !!endTime &&
      !submitting
    );
  }, [title, date, startTime, endTime, submitting]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);

    const startHour = Number(startTime.split(":")[0]);
    const endHour = Number(endTime.split(":")[0]);

    const payload = {
      title: title.trim(),
      day,
      start: startHour,
      end: endHour,
      project: project.trim() || undefined,
      color: getRandomColor(),
      date,
      startTime,
      endTime,
      periodicity,
      priority,
      organization: organization === "none" ? undefined : organization,
      description: description.trim() || undefined,
      organizationId: organization === "none" ? "none" : organization,
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        console.error("Error creando tarea", await res.text());
        setSubmitting(false);
        return;
      }

      const createdTask: Task = await res.json();

      // si el padre mantiene estado local
      onAddTask?.(createdTask);

      // refrescar el horario (que usa /api/tasks)
      await swrMutate("/api/tasks");

      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 500);

      // limpiar formulario
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
    } catch (err) {
      console.error("Error en handleSubmit", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-900">
          Título de la tarea <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          placeholder="Ej: Reunión de equipo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 bg-white text-black font-medium text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500"
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-900">
          Proyecto
        </label>
        <input
          type="text"
          placeholder="Ej: Desarrollo Web"
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="border border-gray-300 bg-white text-black font-medium text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-900">
          Fecha <span className="text-red-600">*</span>
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 bg-white text-black font-semibold text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [color-scheme:light]"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-900">
            Hora inicio <span className="text-red-600">*</span>
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="border border-gray-300 bg-white text-black font-semibold text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [color-scheme:light]"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-gray-900">
            Hora fin <span className="text-red-600">*</span>
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="border border-gray-300 bg-white text-black font-semibold text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [color-scheme:light]"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-900">
          Periodicidad
        </label>
        <select
          value={periodicity}
          onChange={(e) => setPeriodicity(e.target.value as Periodicity)}
          className="border border-gray-300 bg-white text-black font-semibold text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {PERIODICITIES.map((p) => (
            <option key={p.value} value={p.value} className="text-black font-semibold">
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-900">
          Prioridad
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority)}
          className="border border-gray-300 bg-white text-black font-semibold text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value} className="text-black font-semibold">
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-900">
          Organización <span className="text-red-600">*</span>
        </label>
        <select
          value={organization}
          onChange={(e) =>
            setOrganization(e.target.value as Organization)
          }
          className="border border-gray-300 bg-white text-black font-semibold text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        >
          <option value="none" className="text-black font-semibold">Ninguno</option>
          {orgs.map((o) => (
            <option key={o.id} value={o.id} className="text-black font-semibold">
              {o.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-gray-900">
          Descripción
        </label>
        <textarea
          placeholder="Agrega detalles adicionales..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 bg-white text-black font-medium text-base px-3 py-2.5 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-500 min-h-[80px] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={`px-4 py-2.5 rounded-md font-semibold text-white transition-all shadow-sm
          ${submitted ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}
          ${
            !canSubmit
              ? "opacity-50 cursor-not-allowed"
              : "hover:shadow-md active:scale-[0.98]"
          }`}
      >
        {submitting ? "Creando..." : submitted ? "✓ Tarea creada" : "Crear tarea"}
      </button>
    </form>
  );
}
