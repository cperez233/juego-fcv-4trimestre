/**
 * Perfil, punto débil y nivel de riesgo (guion P7, sección 4 y 8.3). Lógica pura.
 */
import { perfiles } from "../data/perfiles.js";
import { eventoPorId } from "../data/eventos.js";

/** Gana el primer perfil cuya regla se cumpla (el orden de perfiles.js es la prioridad). */
export function calcularPerfil(banderas) {
  return perfiles.find((p) => p.regla.todas.every((f) => banderas[f])) || perfiles[perfiles.length - 1];
}

// Eventos donde lo perdido por debajo de −2 se debe a haber pasado por encima de la alerta (guion 4 y 9.4).
const CON_ALERTA_DESCARGA = ["E5", "E9", "E13", "EX"];
// Eventos que no cuentan para el punto débil.
const SIN_CATEGORIA = ["E7", "E7J", "E11"];

/** Puntos perdidos por categoría (máximo del evento − obtenido). */
export function perdidasPorCategoria(evaluacion) {
  const ev = evaluacion.eventos;
  const cat = { correo: 0, navegacion: 0, descargas: 0, alertas: 0, personas: 0 };
  for (const [id, e] of Object.entries(ev)) {
    const def = eventoPorId[id];
    if (!def || SIN_CATEGORIA.includes(id)) continue;
    const perdido = Math.max(0, def.maximo - e.puntos);
    if (!perdido) continue;
    if (id === "E6") {
      // E6: si continuó pese a la alerta, la pérdida es de "alertas"; si no, de "navegación".
      cat[(e.banderas || []).includes("ALERTA") ? "alertas" : "navegacion"] += perdido;
    } else if (CON_ALERTA_DESCARGA.includes(id)) {
      const porAlerta = e.puntos < -2 ? -2 - e.puntos : 0;
      cat.alertas += porAlerta;
      cat[def.categoria] += perdido - porAlerta;
    } else {
      cat[def.categoria] += perdido;
    }
  }
  return cat;
}

/** Categoría con más puntos perdidos; "prisa" si hay bandera PRISA; null si no perdió puntos. */
export function calcularPuntoDebil(evaluacion, banderas) {
  if (banderas.PRISA) return "prisa";
  const cat = perdidasPorCategoria(evaluacion);
  let mejor = null;
  for (const [k, v] of Object.entries(cat)) if (v > 0 && (mejor == null || v > cat[mejor])) mejor = k;
  return mejor;
}

export const NIVELES_RIESGO = [
  { id: "bajo", desde: 0 },
  { id: "medio", desde: 1 },
  { id: "alto", desde: 5 },
  { id: "critico", desde: 10 },
];

/** Riesgo oculto: suma de los puntos negativos de la jornada (guion 8.3). */
export function calcularRiesgo(evaluacion) {
  const valor = Object.values(evaluacion.eventos).reduce((s, e) => s + (e.puntos < 0 ? -e.puntos : 0), 0);
  const nivel = [...NIVELES_RIESGO].reverse().find((n) => valor >= n.desde).id;
  return { valor, nivel };
}
