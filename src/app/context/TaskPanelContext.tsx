"use client";
import { createContext, useContext, useState, ReactNode, useCallback } from "react";

type Ctx = {
  isTaskPanelOpen: boolean;
  openTaskPanel: () => void;
  closeTaskPanel: () => void;
  toggleTaskPanel: () => void;
};

const TaskPanelContext = createContext<Ctx | null>(null);

export function TaskPanelProvider({ children }: { children: ReactNode }) {
  const [isTaskPanelOpen, setOpen] = useState(false);

  const openTaskPanel = useCallback(() => setOpen(true), []);
  const closeTaskPanel = useCallback(() => setOpen(false), []);
  const toggleTaskPanel = useCallback(() => setOpen(v => !v), []);

  return (
    <TaskPanelContext.Provider value={{ isTaskPanelOpen, openTaskPanel, closeTaskPanel, toggleTaskPanel }}>
      {children}
    </TaskPanelContext.Provider>
  );
}

export function useTaskPanel() {
  const ctx = useContext(TaskPanelContext);
  if (!ctx) throw new Error("useTaskPanel debe usarse dentro de <TaskPanelProvider>");
  return ctx;
}
