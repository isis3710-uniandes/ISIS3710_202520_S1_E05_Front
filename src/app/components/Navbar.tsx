"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTaskPanel } from "../context/TaskPanelContext";
import useOnClickOutside from "../hooks/useOnClickOutside";

/* ====== Iconos SVG ====== */
function IconGlobe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" {...props}>
      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
      <path d="M3 12h18M12 3c3.5 4 3.5 14 0 18M12 3c-3.5 4-3.5 14 0 18" strokeWidth="1.5" />
    </svg>
  );
}

function IconBell(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" {...props}>
      <path
        d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.5 17a2.5 2.5 0 0 0 5 0" strokeWidth="1.5" />
    </svg>
  );
}

function IconUser(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="20" height="20" {...props}>
      <circle cx="12" cy="8" r="4" strokeWidth="1.8" />
      <path d="M4 20a8 8 0 0 1 16 0" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

/* ====== Links de navegación ====== */
const links = [
  { href: "/", label: "Inicio" },
  { href: "/recomendaciones", label: "Administra tu Tiempo" },
  { href: "/organizacion", label: "Gestionar Organizaciones" },
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

  // Estados de popovers
  const [openLang, setOpenLang] = useState(false);
  const [openNotif, setOpenNotif] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);

  // Refs de los menús
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useOnClickOutside([langRef, notifRef, profileRef], () => {
    setOpenLang(false);
    setOpenNotif(false);
    setOpenProfile(false);
  });

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenLang(false);
        setOpenNotif(false);
        setOpenProfile(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Alternar uno y cerrar los demás
  function toggleOne(which: "lang" | "notif" | "profile") {
    setOpenLang(which === "lang" ? !openLang : false);
    setOpenNotif(which === "notif" ? !openNotif : false);
    setOpenProfile(which === "profile" ? !openProfile : false);
  }

  return (
    <nav className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-White/60">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Izquierda: Título */}
          <div className="text-lg font-bold tracking-tight text-blue-500">OrganizApp </div>

          {/* Centro: Links */}
          <ul className="hidden sm:flex items-center gap-1">
            {links.map((l) => {
              const isActive = activeMap[l.href];
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={isActive ? "page" : undefined}
                    className={[
                      "px-3 py-2 rounded-md text-sm font-medium transition",
                      isActive
                        ? "bg-gray-900 text-white"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Derecha: Nueva tarea + iconos */}
          <div className="flex items-center gap-2">
            {/* Nueva tarea */}
            <button
              type="button"
              onClick={toggleTaskPanel}
              className="ml-2 px-3 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-sm"
            >
              Nueva tarea
            </button>

            {/* Iconos */}
            <div className="flex items-center gap-1 ml-2">
              {/* Internacionalización */}
              <div className="relative" ref={langRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={openLang}
                  onClick={() => toggleOne("lang")}
                  className="size-9 grid place-items-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
                  title="Idioma"
                >
                  <IconGlobe />
                </button>

                {openLang && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-40 rounded-lg border border-gray-200 bg-white shadow-lg p-1"
                  >
                    <button className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
                      Español
                    </button>
                    <button className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
                      English
                    </button>
                  </div>
                )}
              </div>

              {/* Notificaciones */}
              <div className="relative" ref={notifRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={openNotif}
                  onClick={() => toggleOne("notif")}
                  className="size-9 grid place-items-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100 relative"
                  title="Notificaciones"
                >
                  <IconBell />
                  <span className="absolute -top-0.5 -right-0.5 block w-2 h-2 bg-red-500 rounded-full" />
                </button>

                {openNotif && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-2"
                  >
                    <div className="text-sm text-gray-600 px-2 pb-2 border-b">
                      Notificaciones
                    </div>
                    <div className="py-2">
                      <div className="text-sm text-gray-700 px-2 py-1 rounded hover:bg-gray-100 cursor-default">
                        No tienes notificaciones.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Perfil */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={openProfile}
                  onClick={() => toggleOne("profile")}
                  className="size-9 grid place-items-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
                  title="Perfil"
                >
                  <IconUser />
                </button>

                {openProfile && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg p-1"
                  >
                    <button className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
                      Ver perfil
                    </button>
                    <button className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 text-gray-700">
                      Ajustes de Notificaciones
                    </button>
                    <button className="w-full text-left text-sm px-3 py-2 rounded hover:bg-gray-100 text-red-600">
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


