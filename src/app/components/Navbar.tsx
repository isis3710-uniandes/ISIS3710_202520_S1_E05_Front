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

function IconMenu(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" {...props}>
      <path d="M3 12h18M3 6h18M3 18h18" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconClose(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" width="24" height="24" {...props}>
      <path d="M18 6L6 18M6 6l12 12" strokeWidth="2" strokeLinecap="round" />
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Refs de los menús
  const langRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useOnClickOutside([langRef, notifRef, profileRef, mobileMenuRef], () => {
    setOpenLang(false);
    setOpenNotif(false);
    setOpenProfile(false);
    setMobileMenuOpen(false);
  });

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenLang(false);
        setOpenNotif(false);
        setOpenProfile(false);
        setMobileMenuOpen(false);
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
          <div className="text-lg font-bold tracking-tight text-blue-500">OrganizApp</div>

          {/* Centro: Links (Desktop) */}
          <ul className="hidden md:flex items-center gap-1">
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
            {/* Nueva tarea (Desktop) */}
            <button
              type="button"
              onClick={toggleTaskPanel}
              className="hidden sm:block ml-2 px-3 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-sm"
            >
              Nueva tarea
            </button>

            {/* Iconos (Desktop) */}
            <div className="hidden sm:flex items-center gap-1 ml-2">
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

            {/* Hamburger Menu Button (Mobile) */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden size-9 grid place-items-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
              aria-label="Menú"
            >
              {mobileMenuOpen ? <IconClose /> : <IconMenu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div
            ref={mobileMenuRef}
            className="sm:hidden border-t border-gray-200 py-3 space-y-2"
          >
            {/* Mobile Navigation Links */}
            {links.map((l) => {
              const isActive = activeMap[l.href];
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={[
                    "block px-3 py-2 rounded-md text-sm font-medium transition",
                    isActive
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              );
            })}

            {/* Mobile New Task Button */}
            <button
              type="button"
              onClick={() => {
                toggleTaskPanel();
                setMobileMenuOpen(false);
              }}
              className="w-full px-3 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] shadow-sm"
            >
              Nueva tarea
            </button>

            {/* Mobile Icon Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              {/* Language */}
              <button
                type="button"
                onClick={() => toggleOne("lang")}
                className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                <IconGlobe />
                <span>Idioma</span>
              </button>

              {/* Notifications */}
              <button
                type="button"
                onClick={() => toggleOne("notif")}
                className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-100 flex items-center justify-center gap-2 relative"
              >
                <IconBell />
                <span>Notif.</span>
                <span className="absolute top-1 right-1 block w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Profile */}
              <button
                type="button"
                onClick={() => toggleOne("profile")}
                className="flex-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-100 flex items-center justify-center gap-2"
              >
                <IconUser />
                <span>Perfil</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


