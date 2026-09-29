/**
 * Perfiles, banderas y punto débil (guion, P7 y sección 4).
 */

// Banderas que calcula el motor.
export const banderas = {
  ERR: "Tiene al menos una etiqueta 🏷",
  ALERTA: "En E6 continuó (aunque bloquee), o en 5B cerró con ✕",
  FP: "Reportó o marcó como Spam un correo legítimo (E2, 3B, E8)",
  REPORTO: "En 7A: desconectar+reportar, reportar o Mesa de Ayuda",
  PRISA: "Error en E1 o E5 con tiempo de decisión < 10 s",
  PASIVO: "Puntaje crudo por debajo de la mitad del máximo (guion 18.3)",
};

// Perfiles en orden de prioridad: gana el primero cuya regla se cumpla.
export const perfiles = [
  { id: "reacciona", icono: "🧯", nombre: "El que reacciona", mensaje: "Te equivocaste, pero hiciste lo más importante: avisaste a tiempo.", regla: { todas: ["ERR", "REPORTO"] } },
  { id: "espero", icono: "⏳", nombre: "El que esperó", mensaje: "Equivocarse es humano; esperar a ver qué pasa es lo peligroso.", regla: { todas: ["ERR"] } },
  { id: "por_poco", icono: "🍀", nombre: "El que se salvó por poco", mensaje: "No caíste, pero pasaste por encima de una alerta. Hoy tuviste suerte.", regla: { todas: ["ALERTA"] } },
  { id: "desconfiado", icono: "🔒", nombre: "El Desconfiado", mensaje: "Verificar no es rechazar todo. Aprende a distinguir.", regla: { todas: ["FP"] } },
  { id: "pasivo", icono: "🌫", nombre: "El que dejó pasar el día", mensaje: "No caíste en nada, pero casi todo pasó sin que lo atendieras. No reaccionar también es un riesgo.", regla: { todas: ["PASIVO"] } },
  { id: "verificador", icono: "🛡", nombre: "El Verificador", mensaje: "Lees, verificas y decides.", regla: { todas: [] } },
];

// Punto débil: categoría con más puntos perdidos. Si PRISA → "La prisa". Si no perdió puntos, no se muestra.
export const puntosDebiles = {
  correo: { nombre: "Correo", icono: "📧", consejo: "Antes de hacer clic: Remitente → Mensaje → Enlace/Adjunto → Acción solicitada." },
  navegacion: { nombre: "Navegación", icono: "🌐", consejo: "Verifica la dirección del sitio. No confíes en una página únicamente por su apariencia." },
  descargas: { nombre: "Descargas", icono: "⬇️", consejo: "Prioriza siempre fuentes oficiales o institucionalmente autorizadas." },
  alertas: { nombre: "Alertas", icono: "⚠️", consejo: "“Cerrar y continuar” no siempre es la respuesta. Lee → Verifica → Decide." },
  personas: { nombre: "Confiar en quien te escribe", icono: "💬", consejo: "Tu clave no se presta y un pedido urgente de dinero se verifica por otro canal, aunque parezca de tu jefe." },
  prisa: { nombre: "La prisa", icono: "⏱", consejo: "Tus errores ocurrieron en menos de 10 segundos. La prisa es la mejor amiga del estafador." },
};
