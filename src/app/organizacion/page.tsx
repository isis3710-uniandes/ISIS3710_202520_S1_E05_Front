// app/organizacion/page.tsx
// Front-only page (no backend) to manage organizations.
// 1) Create new organization with name + emails
// 2) Dropdown listing existing organizations
// 3) Delete organizations
// Dark UI (black bg, white text). Data persisted in localStorage.

"use client";

import React, { useEffect, useMemo, useState } from "react";

/* ----------------------- Types ----------------------- */
import { useLocalOrgs } from "../../app/hooks/useLocalOrgs";

/* ----------------------- Utils ----------------------- */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

/* ----------------------- Page ----------------------- */
export default function OrgsPage() {
  const { orgs, addOrg, deleteOrg } = useLocalOrgs();
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");

  useEffect(() => {
    if (!selectedOrgId && orgs[0]) setSelectedOrgId(orgs[0].id);
  }, [orgs, selectedOrgId]);

  const selectedOrg = useMemo(
    () => orgs.find((o) => o.id === selectedOrgId),
    [orgs, selectedOrgId]
  );

  function handleAddOrg(name: string, emails: string[]) {
    const created = addOrg(name, emails);
    setSelectedOrgId(created.id);
  }

  function handleDeleteOrg(id: string) {
    deleteOrg(id);
    if (selectedOrgId === id) setSelectedOrgId("");
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-semibold">Organizaciones</h1>
        </header>

        {/* Crear organización */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-medium mb-3">Crear nueva organización</h2>
          <CreateOrgForm onCreate={handleAddOrg} />
        </section>

        {/* Selector y listado */}
        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4">
          <h2 className="text-lg font-medium">Mis organizaciones</h2>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-white/80">Seleccionar:</label>
            <select
              className="bg-black text-white border border-white/20 rounded-md px-3 py-2"
              value={selectedOrgId}
              onChange={(e) => setSelectedOrgId(e.target.value)}
            >
              {orgs.length === 0 && <option value="">(sin organizaciones)</option>}
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Listado + eliminar */}
          <ul className="divide-y divide-white/10">
            {orgs.map((o) => (
              <li key={o.id} className="flex items-center justify-between py-3">
                <div className="min-w-0">
                  <div className="font-medium truncate">{o.name}</div>
                  <div className="text-xs text-white/60 truncate">
                    {o.emails.length} miembro(s) {"\u00b7"} {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="text-xs px-3 py-1 rounded-md border border-white/20 hover:bg-white/10 transition"
                    onClick={() => setSelectedOrgId(o.id)}
                  >
                    Ver
                  </button>
                  <button
                    className="text-xs px-3 py-1 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
                    onClick={() => {
                      if (
                        confirm(`¿Eliminar "${o.name}"? Esta acción no se puede deshacer.`)
                      ) {
                        handleDeleteOrg(o.id);
                      }
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {selectedOrg && (
            <div className="mt-4 rounded-xl border border-white/10 p-4">
              <div className="text-sm text-white/70">Organización seleccionada</div>
              <div className="text-xl font-semibold">{selectedOrg.name}</div>
              <div className="mt-2">
                <div className="text-sm text-white/70">
                  Miembros ({selectedOrg.emails.length})
                </div>
                <div className="mt-1 flex flex-wrap gap-2">
                  {selectedOrg.emails.length === 0 && (
                    <span className="text-white/50 text-sm">(sin miembros)</span>
                  )}
                  {selectedOrg.emails.map((e) => (
                    <span
                      key={e}
                      className="text-xs bg-white/10 border border-white/10 rounded-full px-2 py-1"
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <footer className="text-xs text-white/50"></footer>
      </div>
    </main>
  );
}

/* ----------------------- Components ----------------------- */

function CreateOrgForm({
  onCreate,
}: {
  onCreate: (name: string, emails: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [emails, setEmails] = useState<string[]>([]);

  function pushFromInput() {
    const parts = input
      .split(/[ ,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;

    const valid = parts.filter((p) => emailRegex.test(p));
    const invalid = parts.filter((p) => !emailRegex.test(p));
    const next = Array.from(new Set([...emails, ...valid]));
    setEmails(next);
    setInput("");

    if (invalid.length)
      alert(`Emails inválidos ignorados: ${invalid.join(", ")}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return alert("Ponle un nombre a la organización");
    if (input.trim()) pushFromInput();
    onCreate(name.trim(), emails);
    setName("");
    setInput("");
    setEmails([]);
  }

  function removeEmail(x: string) {
    setEmails((prev) => prev.filter((e) => e !== x));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="md:col-span-1 text-sm text-white/80">
          Nombre de la organización
        </label>
        <div className="md:col-span-2">
          <input
            className="w-full bg-black text-white border border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Ej: Acme Corp"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-start">
        <label className="md:col-span-1 text-sm text-white/80">
          Correos de miembros
        </label>
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-2">
            <input
              className="flex-1 bg-black text-white border border-white/20 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/20"
              placeholder="maria@acme.com, juan@acme.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  pushFromInput();
                }
              }}
            />
            <button
              type="button"
              className="px-3 py-2 text-sm border border-white/20 rounded-md hover:bg-white/10"
              onClick={pushFromInput}
            >
              Añadir
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {emails.map((e) => (
              <span
                key={e}
                className="text-xs bg-white/10 border border-white/10 rounded-full px-2 py-1 inline-flex items-center gap-2"
              >
                {e}
                <button
                  type="button"
                  className="text-white/60 hover:text-white/90"
                  onClick={() => removeEmail(e)}
                  aria-label={`Eliminar ${e}`}
                >
                  ×
                </button>
              </span>
            ))}
            {emails.length === 0 && (
              <span className="text-xs text-white/50">
                (Agrega correos y presiona “Añadir” o Enter)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 rounded-md border border-white/30 hover:bg-white/10 transition"
        >
          Crear organización
        </button>
      </div>
    </form>
  );
}
