"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import { useTaskPanel } from "../context/TaskPanelContext";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/recomendaciones", label: "Recomendaciones" },
  { href: "/organizacion", label: "Organización" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { toggleTaskPanel } = useTaskPanel();

  const activeMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const l of links) {
      map[l.href] =
        l.href === "/"
          ? pathname === "/"
          : pathname === l.href || pathname.startsWith(l.href + "/");
    }
    return map;
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="text-lg font-bold tracking-tight">Mi App de Tareas</div>

          <div className="flex items-center gap-2">
            <ul className="flex items-center gap-1">
              {links.map((l) => {
                const isActive = activeMap[l.href];
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "px-3 py-2 rounded-md text-sm font-medium transition",
                        isActive ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                      ].join(" ")}
                    >
                      {l.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Botón especial */}
            <button
              type="button"
              onClick={toggleTaskPanel}
              className="ml-2 px-3 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-sm"
              title="Crear nueva tarea"
            >
              Nueva tarea
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
