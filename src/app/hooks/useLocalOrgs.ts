"use client";

import useSWR from "swr";

export type Organization = {
  id: string;
  name: string;
  description?: string;
  emails: string[];
  createdAt: string; // la BD siempre manda esto
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function useLocalOrgs() {
  const {
    data,
    error,
    isLoading,
    mutate,
  } = useSWR<Organization[]>("/api/organizations", fetcher, {
    fallbackData: [],
  });

  const orgs = data ?? [];

  // 👇 FIRMA COMPATIBLE CON TU page.tsx
  async function addOrg(
    name: string,
    emails: string[],
    description?: string,
  ): Promise<Organization> {
    const payload = { name, emails, description };

    const res = await fetch("/api/organizations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    const created: Organization = await res.json();
    await mutate(); // refresca la lista
    return created;
  }

  async function deleteOrg(id: string): Promise<void> {
    const res = await fetch(`/api/organizations/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    await mutate();
  }

  return {
    orgs,
    error,
    isLoading,
    refresh: mutate,
    addOrg,
    deleteOrg,
  };
}
