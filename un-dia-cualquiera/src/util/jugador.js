import { config } from "../data/config.js";

const limpiar = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z]/g, "");

const titulo = (s) => s.trim().split(/\s+/)[0].replace(/^./, (c) => c.toUpperCase());

/** Jugador a partir del ingreso: correo nombre.apellido@fcv.org (guion 8.1). */
export function crearJugador({ nombre, apellido, cedula }) {
  const n = limpiar(nombre.trim().split(/\s+/)[0] || "");
  const a = limpiar(apellido.trim().split(/\s+/)[0] || "");
  return {
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    cedula,
    nombreCompleto: `${titulo(nombre)} ${titulo(apellido)}`,
    correo: `${n || "usuario"}.${a || "fcv"}@${config.dominioInstitucional}`,
  };
}

export function jugadorPractica(base) {
  if (base) return base;
  return { nombre: "Tu", apellido: "usuario", cedula: null, nombreCompleto: config.usuario.nombre, correo: config.usuario.correo };
}
