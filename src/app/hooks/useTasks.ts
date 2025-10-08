// src/app/hooks/useTasks.ts
import useSWR from "swr";
import { Task } from "../types";

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function useTasks() {
  const { data, error, isLoading } = useSWR<Task[]>("/api/tasks", fetcher);
  return { tasks: data, error, isLoading };
}
