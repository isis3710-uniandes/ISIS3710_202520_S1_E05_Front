// src/app/components/Schedule.tsx
import { Task } from "../types";
import useSWR from "swr";
import { AnimatePresence, motion } from "framer-motion";

const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

type Props = {
  tasks?: Task[]; // opcional, si no se pasa se carga con SWR
};

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function Schedule({ tasks: propTasks }: Props) {
  // Cargar tareas con SWR solo si no vienen por prop
  const { data: swrTasks } = useSWR<Task[]>("/api/tasks", fetcher, {
    fallbackData: [], // evita undefined
  });

  const tasks = propTasks ?? swrTasks ?? [];

  const hours = Array.from({ length: 11 }, (_, i) => 8 + i); // 8..18

  return (
    <div className="w-full overflow-x-auto">
      {/* Encabezado de días */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)]">
        <div /> {/* espacio para la columna de horas */}
        {days.map((day) => (
          <div key={day} className="text-center font-semibold border-b py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Rejilla */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)]">
        {/* Columna de horas */}
        <div className="flex flex-col">
          {hours.map((hour) => (
            <div key={hour} className="h-16 border-t text-sm text-gray-500">
              {hour}:00
            </div>
          ))}
        </div>

        {/* Columnas de días */}
        {days.map((_, dayIndex) => (
          <div key={dayIndex} className="relative">
            {/* líneas de hora */}
            {hours.map((hour) => (
              <div key={hour} className="h-16 border-t border-l" />
            ))}

            {/* tareas para este día */}
          <AnimatePresence>
            {tasks
              .filter((task) => task.day === dayIndex)
              .map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: -20 }}   // empieza invisible y arriba
                  animate={{ opacity: 1, y: 0 }}     // se anima a visible
                  exit={{ opacity: 0, y: 20 }}       // cuando se elimina, cae y desaparece
                  transition={{ duration: 0.3 }}     // velocidad de la animación
                  className={`absolute p-2 rounded-lg shadow ${task.color} flex flex-col justify-between`}
                  style={{
                    top: `${(task.start - 8) * 64}px`,
                    height: `${(task.end - task.start) * 64}px`,
                    left: "6px",
                    right: "6px",
                  }}
                            >
                  <div>
                    <h3 className="font-semibold text-sm">{task.title}</h3>
                    <p className="text-xs">
                      {task.start}:00 - {task.end}:00
                    </p>
                    <p className="text-xs text-gray-600">{task.project}</p>
                  </div>

                  <div className="flex gap-2 justify-end mt-2">
                    <button className="text-xs p-1 rounded hover:bg-gray-200">✏️</button>
                    <button className="text-xs p-1 rounded hover:bg-gray-200">🗑️</button>
                  </div>
                </motion.div>
              ))}
              </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}



