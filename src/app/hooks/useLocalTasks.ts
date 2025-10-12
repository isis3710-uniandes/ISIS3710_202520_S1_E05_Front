"use client";
import { useCallback, useEffect, useState } from "react";
import { Task } from "../types";

const STORAGE_KEY = "tasks";

export function useLocalTasks() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Task[]) : [];
    } catch {
      return [];
    }
  });

  // sincronizar hacia localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch {
      // noop
    }
  }, [tasks]);

  const addTask = useCallback((task: Task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }, []);

  const clearTasks = useCallback(() => setTasks([]), []);

  const sortTasks = useCallback((by: "day-start" | "date" | "project" | "priority" = "day-start") => {
    setTasks((prev) => {
      const copy = [...prev];
      if (by === "day-start") {
        copy.sort((a, b) => {
          if (a.day !== b.day) return a.day - b.day;
          const sa = a.start ?? 0;
          const sb = b.start ?? 0;
          if (sa !== sb) return sa - sb;
          return (a.title ?? "").localeCompare(b.title ?? "");
        });
      } else if (by === "date") {
        copy.sort((a, b) => {
          const da = a.date ?? "";
          const db = b.date ?? "";
          if (da && db) return da.localeCompare(db);
          if (da) return -1;
          if (db) return 1;
          return 0;
        });
      } else if (by === "project") {
        copy.sort((a, b) => (a.project ?? "").localeCompare(b.project ?? ""));
      } else if (by === "priority") {
  const order: Record<Task["priority"], number> = { high: 0, medium: 1, low: 2 };
  copy.sort((a, b) => (order[a.priority] ?? 3) - (order[b.priority] ?? 3));
      }
      return copy;
    });
  }, []);

  return { tasks, setTasks, addTask, removeTask, updateTask, clearTasks, sortTasks };
}
