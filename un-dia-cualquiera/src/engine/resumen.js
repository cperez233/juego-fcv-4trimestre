/**
 * Resultado completo de la partida (payload de /api/resultado) y criterios de desempate.
 */
import { config } from "../data/config.js";
import { evaluarJornada } from "./puntaje.js";
import { calcularBanderas, etiquetas, etiquetaMasGrave } from "./banderas.js";
import { calcularPerfil, calcularPuntoDebil, calcularRiesgo } from "./perfil.js";
import { inspeccionoAntes } from "./registro.js";

// Claves donde se mide la inspección (correos con remitente o enlace revisables).
const CLAVES_INSPECCION = ["E1", "E2", "E8", "3A", "3B", "14A", "14B", "E6"];

/** Eventos en los que inspeccionó antes de su primera acción (desempate 1). */
export function eventosInspeccionados(reg) {
  return CLAVES_INSPECCION.filter((clave) => {
    const primera = reg.acciones.find((a) => a.clave === clave);
    const t = primera ? primera.ms : Infinity;
    return inspeccionoAntes(reg, clave, t);
  }).length;
}

export function construirResultado(reg, { jugador, modo, inicio, fin, dispositivo, duracionActivaMs = null }) {
  const ev = evaluarJornada(reg);
  const banderas = calcularBanderas(ev, reg, config.prisaUmbralMs);
  const perfil = calcularPerfil(banderas);
  const e7 = ev.eventos.E7;
  const porEvento = Object.entries(ev.eventos).map(([id, e]) => {
    const claves = id === "E3" ? ["3A", "3B"] : id === "E14" ? ["14A", "14B"] : [id];
    const acciones = reg.acciones.filter((a) => claves.includes(a.clave));
    const decisiva = acciones.find((a) => a.ms === e.ms) || acciones[0];
    return {
      id,
      accion: e.accion,
      puntos: e.puntos,
      inspecciono: claves.some((c) => inspeccionoAntes(reg, c, decisiva ? decisiva.ms : Infinity)),
      tDecisionMs: decisiva?.tDecisionMs ?? null,
      horaJuego: decisiva?.horaJuego ?? null,
      acciones: acciones.map((a) => a.accion),
    };
  });
  return {
    documento: jugador?.cedula ?? null,
    nombre: jugador ? `${jugador.nombre} ${jugador.apellido}` : null,
    juego: config.juego,
    version: config.version,
    modo,
    dispositivo,
    inicio,
    fin,
    duracionMs: inicio && fin ? Date.parse(fin) - Date.parse(inicio) : null,
    // Tiempo de juego activo (sin contar la pestaña oculta): desempate del ranking (guion 10.4).
    duracionActivaMs: duracionActivaMs != null ? Math.round(duracionActivaMs) : null,
    puntaje: ev.puntaje,
    puntajeCrudo: ev.puntajeCrudo,
    maximo: config.puntajeMaximo,
    perfil: perfil.id,
    puntoDebil: calcularPuntoDebil(ev, banderas),
    riesgo: calcularRiesgo(ev),
    banderas,
    etiquetas: etiquetas(ev),
    etiquetaMasGrave: etiquetaMasGrave(ev),
    e7: { version: e7.version, accion: e7.accion, tiempoHastaReportarMs: e7.tReaccionMs ?? null },
    pendientes: ev.pendientes,
    pendientesEstado: ev.pendientesEstado,
    distracciones: ev.distracciones,
    productividad: ev.productividad,
    desempate: {
      duracionActivaMs: duracionActivaMs != null ? Math.round(duracionActivaMs) : null,
      inspecciones: eventosInspeccionados(reg),
      tReaccionE7Ms: e7.tReaccionMs ?? null,
      pendientes: ev.puntosPendientes,
    },
    eventos: porEvento,
    evaluacion: ev,
  };
}

/**
 * Orden del ranking (guion 10.4): mayor puntaje; si empatan, quien jugó menos tiempo; luego los criterios de 8.7.
 * Negativo si `a` va antes que `b`. El servidor lo usa al cierre de la campaña.
 */
export function compararParaRanking(a, b) {
  if (a.puntaje !== b.puntaje) return b.puntaje - a.puntaje;
  const da = a.desempate.duracionActivaMs ?? Infinity;
  const db = b.desempate.duracionActivaMs ?? Infinity;
  if (da !== db) return da - db;
  if (a.desempate.inspecciones !== b.desempate.inspecciones) return b.desempate.inspecciones - a.desempate.inspecciones;
  const ta = a.desempate.tReaccionE7Ms ?? Infinity;
  const tb = b.desempate.tReaccionE7Ms ?? Infinity;
  if (ta !== tb) return ta - tb;
  if (a.desempate.pendientes !== b.desempate.pendientes) return b.desempate.pendientes - a.desempate.pendientes;
  return Date.parse(a.fin) - Date.parse(b.fin);
}
