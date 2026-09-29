import { textos } from "../data/textos.js";
import { config } from "../data/config.js";

const { meses, am, pm, dias } = textos.fecha;

export function horaAMinutos(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function minutosAHHMM(min) {
  const t = Math.floor(min);
  return `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
}

/** 435 → "7:15 a.m." */
export function formatearHora(min) {
  const t = Math.floor(min);
  const h24 = Math.floor(t / 60);
  const m = String(t % 60).padStart(2, "0");
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${m} ${h24 < 12 ? am : pm}`;
}

const mayus = (s) => s.charAt(0).toUpperCase() + s.slice(1);

function partes(iso) {
  const [f, h = "00:00"] = iso.split("T");
  const [y, mo, d] = f.split("-").map(Number);
  return { y, mo, d, h, f };
}

/** Fecha de la lista: hoy → hora; otro día → "25 de Septiembre" (como Zimbra). */
export function fechaLista(iso) {
  const p = partes(iso);
  if (p.f === config.fechaJuego) return formatearHora(horaAMinutos(p.h));
  return `${p.d} de ${mayus(meses[p.mo - 1])}`;
}

/** Fecha del encabezado de lectura: "28 de Septiembre de 2026 07:15". */
export function fechaLarga(iso) {
  const p = partes(iso);
  return `${p.d} de ${mayus(meses[p.mo - 1])} de ${p.y} ${p.h}`;
}

/** "Lunes 28 de septiembre" */
export function fechaJuegoLarga() {
  const p = partes(config.fechaJuego);
  const dia = new Date(p.y, p.mo - 1, p.d).getDay();
  return `${mayus(dias[dia])} ${p.d} de ${meses[p.mo - 1]}`;
}

export function isoHoy(hhmm) {
  return `${config.fechaJuego}T${hhmm}`;
}

/** "28/09/2026" (fecha corta de la barra de tareas). */
export function fechaJuegoCorta() {
  const p = partes(config.fechaJuego);
  return `${String(p.d).padStart(2, "0")}/${String(p.mo).padStart(2, "0")}/${p.y}`;
}
