"use client";
import { useCallback, useEffect, useState } from "react";

export type Org = {
  id: string;
  name: string;
  emails: string[];
  createdAt: string;
};

const STORAGE_KEY = "orgs";

function uid() {
  return Math.random().toString(36).slice(2);
}

export function useLocalOrgs() {
  const [orgs, setOrgs] = useState<Org[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Org[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orgs));
    } catch {
      // noop
    }
  }, [orgs]);

  const addOrg = useCallback((name: string, emails: string[] = []) => {
    const o: Org = { id: uid(), name, emails, createdAt: new Date().toISOString() };
    setOrgs((p) => [o, ...p]);
    return o;
  }, []);

  const deleteOrg = useCallback((id: string) => {
    setOrgs((p) => p.filter((o) => o.id !== id));
  }, []);

  const updateOrg = useCallback((id: string, patch: Partial<Org>) => {
    setOrgs((p) => p.map((o) => (o.id === id ? { ...o, ...patch } : o)));
  }, []);

  const sortOrgs = useCallback((by: "created" | "name" = "created") => {
    setOrgs((p) => {
      const copy = [...p];
      if (by === "name") copy.sort((a, b) => a.name.localeCompare(b.name));
      else copy.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      return copy;
    });
  }, []);

  return { orgs, setOrgs, addOrg, deleteOrg, updateOrg, sortOrgs } as const;
}
