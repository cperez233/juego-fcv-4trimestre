import { useEffect, useState } from "react";

const CONSULTA = "(max-width: 767px)";

/** true por debajo de 768 px (docs/03_UI_ESCRITORIO.md, sección 6). */
export function useEsMovil() {
  const [movil, setMovil] = useState(() => window.matchMedia(CONSULTA).matches);
  useEffect(() => {
    const mq = window.matchMedia(CONSULTA);
    const cambio = () => setMovil(mq.matches);
    mq.addEventListener("change", cambio);
    return () => mq.removeEventListener("change", cambio);
  }, []);
  return movil;
}

/** true si el dispositivo principal tiene cursor que puede "pasar por encima". */
export function usePuedeHover() {
  const [hover] = useState(() => window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  return hover;
}
