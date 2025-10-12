"use client";
import { useEffect, RefObject } from "react";

/**
 * Cierra popovers al click fuera de cualquiera de los refs.
 * Soporta refs con current === null sin que TS haga drama.
 */
export default function useOnClickOutside(
  refs: Array<RefObject<HTMLElement | null>>,
  handler: () => void
) {
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      // Si el click ocurrió dentro de alguno de los elementos, no cerrar
      if (refs.some(r => r.current && r.current.contains(target))) return;
      handler();
    }
    window.addEventListener("mousedown", onMouseDown);
    return () => window.removeEventListener("mousedown", onMouseDown);
  }, [refs, handler]);
}
