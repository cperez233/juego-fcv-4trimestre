/**
 * ¿Cuándo está resuelto un evento? Decide cuándo se adelanta la jornada (guion 8.2). Lógica pura.
 */
import { accionesDe } from "./registro.js";

const hay = (reg, clave, lista) => accionesDe(reg, clave).some((a) => lista.includes(a.accion));

export function eventoResuelto(id, reg) {
  switch (id) {
    case "E1":
      return hay(reg, "E1", ["reportar", "spam", "eliminar", "archivar", "responder", "reenviar_otro", "cerrar_sin_escribir", "escribir_credenciales"]);
    case "E2": {
      const a = accionesDe(reg, "E2").map((x) => x.accion);
      return (a.includes("abrir_adjunto") && a.includes("responder")) || a.some((x) => ["reportar", "spam", "eliminar", "archivar", "responder", "reenviar_otro"].includes(x));
    }
    case "E3": {
      const a3 = hay(reg, "3A", ["3A_reportar", "3A_eliminar", "3A_abrir_adjunto", "3A_spam", "3A_responder", "3A_reenviar_otro"]);
      const b3 = hay(reg, "3B", ["3B_reportar", "3B_no_es_spam", "3B_eliminar"]) || reg.aperturas["3B"] != null;
      // Basta con resolver uno de los dos: el otro se puede seguir atendiendo mientras avanza el día.
      return a3 || b3;
    }
    case "E4":
      return hay(reg, "E4", ["llenar_formulario", "cerrar", "intranet"]);
    case "E5":
      return hay(reg, "E5", ["enviar_pdf", "mesa_ayuda", "instalar_extension", "cuarentena", "cerrar_x", "permitir"]);
    case "E6":
      return hay(reg, "E6", ["volver", "permitir", "bloquear", "responder"]);
    case "E7":
      return hay(reg, "E7", ["reportar", "mesa_ayuda", "contar_companero", "reiniciar", "nada", "respuesta_reportar", "respuesta_cambiar_clave", "respuesta_andrea", "respuesta_tranquilo", "respuesta_sin_respuesta"]);
    case "E14B":
      return hay(reg, "14B", ["14B_reportar", "14B_spam", "14B_eliminar", "14B_archivar", "14B_responder", "14B_reenviar_otro", "14B_cerrar_sin_escribir", "14B_escribir_credenciales"]);
    case "E14": {
      const a = hay(reg, "14A", ["14A_encuesta", "14A_reportar", "14A_spam", "14A_eliminar", "14A_archivar"]);
      const b = hay(reg, "14B", ["14B_reportar", "14B_spam", "14B_eliminar", "14B_archivar", "14B_responder", "14B_reenviar_otro", "14B_cerrar_sin_escribir", "14B_escribir_credenciales"]);
      return a || b;
    }
    case "E8":
      return hay(reg, "E8", ["inscribirse", "reportar", "spam", "eliminar", "archivar", "reenviar_otro"]);
    case "E9":
      // Ignorar el video es lo correcto: el día sigue enseguida (el enlace queda en el chat).
      return true;
    case "E10":
      return accionesDe(reg, "E10").length > 0;
    case "E11":
      return hay(reg, "E11", ["caso_impresora"]);
    case "E12":
      return hay(reg, "E12", ["reportar", "bloquear", "verificar_andrea", "enviar_codigos", "posponer"]);
    case "E15":
      return hay(reg, "E15", ["reservar"]);
    case "E16":
      return hay(reg, "E16", ["reportar", "bloquear", "verificar", "negar", "aceptar", "descargar"]);
    case "E17":
      // La pestaña aparece cuando vuelva a usar el navegador; el día no la espera.
      return true;
    case "E13":
      return hay(reg, "E13", ["intranet", "cuarentena", "cerrar_x", "permitir"]);
    default:
      return true;
  }
}
