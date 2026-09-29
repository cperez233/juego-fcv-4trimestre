/**
 * Cliente de la API (se completa con el backend en la Fase 5).
 * Si el servidor aún no responde, el juego sigue funcionando: la validación local manda.
 */
async function post(ruta, cuerpo) {
  try {
    const r = await fetch(ruta, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  }
}

/** { estado: "habilitado" | "no_autorizado" | "ya_participo" } o null si no hay servidor. */
export const validar = (documento) => post("/api/validar", { documento });
export const iniciar = (documento) => post("/api/iniciar", { documento });

/** Nunca se llama en modo práctica. Se envía sin el objeto de evaluación interna. */
export function enviarResultado(resultado) {
  const { evaluacion, ...payload } = resultado;
  return post("/api/resultado", payload);
}
