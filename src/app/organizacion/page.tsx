"use client";

import { FormEvent, useMemo, useState } from "react";
import { useLocalOrgs, Organization } from "../hooks/useLocalOrgs";

function CreateOrgForm({
  onAdd,
}: {
  onAdd: (name: string, emails: string[]) => void;
}) {
  const [name, setName] = useState("");
  const [emailsInput, setEmailsInput] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const emails = emailsInput
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    onAdd(trimmedName, emails);

    setName("");
    setEmailsInput("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 p-4 rounded-lg bg-white shadow"
    >
      <h2 className="text-sm font-semibold text-gray-700">
        Crear nueva organización
      </h2>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-600">
          Nombre
        </label>
        <input
          className="w-full rounded-md border px-2 py-1 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Universidad, Trabajo, Proyecto..."
        />
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-gray-600">
          Correos (separados por coma)
        </label>
        <input
          className="w-full rounded-md border px-2 py-1 text-sm"
          value={emailsInput}
          onChange={(e) => setEmailsInput(e.target.value)}
          placeholder="correo1@example.com, correo2@example.com"
        />
      </div>

      <button
        type="submit"
        className="w-full rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
      >
        Guardar organización
      </button>
    </form>
  );
}

export default function OrgsPage() {
  const { orgs, addOrg, deleteOrg, isLoading } = useLocalOrgs();
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);

  // Organización seleccionada (siempre que exista alguna)
  const selectedOrg: Organization | undefined = useMemo(() => {
    if (!orgs.length) return undefined;
    if (!selectedOrgId) return orgs[0];
    return orgs.find((o) => o.id === selectedOrgId) ?? orgs[0];
  }, [orgs, selectedOrgId]);

  async function handleAddOrg(name: string, emails: string[]) {
    try {
      const created = await addOrg(name, emails);
      setSelectedOrgId(created.id);
    } catch (err) {
      console.error("Error creando organización", err);
    }
  }

  async function handleDeleteOrg(id: string) {
    try {
      await deleteOrg(id);
      if (selectedOrgId === id) {
        setSelectedOrgId(null);
      }
    } catch (err) {
      console.error("Error eliminando organización", err);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row">
        {/* Lado izquierdo: lista + formulario */}
        <div className="flex-1 space-y-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Gestionar Organizaciones
          </h1>
          <p className="text-sm text-gray-600">
            Crea organizaciones (Universidad, trabajo, proyectos, etc.) y
            asócialas con tus tareas.
          </p>

          <div className="rounded-xl bg-slate-900 p-3 text-white shadow">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Organizaciones</h2>
              {isLoading && (
                <span className="text-xs text-white/60">Cargando...</span>
              )}
            </div>

            {!orgs.length && (
              <p className="text-xs text-white/70">
                Aún no tienes organizaciones. Crea una con el formulario de la
                derecha.
              </p>
            )}

            <div className="mt-2 space-y-2">
              {orgs.map((o) => {
                const selected = selectedOrg && selectedOrg.id === o.id;
                const createdLabel = o.createdAt
                  ? new Date(o.createdAt).toLocaleString()
                  : "Sin fecha";
                return (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrgId(o.id)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      selected ? "bg-blue-600" : "bg-slate-800 hover:bg-slate-700"
                    }`}
                  >
                    <div>
                      <div className="font-medium truncate">{o.name}</div>
                      <div className="text-xs text-white/60 truncate">
                        {o.emails.length} miembro(s) · {createdLabel}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOrg(o.id);
                      }}
                      className="ml-2 rounded-full bg-slate-700 px-2 py-1 text-xs text-white/80 hover:bg-red-500"
                    >
                      Eliminar
                    </button>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Lado derecho: detalle + formulario */}
        <div className="flex w-full flex-1 flex-col gap-4 md:max-w-sm">
          <CreateOrgForm onAdd={handleAddOrg} />

          {selectedOrg && (
            <div className="space-y-3 rounded-lg bg-white p-4 shadow">
              <h2 className="text-sm font-semibold text-gray-800">
                Detalle de organización
              </h2>

              <div>
                <div className="text-base font-medium text-gray-900">
                  {selectedOrg.name}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedOrg.createdAt
                    ? `Creada el ${new Date(
                        selectedOrg.createdAt,
                      ).toLocaleString()}`
                    : "Sin fecha de creación"}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-700">
                  Correos registrados
                </h3>
                {selectedOrg.emails.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No hay correos asociados.
                  </p>
                ) : (
                  <ul className="mt-1 space-y-1 text-xs text-gray-700">
                    {selectedOrg.emails.map((email) => (
                      <li key={email} className="truncate">
                        • {email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
