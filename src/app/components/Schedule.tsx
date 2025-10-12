import { useEffect, useMemo, useState } from "react";
import { Task } from "../types";
import useSWR, { mutate as swrMutate } from "swr";
import { AnimatePresence, motion } from "framer-motion";

type TaskHandlers = {
  removeTask?: (id: string) => void;
  updateTask?: (id: string, patch: Partial<Task>) => void;
  sortTasks?: (by: "day-start" | "date" | "project" | "priority") => void;
};

type Props = { tasks?: Task[]; handlers?: TaskHandlers };

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Task del calendario con campos opcionales que necesitamos
type CalendarTask = Task & Partial<{
  startTime: string;
  endTime: string;
  date: string; // "YYYY-MM-DD"
  periodicity: "none" | "daily" | "weekly" | "biweekly" | "monthly";
}>;

// Config de la grilla
const START_HOUR = 0;
const END_HOUR = 24;
const HOUR_HEIGHT = 56;
const PX_PER_MIN = HOUR_HEIGHT / 60;

/* ========== Utilidades de fechas ========== */
function startOfWeekMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay(); // 0..6 (0 domingo)
  const diff = (day === 0 ? -6 : 1 - day);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseISODate(iso?: string): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}
function weekIndex(from: Date, to: Date): number {
  // semanas completas entre inicios de semana
  const a = startOfWeekMonday(from).getTime();
  const b = startOfWeekMonday(to).getTime();
  return Math.round((b - a) / (7 * 24 * 60 * 60 * 1000));
}
function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);
  const meses = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const sD = start.getDate();
  const sM = meses[start.getMonth()];
  const sY = start.getFullYear();
  const eD = end.getDate();
  const eM = meses[end.getMonth()];
  const eY = end.getFullYear();
  if (sY === eY && sM === eM) return `${sD}–${eD} ${eM} ${eY}`;
  if (sY === eY) return `${sD} ${sM} – ${eD} ${eM} ${eY}`;
  return `${sD} ${sM} ${sY} – ${eD} ${eM} ${eY}`;
}

/* ========== Tiempo y layout vertical ========== */
function hhmmToMinutes(hhmm: string | undefined): number | null {
  if (!hhmm) return null;
  const [hStr, mStr] = hhmm.split(":");
  const h = Number(hStr);
  const m = Number(mStr);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}
function toStartMinutes(task: CalendarTask): number {
  const m = hhmmToMinutes(task.startTime);
  if (m !== null) return m;
  return (task.start ?? 0) * 60;
}
function toEndMinutes(task: CalendarTask): number {
  const m = hhmmToMinutes(task.endTime);
  if (m !== null) return m;
  return (task.end ?? 0) * 60;
}

/* ========== Expansión por periodicidad ========== */
/**
 * Devuelve las ocurrencias de una tarea en la semana [weekStart .. weekStart+6]
 * Cada ocurrencia conserva el mismo id (para editar/eliminar el original),
 * pero usamos key compuesta id+date al renderizar para no duplicar keys.
 */
function occurrencesInWeek(task: CalendarTask, weekStart: Date): CalendarTask[] {
  const results: CalendarTask[] = [];
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekISO = weekDates.map(toISODate);

  const baseDate = parseISODate(task.date);
  const periodicity = task.periodicity ?? "none";

  // Helper para clonar con date y day correctos
  const cloneFor = (d: Date): CalendarTask => ({
    ...task,
    date: toISODate(d),
    day: d.getDay() === 0 ? 6 : d.getDay() - 1, // 0..6 con lunes=0
  });

  switch (periodicity) {
    case "none": {
      if (task.date && weekISO.includes(task.date)) {
        results.push(cloneFor(parseISODate(task.date)!));
      } else if (!task.date) {
        // Legacy sin date: cae por columna day
        const d = weekDates[task.day ?? 0];
        results.push(cloneFor(d));
      }
      break;
    }
    case "daily": {
      // Si hay baseDate, repite cada día desde baseDate en adelante
      if (baseDate) {
        weekDates.forEach(d => {
          if (d >= baseDate) results.push(cloneFor(d));
        });
      } else {
        // Sin baseDate, asumimos todos los días de la semana
        weekDates.forEach(d => results.push(cloneFor(d)));
      }
      break;
    }
    case "weekly": {
      if (baseDate) {
        // mismo día de la semana, cada semana desde la base
        const startWeek = startOfWeekMonday(baseDate);
        const k = weekIndex(startWeek, weekStart);
        if (k >= 0) {
          // día de la semana de baseDate (lunes=0)
          const dow = (baseDate.getDay() === 0 ? 6 : baseDate.getDay() - 1);
          results.push(cloneFor(weekDates[dow]));
        }
      } else {
        // legacy: usa task.day como ancla
        const idx = Math.max(0, Math.min(6, task.day ?? 0));
        results.push(cloneFor(weekDates[idx]));
      }
      break;
    }
    case "biweekly": {
      if (baseDate) {
        const startWeek = startOfWeekMonday(baseDate);
        const k = weekIndex(startWeek, weekStart);
        if (k >= 0 && k % 2 === 0) {
          const dow = (baseDate.getDay() === 0 ? 6 : baseDate.getDay() - 1);
          results.push(cloneFor(weekDates[dow]));
        }
      } else {
        // sin base: muéstrala esta semana y asume alternancia desde esta
        const idx = Math.max(0, Math.min(6, task.day ?? 0));
        results.push(cloneFor(weekDates[idx]));
      }
      break;
    }
    case "monthly": {
      if (baseDate) {
        const dayOfMonth = baseDate.getDate();
        // incluir cualquier día de la semana visible cuyo día del mes coincida
        weekDates.forEach(d => {
          if (d.getDate() === dayOfMonth && d >= baseDate) {
            results.push(cloneFor(d));
          }
        });
      } else {
        // sin base no hay ancla mensual útil; lo ignoramos en esta vista
      }
      break;
    }
  }

  return results;
}

async function apiDeleteTask(id: string) {
  let res = await fetch(`/api/tasks`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (res.ok) return res;

  res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (res.ok) return res;

  res = await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
  if (res.ok) return res;

  res = await fetch(`/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, _method: "DELETE" }),
  });
  return res;
}

async function apiPatchTask(id: string, payload: Partial<CalendarTask>) {
  let res = await fetch(`/api/tasks`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...payload }),
  });
  if (res.ok) return res;

  res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) return res;

  res = await fetch(`/api/tasks/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (res.ok) return res;

  res = await fetch(`/api/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...payload, _method: "PATCH" }),
  });
  return res;
}

/* ========== Modal de edición (igual que antes) ========== */
function EditModal({
  task,
  onClose,
  onSave,
  saving,
  error,
}: {
  task: CalendarTask;
  onClose: () => void;
  onSave: (updated: Partial<CalendarTask>) => void;
  saving: boolean;
  error: string | null;
}) {
  const [title, setTitle] = useState(task.title);
  const [project, setProject] = useState(task.project ?? "");
  const [color, setColor] = useState(task.color ?? "bg-blue-300");
  const [startTime, setStartTime] = useState(
    task.startTime ?? `${String(task.start).padStart(2, "0")}:00`
  );
  const [endTime, setEndTime] = useState(
    task.endTime ?? `${String(task.end).padStart(2, "0")}:00`
  );

  const valid = startTime < endTime && title.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[min(480px,92vw)] p-4 space-y-3">
        <h2 className="font-semibold text-lg">Editar tarea</h2>

        <div className="grid grid-cols-1 gap-2">
          <input
            className="border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="border p-2 rounded"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Proyecto"
            />
            <input
              className="border p-2 rounded"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Clase Tailwind (bg-blue-300)"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16">Inicio</label>
              <input
                type="time"
                className="border p-2 rounded w-full"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                step={60}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 w-16">Fin</label>
              <input
                type="time"
                className="border p-2 rounded w-full"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                step={60}
              />
            </div>
          </div>

          {!valid && (
            <p className="text-xs text-red-600">
              Revisa el título y que la hora de fin sea posterior a la de inicio.
            </p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="px-3 py-2 rounded border">
            Cancelar
          </button>
          <button
            type="button"
            disabled={!valid || saving}
            onClick={() => onSave({ title, project, color, startTime, endTime })}
            className={`px-3 py-2 rounded text-white ${
              !valid || saving
                ? "bg-blue-400 opacity-60 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========== Componente principal ========== */
export default function Schedule({ tasks: propTasks, handlers }: Props) {
  const { data: swrTasks } = useSWR<CalendarTask[]>("/api/tasks", fetcher, {
    fallbackData: [],
  });

  const isExternal = Array.isArray(propTasks);
  const source = useMemo(() => (isExternal ? propTasks : swrTasks) ?? [], [isExternal, propTasks, swrTasks]);

  // Semana activa
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeekMonday(new Date()));

  // Espejo local de tareas para UI reactiva
  const [list, setList] = useState<CalendarTask[]>(source);
  useEffect(() => {
    setList(source);
  }, [source]);


  // Navegación semanal
  function goPrevWeek() { setWeekStart((s) => addDays(s, -7)); }
  function goNextWeek() { setWeekStart((s) => addDays(s, +7)); }
  function goToday()    { setWeekStart(startOfWeekMonday(new Date())); }

  // Estado de edición
  const [editing, setEditing] = useState<CalendarTask | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function closeEdit() {
    setEditing(null);
    setSaving(false);
    setError(null);
  }

  // Eliminar
  async function handleDelete(id: string) {
    setError(null);
    const prev = list;
    const next = prev.filter((t) => t.id !== id);
    setList(next);

    // If parent provided handlers (local), use them
    if (handlers?.removeTask) {
      try {
        handlers.removeTask(id);
        return;
      } catch (e) {
        setList(prev);
        setError(e instanceof Error ? e.message : "Error al eliminar localmente.");
        return;
      }
    }

    if (!isExternal) swrMutate("/api/tasks", next, false);

    try {
      const res = await apiDeleteTask(id);
      if (!res.ok) throw new Error("No se pudo eliminar la tarea.");
      if (!isExternal) await swrMutate("/api/tasks");
    } catch (e) {
      setList(prev);
      if (!isExternal) swrMutate("/api/tasks", prev, false);
      setError(e instanceof Error ? e.message : "Error desconocido al eliminar.");
    }
  }

  // Guardar edición
  async function handleSave(updatedPartial: Partial<CalendarTask>) {
    if (!editing) return;

    setSaving(true);
    setError(null);

    const id = editing.id;

    const next = list.map((t) => (t.id === id ? { ...t, ...updatedPartial } : t));

    // Compat: recalcula start/end si cambian HH:mm
    const edited = next.find((t) => t.id === id)!;
    const sMin = hhmmToMinutes(edited.startTime);
    const eMin = hhmmToMinutes(edited.endTime);
    if (sMin !== null) edited.start = Math.floor(sMin / 60);
    if (eMin !== null) edited.end = Math.ceil(eMin / 60);

    setList(next);
    if (!isExternal) swrMutate("/api/tasks", next, false);
    // If handlers provided, use local update
    if (handlers?.updateTask) {
      try {
        handlers.updateTask(id, edited as Partial<Task>);
        closeEdit();
        return;
      } catch (e) {
        const prev = source;
        setList(prev);
        setSaving(false);
        setError(e instanceof Error ? e.message : "Error al guardar localmente.");
        return;
      }
    }

    try {
      const res = await apiPatchTask(id, edited);
      if (!res.ok) throw new Error("No se pudo guardar la edición.");
      if (!isExternal) await swrMutate("/api/tasks");
      closeEdit();
    } catch (e) {
      const prev = source;
      setList(prev);
      if (!isExternal) swrMutate("/api/tasks", prev, false);
      setSaving(false);
      setError(e instanceof Error ? e.message : "Error desconocido al guardar.");
    }
  }

  // Fechas de columnas
  const columnDates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [weekStart]);

  // Expansión por periodicidad para la semana visible
  const expanded = useMemo(() => {
    const all: CalendarTask[] = [];
    for (const t of list) {
      const occ = occurrencesInWeek(t, weekStart);
      all.push(...occ);
    }
    return all;
  }, [list, weekStart]);

  return (
    <div className="w-full overflow-x-auto">
      {/* Navegación */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div className="flex items-center gap-2">
          <button type="button" onClick={goPrevWeek} className="px-2 py-1 rounded border hover:bg-black/5" aria-label="Semana anterior" title="Semana anterior">←</button>
          <button type="button" onClick={goToday}    className="px-2 py-1 rounded border hover:bg-black/5" aria-label="Ir a hoy"         title="Ir a hoy">Hoy</button>
          <button type="button" onClick={goNextWeek} className="px-2 py-1 rounded border hover:bg-black/5" aria-label="Semana siguiente" title="Semana siguiente">→</button>
        </div>
        <div className="text-sm text-gray-700 font-medium">
          {formatWeekRange(weekStart)}
        </div>
      </div>

      {/* Encabezado con días y fechas */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)]">
        <div />
        {columnDates.map((d, idx) => (
          <div key={idx} className="text-center font-semibold border-b py-2">
            <div>{days[idx]}</div>
            <div className="text-xs text-gray-600">
              {String(d.getDate()).padStart(2, "0")}/{String(d.getMonth() + 1).padStart(2, "0")}
            </div>
          </div>
        ))}
      </div>

      {/* Rejilla */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)]">
        {/* Horas */}
        <div className="flex flex-col">
          {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map((hour) => (
            <div key={hour} className="border-t text-sm text-gray-500 flex items-start" style={{ height: `${HOUR_HEIGHT}px` }}>
              <span className="pt-1">{String(hour).padStart(2, "0")}:00</span>
            </div>
          ))}
          <div className="border-t" />
        </div>

        {/* Columnas por día */}
  {columnDates.map((colDate) => {
          const iso = toISODate(colDate);
          return (
            <div key={iso} className="relative">
              {Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i).map((hour) => (
                <div key={hour} className="border-t border-l" style={{ height: `${HOUR_HEIGHT}px` }} />
              ))}
              <div className="border-t border-l" />

              <AnimatePresence>
                {expanded
                  .filter((task) => task.date === iso) // ya vienen con date expandido
                  .map((task) => {
                    const startMin = Math.max(0, toStartMinutes(task));
                    let endMin = toEndMinutes(task);
                    if (endMin <= startMin) endMin = startMin + 30;
                    const endClamped = Math.min(END_HOUR * 60, endMin);

                    const top = startMin * PX_PER_MIN;
                    const startLabel = task.startTime ?? `${String(task.start).padStart(2, "0")}:00`;
                    const endLabel   = task.endTime   ?? `${String(task.end).padStart(2, "0")}:00`;

                    return (
                      <motion.div
  key={`${task.id}-${task.date}`}
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: 20 }}
  transition={{ duration: 0.3 }}
  className={`absolute z-10 p-2 rounded-lg shadow ${task.color}`}
  style={{
    top,
    // altura mínima para que quepan los botones
    height: Math.max(40, (endClamped - startMin) * PX_PER_MIN),
    left: 6,
    right: 6
  }}
>
  {/* Wrapper relativo para anclar los botones dentro de la tarjeta */}
  <div className="relative pr-10">
    {/* Botones en esquina superior derecha, dentro del marco */}
    <div className="absolute top-1 right-1 flex gap-1">
      <button
        type="button"
        className="grid place-items-center w-6 h-6 rounded bg-white/80 hover:bg-white text-[11px] leading-none"
        onClick={() => setEditing(task)}
        aria-label="Editar"
        title="Editar"
      >
        ✏️
      </button>
      <button
        type="button"
        className="grid place-items-center w-6 h-6 rounded bg-white/80 hover:bg-white text-[11px] leading-none"
        onClick={() => handleDelete(task.id)}
        aria-label="Eliminar"
        title="Eliminar"
      >
        🗑️
      </button>
    </div>

    {/* Contenido de la tarjeta */}
    <h3 className="font-semibold text-sm">{task.title}</h3>
    <p className="text-xs">
      {startLabel} - {endLabel}
    </p>
    {task.project ? (
      <p className="text-xs text-gray-700/80">{task.project}</p>
    ) : null}
  </div>
</motion.div>



                    );
                  })}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {error && <div className="mt-2 text-xs text-red-600 px-2">{error}</div>}

      {editing && (
        <EditModal
          task={editing}
          onClose={closeEdit}
          onSave={handleSave}
          saving={saving}
          error={error}
        />
      )}
    </div>
  );
}
