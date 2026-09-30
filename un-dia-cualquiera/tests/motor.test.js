import { describe, it, expect } from "vitest";
import * as R from "../src/engine/registro.js";
import {
  evaluarE1,
  evaluarE2,
  evaluarE3,
  evaluarE4,
  evaluarE5,
  evaluarE6,
  evaluarE7,
  evaluarJornada,
  pendientesCumplidos,
} from "../src/engine/puntaje.js";
import { calcularBanderas, etiquetaMasGrave } from "../src/engine/banderas.js";
import { calcularPerfil, calcularPuntoDebil, calcularRiesgo } from "../src/engine/perfil.js";
import { seleccionarTarjetas } from "../src/engine/rebobinado.js";
import { repasoPuntos } from "../src/engine/repaso.js";
import { eventoPorId } from "../src/data/eventos.js";
import { config } from "../src/data/config.js";
import { construirResultado, compararParaRanking } from "../src/engine/resumen.js";

// Lista de acciones con tiempos crecientes, como las guarda el registro.
const L = (...nombres) => nombres.map((accion, i) => ({ accion, ms: 1000 * (i + 1), tDecisionMs: 20000 }));
const p = (r) => r.puntos;

/** Registro a partir de pasos [clave, accion, msOpcional]. */
function registro(pasos, { llegadas = {}, aperturas = {}, inspecciones = [] } = {}) {
  let reg = R.crearRegistro();
  for (const [c, ms] of Object.entries(llegadas)) reg = R.registrarLlegada(reg, c, ms);
  for (const [c, ms] of Object.entries(aperturas)) reg = R.registrarApertura(reg, c, ms);
  for (const [c, tipo, ms] of inspecciones) reg = R.registrarInspeccion(reg, c, tipo, ms);
  let t = 100000;
  for (const [clave, accion, ms, detalle] of pasos) {
    t = ms ?? t + 1000;
    const evento = clave === "3A" || clave === "3B" ? "E3" : clave === "14A" || clave === "14B" ? "E14" : clave;
    reg = R.registrarAccion(reg, { clave, evento, accion, ms: t, horaJuego: "08:00", detalle });
  }
  return reg;
}

describe("E1 — Talento Humano (trampa)", () => {
  it.each([
    [["reportar"], 3],
    [["spam"], 1],
    [["eliminar"], 1],
    [[], 0],
    [["archivar"], 0],
    [["reenviar_otro"], 0],
    [["responder"], -1],
    [["clic_enlace"], -2],
    [["clic_enlace", "cerrar_sin_escribir"], -1],
    [["clic_enlace", "escribir_credenciales"], -4],
  ])("%j → %i", (acciones, puntos) => expect(p(evaluarE1(L(...acciones)))).toBe(puntos));

  it("escribir credenciales pone la etiqueta CREDENCIALES", () => {
    expect(evaluarE1(L("clic_enlace", "escribir_credenciales")).etiqueta).toBe("CREDENCIALES");
  });

  it("reportar después del error recupera +1 (sin llegar a reportar de una)", () => {
    expect(p(evaluarE1(L("clic_enlace", "cerrar_sin_escribir", "reportar")))).toBe(0);
    expect(p(evaluarE1(L("clic_enlace", "escribir_credenciales", "reportar")))).toBe(-3);
    expect(p(evaluarE1(L("responder", "reportar")))).toBe(0);
  });

  it("reportar antes del clic no borra el error", () => {
    expect(p(evaluarE1(L("reportar", "clic_enlace", "escribir_credenciales")))).toBe(-4);
  });
});

describe("E2 — correo real del jefe (legítimo)", () => {
  it.each([
    [["abrir_adjunto", "responder"], 2],
    [["responder", "abrir_adjunto"], 2],
    [["reportar"], -1],
    [["spam"], -1],
    [[], 0],
    [["responder"], 0],
    [["abrir_adjunto"], 0],
    [["eliminar"], 0],
    [["archivar"], 0],
  ])("%j → %i", (acciones, puntos) => expect(p(evaluarE2(L(...acciones)))).toBe(puntos));

  it("reportar o Spam marca falso positivo", () => {
    expect(evaluarE2(L("reportar")).banderas).toContain("FP");
    expect(evaluarE2(L("abrir_adjunto", "spam")).banderas).toContain("FP");
  });
});

describe("E3 — carpeta Spam (mixto)", () => {
  it.each([
    [["3A_reportar"], [], null, 2],
    [["3A_eliminar"], [], null, 1],
    [["3A_abrir_adjunto"], [], null, -3],
    [[], ["3B_no_es_spam"], null, 1],
    [[], [], 5000, 1],
    [[], ["3B_reportar"], 5000, -1],
    [["3A_reportar"], ["3B_no_es_spam"], 5000, 3],
    [[], [], null, 0],
  ])("3A %j · 3B %j (abierto %s) → %i", (a, b, abierto, puntos) => expect(p(evaluarE3(L(...a), L(...b), abierto))).toBe(puntos));

  it("abrir el adjunto de 3A pone MALWARE; reportarlo después recupera +1", () => {
    expect(evaluarE3(L("3A_abrir_adjunto"), [], null).etiqueta).toBe("MALWARE");
    expect(p(evaluarE3(L("3A_abrir_adjunto", "3A_reportar"), [], null))).toBe(-2);
  });

  it("reportar 3B es falso positivo", () => {
    expect(evaluarE3([], L("3B_reportar"), 1).banderas).toContain("FP");
  });
});

describe("E4 — portal de beneficios (trampa)", () => {
  it.each([
    [["abrir_falsa", "cerrar", "intranet"], 3],
    [["intranet"], 3],
    [["abrir_falsa", "cerrar"], 1],
    [["abrir_falsa", "cerrar", "advertir_julian"], 2],
    [["abrir_falsa", "cerrar", "intranet", "advertir_julian"], 4],
    [["abrir_falsa", "llenar_formulario"], -3],
    [[], 0],
  ])("%j → %i", (acciones, puntos) => expect(p(evaluarE4(L(...acciones)))).toBe(puntos));

  it("llenar el formulario pone CREDENCIALES_BANCO", () => {
    expect(evaluarE4(L("llenar_formulario")).etiqueta).toBe("CREDENCIALES_BANCO");
  });
});

describe("E5 — informe en PDF (trampa) y 5B", () => {
  it.each([
    [["guardar_pdf", "enviar_pdf"], 3],
    [["mesa_ayuda"], 2],
    [["instalar_extension"], -2],
    [["cancelar_extension"], 0],
    [["descargar_programa"], -2],
    [["descargar_programa", "mas_info", "cuarentena"], 1],
    [["descargar_programa", "cuarentena"], 0],
    [["descargar_programa", "cerrar_x"], -3],
    [["descargar_programa", "permitir"], -4],
    [["enviar_docx"], 0],
    [[], 0],
  ])("%j → %i", (acciones, puntos) => expect(p(evaluarE5(L(...acciones)))).toBe(puntos));

  it("cerrar 5B con ✕ pone MALWARE y ALERTA", () => {
    const r = evaluarE5(L("descargar_programa", "cerrar_x"));
    expect(r.etiqueta).toBe("MALWARE");
    expect(r.banderas).toContain("ALERTA");
  });

  it("la descarga manda aunque después envíe bien el PDF", () => {
    expect(p(evaluarE5(L("descargar_programa", "cuarentena", "guardar_pdf", "enviar_pdf")))).toBe(0);
  });

  it("extensión + programa: vale la más riesgosa y guarda ambas etiquetas", () => {
    const r = evaluarE5(L("instalar_extension", "descargar_programa", "permitir"));
    expect(r.puntos).toBe(-4);
    expect(r.etiquetas).toEqual(expect.arrayContaining(["MALWARE", "EXTENSION"]));
  });
});

describe("E6 — conexión no privada (trampa)", () => {
  it.each([
    [["clic_enlace", "volver", "responder"], 3],
    [["clic_enlace", "volver"], 3],
    [["responder"], 3],
    [["clic_enlace", "continuar", "bloquear"], 0],
    [["clic_enlace", "continuar", "permitir"], -3],
    [[], 0],
  ])("%j → %i", (acciones, puntos) => expect(p(evaluarE6(L(...acciones)))).toBe(puntos));

  it("continuar activa ALERTA; permitir pone PERMISOS", () => {
    expect(evaluarE6(L("continuar", "bloquear")).banderas).toContain("ALERTA");
    expect(evaluarE6(L("continuar", "permitir")).etiqueta).toBe("PERMISOS");
  });
});

describe("E7 — el momento de la verdad", () => {
  it.each([
    [["inicio_A", "desconectar", "reportar"], 5],
    [["inicio_A", "reportar"], 4],
    [["inicio_A", "mesa_ayuda"], 3],
    [["inicio_A", "contar_companero"], 0],
    [["inicio_A", "desconectar"], 0],
    [["inicio_A", "reiniciar"], -2],
    [["inicio_A", "nada"], -4],
    [["inicio_A"], -4],
    [["inicio_B", "respuesta_reportar"], 5],
    [["inicio_B", "respuesta_cambiar_clave"], 1],
    [["inicio_B", "respuesta_tranquilo"], -2],
    [["inicio_B"], 0],
  ])("%j → %i", (acciones, puntos) => expect(p(evaluarE7(L(...acciones)))).toBe(puntos));

  it("REPORTO solo en 7A con desconectar+reportar, reportar o Mesa de Ayuda", () => {
    expect(evaluarE7(L("inicio_A", "reportar")).banderas).toContain("REPORTO");
    expect(evaluarE7(L("inicio_A", "mesa_ayuda")).banderas).toContain("REPORTO");
    expect(evaluarE7(L("inicio_A", "contar_companero")).banderas).not.toContain("REPORTO");
    expect(evaluarE7(L("inicio_B", "respuesta_reportar")).banderas).not.toContain("REPORTO");
  });
});

// Jornada perfecta: 27/27.
const PERFECTA = [
  ["E1", "reportar"],
  ["E2", "abrir_adjunto"],
  ["E2", "responder"],
  ["E3", "abrir_spam"],
  ["3A", "3A_reportar"],
  ["3B", "3B_no_es_spam"],
  ["E4", "intranet"],
  ["E4", "advertir_julian"],
  ["E5", "guardar_pdf"],
  ["E5", "enviar_pdf"],
  ["E6", "clic_enlace"],
  ["E6", "volver"],
  ["E6", "responder"],
  ["E7", "inicio_B"],
  ["E7", "respuesta_reportar"],
  // v5 (guion 9)
  ["E8", "inscribirse"],
  ["E10", "mesa"],
  ["E11", "caso_impresora"],
  ["E12", "verificar_andrea"],
  ["E12", "reportar"],
  ["E13", "intranet"],
  // v5.1 (guion 10)
  ["14A", "14A_encuesta"],
  ["14B", "14B_reportar"],
  // v5.6 (guion 15)
  ["E15", "reservar"],
  ["E16", "reportar"],
  ["E17", "cerrar"],
];

describe("Jornada completa", () => {
  it("la jornada perfecta suma 49 (el máximo del guion v5.10)", () => {
    const ev = evaluarJornada(registro(PERFECTA));
    expect(ev.puntaje).toBe(49);
    expect(ev.puntosPendientes).toBe(7);
    expect(ev.distracciones).toBe(0);
  });

  it("el puntaje mostrado nunca baja de 0 pero el crudo sí se guarda", () => {
    const ev = evaluarJornada(
      registro([
        ["E1", "clic_enlace"],
        ["E1", "escribir_credenciales"],
        ["3A", "3A_abrir_adjunto"],
        ["E4", "llenar_formulario"],
        ["E5", "descargar_programa"],
        ["E5", "permitir"],
        ["E6", "continuar"],
        ["E6", "permitir"],
        ["E7", "inicio_A"],
        ["E7", "nada"],
      ])
    );
    // E9 sin abrir el video: +1. E17 nunca apareció (no volvió al navegador): +2.
    expect(ev.puntajeCrudo).toBe(-4 - 3 - 3 - 4 - 3 - 4 + 1 + 2);
    expect(ev.puntaje).toBe(0);
  });


});

describe("Banderas, perfil y punto débil", () => {
  const banderasDe = (pasos, opts) => {
    const reg = registro(pasos, opts);
    const ev = evaluarJornada(reg);
    return { ev, b: calcularBanderas(ev, reg, 10000), reg };
  };

  it("perfil: ERR + REPORTO → El que reacciona (prioridad 1)", () => {
    const { b } = banderasDe([["E1", "clic_enlace"], ["E1", "escribir_credenciales"], ["E7", "inicio_A"], ["E7", "reportar"]]);
    expect(calcularPerfil(b).id).toBe("reacciona");
  });

  it("perfil: ERR sin reportar → El que esperó", () => {
    const { b } = banderasDe([["E4", "llenar_formulario"], ["E7", "inicio_A"], ["E7", "contar_companero"]]);
    expect(calcularPerfil(b).id).toBe("espero");
  });

  it("perfil: ALERTA sin error → El que se salvó por poco (aunque también tenga FP)", () => {
    const { b } = banderasDe([["E6", "continuar"], ["E6", "bloquear"], ["E2", "reportar"]]);
    expect(b.ERR).toBe(false);
    expect(calcularPerfil(b).id).toBe("por_poco");
  });

  it("perfil: FP sin error ni alerta → El Desconfiado", () => {
    const { b } = banderasDe([["E2", "spam"]]);
    expect(calcularPerfil(b).id).toBe("desconfiado");
  });

  it("perfil: sin banderas → El Verificador", () => {
    const { b } = banderasDe(PERFECTA);
    expect(calcularPerfil(b).id).toBe("verificador");
  });

  it("PRISA: error en E1 decidido en menos de 10 s", () => {
    const rapido = banderasDe([["E1", "clic_enlace", 104000]], { aperturas: { E1: 100000 } });
    expect(rapido.b.PRISA).toBe(true);
    const lento = banderasDe([["E1", "clic_enlace", 115000]], { aperturas: { E1: 100000 } });
    expect(lento.b.PRISA).toBe(false);
  });

  it("PRISA: error en E5 (extensión) rápido; y sin referencia de tiempo no se marca", () => {
    expect(banderasDe([["E5", "instalar_extension", 103000]], { aperturas: { E5: 100000 } }).b.PRISA).toBe(true);
    expect(banderasDe([["E5", "instalar_extension"]]).b.PRISA).toBe(false);
  });

  it("punto débil: PRISA manda; si no, la categoría con más puntos perdidos", () => {
    const conPrisa = banderasDe([["E1", "clic_enlace", 102000]], { aperturas: { E1: 100000 } });
    expect(calcularPuntoDebil(conPrisa.ev, conPrisa.b)).toBe("prisa");
    const desc = banderasDe([...PERFECTA.filter(([c]) => c !== "E5"), ["E5", "instalar_extension"]]);
    expect(calcularPuntoDebil(desc.ev, desc.b)).toBe("descargas");
    const alerta = banderasDe([...PERFECTA.filter(([c]) => c !== "E6"), ["E6", "continuar"], ["E6", "permitir"]]);
    expect(calcularPuntoDebil(alerta.ev, alerta.b)).toBe("alertas");
  });

  it("punto débil: 5B con ✕ reparte la pérdida entre descargas (5) y alertas (1)", () => {
    const x = banderasDe([...PERFECTA.filter(([c]) => c !== "E5"), ["E5", "descargar_programa"], ["E5", "permitir"]]);
    expect(calcularPuntoDebil(x.ev, x.b)).toBe("descargas");
  });

  it("punto débil: null si no perdió puntos", () => {
    const { ev, b } = banderasDe(PERFECTA);
    expect(calcularPuntoDebil(ev, b)).toBeNull();
  });

  it("etiqueta más grave: MALWARE > CREDENCIALES_BANCO > CREDENCIALES > EXTENSION > PERMISOS", () => {
    const { ev } = banderasDe([["E6", "continuar"], ["E6", "permitir"], ["E1", "clic_enlace"], ["E1", "escribir_credenciales"], ["E4", "llenar_formulario"]]);
    expect(etiquetaMasGrave(ev)).toBe("CREDENCIALES_BANCO");
  });

  it("riesgo: suma de negativos y nivel", () => {
    expect(calcularRiesgo(evaluarJornada(registro(PERFECTA))).nivel).toBe("bajo");
    expect(calcularRiesgo(evaluarJornada(registro([["E1", "responder"]])))).toEqual({ valor: 1, nivel: "medio" });
  });
});

describe("Rebobinado", () => {
  it("todos los errores + máx. 3 aciertos, en orden cronológico inverso; al final, pendientes sin hacer", () => {
    const ev = evaluarJornada(
      registro([
        ["E1", "reportar"],
        ["E2", "spam"],
        ["E4", "llenar_formulario"],
        ["E5", "guardar_pdf"],
        ["E5", "enviar_pdf"],
        ["E6", "clic_enlace"],
        ["E6", "volver"],
        ["E7", "inicio_A"],
        ["E7", "reportar"],
      ])
    );
    const t = seleccionarTarjetas(ev).map((x) => x.id);
    // Errores: E2 (FP) y E4. Aciertos: E7 primero y luego los de 3 puntos más recientes (E6 volver vale 3, guion 14.3).
    expect(t).toEqual(["E7", "E6", "E5", "E4", "E2", "P_sin"]);
  });
});

describe("Resultado y desempate", () => {
  it("construye el payload con inspección antes de actuar", () => {
    const reg = registro([["E1", "reportar", 200000]], { aperturas: { E1: 190000 }, inspecciones: [["E1", "remitente", 195000]] });
    const r = construirResultado(reg, { jugador: { cedula: "123", nombre: "Ana", apellido: "Ruiz" }, modo: "oficial", inicio: "2026-10-01T10:00:00Z", fin: "2026-10-01T10:06:00Z", dispositivo: "pc" });
    expect(r.eventos.find((e) => e.id === "E1").inspecciono).toBe(true);
    expect(r.eventos.find((e) => e.id === "E1").tDecisionMs).toBe(10000);
    expect(r.desempate.inspecciones).toBe(1);
    expect(r.duracionMs).toBe(360000);
  });

  it("la hoja de enlace en móvil no cuenta como inspección", () => {
    const reg = registro([["E1", "clic_enlace", 200000]], { inspecciones: [["E1", "enlace_movil", 199000]] });
    expect(R.inspeccionoAntes(reg, "E1", 200000)).toBe(false);
  });

  it("ranking: solo por puntaje; el empate queda en 0 (lo resuelve un sorteo en el servidor)", () => {
    const base = { puntaje: 20, desempate: { duracionActivaMs: 600000, inspecciones: 2, tReaccionE7Ms: 9000, pendientes: 3 }, fin: "2026-10-01T10:00:00Z" };
    expect(compararParaRanking({ ...base, puntaje: 21 }, base)).toBeLessThan(0);
    expect(compararParaRanking(base, { ...base, puntaje: 21 })).toBeGreaterThan(0);
    // Más rápido, más inspecciones o terminar antes ya no desempatan.
    const masRapido = { ...base, desempate: { ...base.desempate, duracionActivaMs: 300000, inspecciones: 5 }, fin: "2026-10-01T09:00:00Z" };
    expect(compararParaRanking(masRapido, base)).toBe(0);
  });
});

describe("v5 — eventos nuevos (guion 9.4)", () => {
  const ev = (pasos, opts) => evaluarJornada(registro(pasos, opts));

  it("E8 capacitación: inscribirse +2, reportarla es falso positivo", () => {
    expect(ev([["E8", "inscribirse"]]).eventos.E8.puntos).toBe(2);
    const r = ev([["E8", "reportar"]]).eventos.E8;
    expect(r.puntos).toBe(-1);
    expect(r.banderas).toContain("FP");
  });

  it("E9 video: no abrir +1; la falsa actualización decide el daño", () => {
    expect(ev([]).eventos.E9.puntos).toBe(1);
    expect(ev([["E9", "abrir_video"]]).eventos.E9.puntos).toBe(0);
    expect(ev([["E9", "descargar"], ["E9", "permitir"]]).eventos.E9).toMatchObject({ puntos: -4, etiqueta: "MALWARE" });
    expect(ev([["E9", "descargar"], ["E9", "mas_info"], ["E9", "cuarentena"]]).eventos.E9.puntos).toBe(0);
    expect(ev([["E9", "descargar"], ["E9", "cuarentena"]]).eventos.E9.puntos).toBe(-1);
  });

  it.each([
    ["dar_clave", -3],
    ["prestar_sesion", -1],
    ["mesa", 3],
    ["negar", 1],
  ])("E10 clave: %s = %i", (accion, puntos) => {
    expect(ev([["E10", accion]]).eventos.E10.puntos).toBe(puntos);
  });

  it("E12 suplantación: reportar 3, verificar 2, ambas 3, códigos −3 FRAUDE y recupera +1", () => {
    expect(ev([["E12", "reportar"]]).eventos.E12.puntos).toBe(3);
    expect(ev([["E12", "verificar_andrea"]]).eventos.E12.puntos).toBe(2);
    expect(ev([["E12", "verificar_andrea"], ["E12", "reportar"]]).eventos.E12).toMatchObject({ puntos: 3, accion: "reportar_y_verificar" });
    expect(ev([["E12", "comprar"], ["E12", "enviar_codigos"]]).eventos.E12).toMatchObject({ puntos: -3, etiqueta: "FRAUDE" });
    expect(ev([["E12", "comprar"], ["E12", "enviar_codigos"], ["E12", "reportar"]]).eventos.E12.puntos).toBe(-2);
    expect(ev([["E12", "bloquear"]]).eventos.E12.puntos).toBe(1);
  });

  it("E13 vacaciones: intranet +2; el anuncio descarga un .exe", () => {
    expect(ev([["E13", "intranet"]]).eventos.E13.puntos).toBe(2);
    expect(ev([["E13", "descargar"], ["E13", "cerrar_x"], ["E13", "intranet"]]).eventos.E13).toMatchObject({ puntos: -3, etiqueta: "MALWARE" });
  });

  it("distracciones: −1 productividad por sitio distinto, máximo −3", () => {
    const e = ev([["EX", "distraccion_videos"], ["EX", "distraccion_videos"], ["EX", "distraccion_noticias"]]);
    expect(e.distracciones).toBe(2);
    expect(e.productividad).toBe(-2);
    expect(ev([["EX", "distraccion_videos"], ["EX", "distraccion_noticias"], ["EX", "distraccion_tienda"], ["EX", "distraccion_otra"]]).distracciones).toBe(3);
  });

  it("trampas de la navegación libre: llamar −2, cupón con tarjeta −3 FRAUDE", () => {
    expect(ev([["EX", "llamar"]]).eventos.EX.puntos).toBe(-2);
    expect(ev([["EX", "cupon_tarjeta"], ["EX", "llamar"]]).eventos.EX).toMatchObject({ puntos: -3, etiqueta: "FRAUDE" });
  });

  it("pendientes con hora límite: tarde no suma", () => {
    let reg = R.crearRegistro();
    reg = R.registrarAccion(reg, { clave: "E8", evento: "E8", accion: "inscribirse", ms: 1, horaJuego: "10:05" });
    reg = R.registrarAccion(reg, { clave: "E5", evento: "E5", accion: "enviar_pdf", ms: 2, horaJuego: "11:59" });
    const e = evaluarJornada(reg);
    expect(e.pendientesEstado.capacitacion).toBe("tarde");
    expect(e.pendientesEstado.informe).toBe("hecho");
    expect(e.puntosPendientes).toBe(1);
  });

  it("E7J: responderle mal a Julián durante el incidente resta 2; lo demás no suma", () => {
    expect(ev([["E7J", "respuesta_tranquilo"]]).eventos.E7J.puntos).toBe(-2);
    expect(ev([["E7J", "respuesta_reportar"]]).eventos.E7J.puntos).toBe(0);
  });

  it("FRAUDE va entre CREDENCIALES y EXTENSION", () => {
    const e = ev([["E12", "enviar_codigos"], ["E5", "instalar_extension"]]);
    expect(etiquetaMasGrave(e)).toBe("FRAUDE");
  });

  it("punto débil 'personas' cuando se pierde en E10 y E12", () => {
    const reg = registro([...PERFECTA.filter(([c]) => c !== "E10" && c !== "E12"), ["E10", "dar_clave"], ["E12", "enviar_codigos"]]);
    const e = evaluarJornada(reg);
    expect(calcularPuntoDebil(e, calcularBanderas(e, reg, 10000))).toBe("personas");
  });
});

describe("v5.1 — guion 10", () => {
  const ev = (pasos, opts) => evaluarJornada(registro(pasos, opts));

  it("E14: encuesta real +1, reportar el buzón falso +2, caer −3 CREDENCIALES", () => {
    expect(ev([["14A", "14A_encuesta"], ["14B", "14B_reportar"]]).eventos.E14.puntos).toBe(3);
    expect(ev([["14A", "14A_reportar"]]).eventos.E14).toMatchObject({ puntos: -1, accion: "14A_reportar" });
    const caer = ev([["14B", "14B_clic_enlace"], ["14B", "14B_escribir_credenciales"]]).eventos.E14;
    expect(caer).toMatchObject({ puntos: -3, etiqueta: "CREDENCIALES", accion: "14B_escribir_credenciales" });
    expect(ev([["14B", "14B_clic_enlace"], ["14B", "14B_cerrar_sin_escribir"], ["14B", "14B_reportar"]]).eventos.E14.puntos).toBe(0);
  });

  it("rebobinado: cada distracción y cada pendiente tarde es una tarjeta de error", () => {
    let reg = R.crearRegistro();
    reg = R.registrarAccion(reg, { clave: "EX", evento: "EX", accion: "distraccion_videos", ms: 1, horaJuego: "08:12" });
    reg = R.registrarAccion(reg, { clave: "EX", evento: "EX", accion: "distraccion_videos", ms: 2, horaJuego: "09:12" });
    reg = R.registrarAccion(reg, { clave: "EX", evento: "EX", accion: "distraccion_tienda", ms: 3, horaJuego: "09:40" });
    reg = R.registrarAccion(reg, { clave: "E8", evento: "E8", accion: "inscribirse", ms: 4, horaJuego: "10:30" });
    const ids = seleccionarTarjetas(evaluarJornada(reg)).map((x) => x.id);
    expect(ids).toContain("D_videos");
    expect(ids).toContain("D_tienda");
    expect(ids.filter((x) => x === "D_videos")).toHaveLength(1);
    expect(ids).toContain("P_capacitacion");
    expect(ids[ids.length - 1]).toBe("P_sin");
  });

  it("rebobinado de la jornada perfecta: sin errores ni pendientes sin hacer", () => {
    const t = seleccionarTarjetas(evaluarJornada(registro(PERFECTA)));
    expect(t.every((x) => !x.error)).toBe(true);
    expect(t).toHaveLength(3);
  });
});

describe("v5.2 — guion 11", () => {
  it("repaso: la jornada perfecta no pierde nada", () => {
    expect(repasoPuntos(evaluarJornada(registro(PERFECTA)))).toEqual([]);
  });

  it("repaso: lo perdido suma exactamente máximo − puntaje crudo, y cada fila dice qué era lo mejor", () => {
    const jornadas = [
      [],
      [["E1", "spam"], ["E2", "reportar"], ["E4", "intranet"], ["E6", "clic_enlace"], ["E6", "continuar"], ["E6", "permitir"], ["EX", "distraccion_videos"], ["E10", "negar"]],
      [["E1", "clic_enlace"], ["E1", "escribir_credenciales"], ["3A", "3A_abrir_adjunto"], ["14B", "14B_escribir_credenciales"], ["E12", "enviar_codigos"], ["E7J", "respuesta_tranquilo"], ["EX", "llamar"]],
      PERFECTA.filter(([c]) => c !== "E5"),
    ];
    for (const pasos of jornadas) {
      const ev = evaluarJornada(registro(pasos));
      const filas = repasoPuntos(ev);
      expect(filas.reduce((n, f) => n + f.perdidos, 0)).toBe(config.puntajeMaximo - ev.puntajeCrudo);
      for (const f of filas) {
        expect(f.mejor || f.lista?.every((x) => x.mejor), f.id).toBeTruthy();
        expect(f.titulo, f.id).toBeTruthy();
      }
    }
  });

  it("repaso: mover a Spam el correo de nómina muestra que reportarlo valía 2 puntos más", () => {
    const f = repasoPuntos(evaluarJornada(registro([...PERFECTA.filter(([c]) => c !== "E1"), ["E1", "spam"]])));
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ id: "E1", obtuvo: 1, maximo: 3, perdidos: 2, hiciste: expect.any(String) });
  });

  it("rebobinado: los aciertos que se muestran son de seguridad, no de productividad", () => {
    const t = seleccionarTarjetas(evaluarJornada(registro(PERFECTA)));
    for (const x of t) {
      expect(["legitimo", "tarea"]).not.toContain(eventoPorId[x.id]?.naturaleza);
      expect(x.accion).not.toMatch(/^(3B_|14A_)/);
    }
    expect(t.some((x) => x.id === "E7")).toBe(true);
  });
});

describe("v5.6 — guion 15", () => {
  const ev = (pasos, opts) => evaluarJornada(registro(pasos, opts)).eventos;
  it("E16 soporte falso: reportar 3 · verificar 2 · negar o bloquear 1 · instalar según la protección", () => {
    expect(ev([["E16", "reportar"]]).E16.puntos).toBe(3);
    expect(ev([["E16", "verificar"]]).E16.puntos).toBe(2);
    expect(ev([["E16", "negar"]]).E16.puntos).toBe(1);
    expect(ev([["E16", "bloquear"]]).E16.puntos).toBe(1);
    expect(ev([["E16", "aceptar"]]).E16.puntos).toBe(0);
    expect(ev([["E16", "descargar"], ["E16", "permitir"]]).E16).toMatchObject({ puntos: -4, etiqueta: "MALWARE" });
    expect(ev([["E16", "descargar"], ["E16", "permitir"], ["E16", "reportar"]]).E16.puntos).toBe(-3);
  });
  it("E17 actualización falsa: cerrar 2 · no verla 2 · dejarla abierta 0 · descargar según la protección", () => {
    expect(ev([["E17", "cerrar"]], { aperturas: { E17: 5 } }).E17.puntos).toBe(2);
    expect(ev([]).E17).toMatchObject({ puntos: 2, accion: "no_llego" });
    expect(ev([], { aperturas: { E17: 5 } }).E17.puntos).toBe(0);
    expect(ev([["E17", "descargar"], ["E17", "cerrar_x"]], { aperturas: { E17: 5 } }).E17.puntos).toBe(-3);
  });
  it("pendiente nuevo: reservar la sala", () => {
    expect(pendientesCumplidos(registro([["E15", "reservar"]])).reservar).toBe(true);
  });
});

describe("v5.8 — guion 17", () => {
  it("repaso: caer y luego reportar se muestra como error, con la recuperación explicada", () => {
    const pasos = [...PERFECTA.filter(([c]) => c !== "14B"), ["14B", "14B_clic_enlace"], ["14B", "14B_cerrar_sin_escribir"], ["14B", "14B_reportar"]];
    const f = repasoPuntos(evaluarJornada(registro(pasos)));
    expect(f).toHaveLength(1);
    expect(f[0]).toMatchObject({ id: "14B", obtuvo: 0, perdidos: 2, fueError: true });
    expect(f[0].hiciste).toMatch(/reportaste/);
  });
  it("repaso: solo sumar menos de lo posible (mover a Spam) no es error", () => {
    const f = repasoPuntos(evaluarJornada(registro([...PERFECTA.filter(([c]) => c !== "E1"), ["E1", "spam"]])));
    expect(f[0].fueError).toBe(false);
  });
});

describe("v5.9 — guion 18", () => {
  it("7 pendientes (vuelve Spam, guion 20.1): se cumple al revisar los dos correos, hagas lo que hagas con ellos", () => {
    expect(Object.keys(pendientesCumplidos(registro([])))).toEqual(["informe", "beneficios", "spam", "capacitacion", "impresora", "vacaciones", "reservar"]);
    expect(pendientesCumplidos(registro([["E3", "abrir_spam"]], { aperturas: { "3A": 4, "3B": 5 } })).spam).toBe(true);
    expect(pendientesCumplidos(registro([["E3", "abrir_spam"]], { aperturas: { "3A": 4 } })).spam).toBe(false);
  });
  it("partida de Felipe (acertó lo poco que atendió, 0 pendientes): perfil 'El que dejó pasar el día', no 'El Verificador'", () => {
    const pasos = [["E1", "reportar"], ["E10", "mesa"], ["E12", "reportar"], ["E4", "cerrar"], ["EX", "distraccion_videos"], ["E9", "abrir_video"], ["E7", "inicio_B"]];
    const r = construirResultado(registro(pasos), { jugador: { cedula: "1" }, modo: "practica" });
    expect(r.perfil).toBe("pasivo");
  });
  it("la jornada perfecta sigue siendo 'El Verificador'", () => {
    const r = construirResultado(registro(PERFECTA), { jugador: { cedula: "1" }, modo: "practica" });
    expect(r.perfil).toBe("verificador");
  });
});

describe("v5.9 — guion 19 (repaso más corto)", () => {
  it("los pendientes van en una sola fila, al final, y los errores de seguridad primero", () => {
    const pasos = [["E1", "clic_enlace"], ["E1", "escribir_credenciales"], ["E10", "mesa"], ["EX", "distraccion_videos"]];
    const f = repasoPuntos(evaluarJornada(registro(pasos)));
    const pend = f.filter((x) => x.id.startsWith("P_"));
    expect(pend).toHaveLength(1);
    expect(pend[0].lista).toHaveLength(7);
    expect(f[0].id).toBe("E1");
    // "Tu jornada" (distracciones y pendientes) va al final.
    const i = f.findIndex((x) => x.error === "jornada");
    expect(f.slice(i).every((x) => x.error === "jornada")).toBe(true);
    expect(f.slice(i).map((x) => x.id)).toEqual(["P_pendientes", "D_videos"]);
  });
});
