/**
 * Repaso de la carta final (guion 11.3): cada punto que se escapó, con lo que hiciste y lo mejor. Lógica pura.
 * La suma de "perdidos" es exactamente puntajeMaximo − puntaje crudo.
 */
import { eventoPorId, pendientes as PENDIENTES, rebobinado as RB, repaso as TXT } from "../data/eventos.js";

// Máximo de cada parte de los eventos dobles (guion 9 y 10).
const MAX_PARTE = { "3A": 2, "3B": 1, "14A": 1, "14B": 2 };

function hicisteDe(id, res) {
  const tarjetas = RB[id === "3A" || id === "3B" ? "E3" : id === "14A" || id === "14B" ? "E14" : id]?.tarjetas || {};
  const clave = id === "E7" && res.version === "B" ? `B_${res.accion}` : res.accion;
  return tarjetas[clave]?.hiciste || TXT.hiciste[`${id}_${res.accion}`] || TXT.hiciste[res.accion] || null;
}

function fila(id, res, maximo) {
  const perdidos = maximo - res.puntos;
  if (perdidos <= 0) return null;
  const d = TXT.filas[id];
  // Guion 17: fue error si restó, si fue falso positivo o si cayó y luego recuperó con el reporte (aunque quede en 0).
  const fueError = res.puntos < 0 || res.recupero || (res.banderas || []).includes("FP");
  const hiciste = hicisteDe(id, res);
  return {
    id,
    titulo: d.titulo,
    error: d.error,
    obtuvo: res.puntos,
    maximo,
    perdidos,
    fueError,
    hiciste: res.recupero && hiciste ? `${hiciste} ${TXT.recupero}` : hiciste,
    mejor: d.mejor,
    hora: eventoPorId[id]?.hora ?? res.horaJuego ?? null,
  };
}

export function repasoPuntos(evaluacion) {
  const filas = [];
  for (const [id, res] of Object.entries(evaluacion.eventos)) {
    if (res.partes) {
      for (const [parte, r] of Object.entries(res.partes)) filas.push(fila(parte, { ...r, horaJuego: (parte === "14B" ? eventoPorId.E14B : eventoPorId[id])?.hora }, MAX_PARTE[parte]));
      continue;
    }
    if (!TXT.filas[id]) continue;
    filas.push(fila(id, res, eventoPorId[id]?.maximo ?? 0));
  }
  for (const d of evaluacion.distraccionesLista || []) {
    const t = TXT.filas.distraccion;
    filas.push({ id: `D_${d.sitio}`, titulo: t.titulo(d.sitio), error: t.error, fueError: true, obtuvo: -1, maximo: 0, perdidos: 1, hiciste: null, mejor: t.mejor, hora: d.horaJuego });
  }
  // Guion 19: los pendientes sin hacer (o hechos tarde) van en UNA sola fila con su lista.
  const estado = evaluacion.pendientesEstado || {};
  const t = TXT.filas.pendiente;
  const faltantes = PENDIENTES.filter((p) => estado[p.id] !== "hecho").map((p) => ({ id: p.id, texto: p.texto, estado: estado[p.id] === "tarde" ? t.tarde : t.sinHacer, mejor: t.mejor[p.id] }));
  if (faltantes.length) {
    filas.push({ id: "P_pendientes", titulo: t.grupo(faltantes.length), error: t.error, fueError: false, obtuvo: 0, maximo: 0, perdidos: faltantes.length, hiciste: null, mejor: null, lista: faltantes, hora: "13:00" });
  }
  // Orden (guion 19): errores de seguridad → trampas o correos que no atendió → tu jornada (distracciones y pendientes).
  // Dentro de cada grupo, lo que más costó primero y, a igual costo, en el orden del día.
  const grupo = (f) => (f.error === "jornada" ? 2 : f.fueError ? 0 : 1);
  return filas.filter(Boolean).sort((a, b) => grupo(a) - grupo(b) || b.perdidos - a.perdidos || String(a.hora).localeCompare(String(b.hora)));
}
