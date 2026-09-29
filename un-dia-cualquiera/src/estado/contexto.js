import { createContext, useContext } from "react";

// Contexto en su propio módulo: así el recargado en caliente de juego.jsx no lo recrea.
export const JuegoCtx = createContext(null);

export function useJuego() {
  return useContext(JuegoCtx);
}
