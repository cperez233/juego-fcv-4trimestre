import { useEffect, useMemo, useState } from "react";
import { useJuego } from "../../estado/juego.jsx";
import { config } from "../../data/config.js";
import { textos } from "../../data/textos.js";
import { eventoPorId } from "../../data/eventos.js";
import { irCarpeta } from "../../estado/irCarpeta.js";
import { useEsMovil } from "../../ui/useEsMovil.js";
import Icono from "../../ui/Icono.jsx";
import HojaInferior from "../../ui/HojaInferior.jsx";
import Cabecera from "./Cabecera.jsx";
import BarraHerramientas from "./BarraHerramientas.jsx";
import PanelCarpetas, { ListaCarpetas, CARPETAS, contarCarpeta } from "./PanelCarpetas.jsx";
import ListaMensajes from "./ListaMensajes.jsx";
import Lectura from "./Lectura.jsx";
import Redactar from "./Redactar.jsx";
import VisorDocumento from "./VisorDocumento.jsx";
import { DetallesRemitente } from "./Revelar.jsx";
import "./correo.css";

const T = textos.correo;

/**
 * Nombre de la acción en el vocabulario del guion. En E3 se antepone la parte ("3A_reportar").
 * Los correos de relleno no tienen clave: sus acciones no se registran.
 */
function nombreAccion(correo, verbo) {
  return correo.parte ? `${correo.parte}_${verbo}` : verbo;
}

/** Reenviar a Ciberseguridad = reportar. A cualquier otra persona = reenviar_otro. */
function verboDeEnvio(modo, para) {
  if (modo === "reenviar") return para.includes(config.canales.seguridad) ? "reportar" : "reenviar_otro";
  return "responder";
}

function useCorreo() {
  const { state, dispatch } = useJuego();
  const [pestana, setPestana] = useState(0);
  const [carpeta, setCarpeta] = useState(() => irCarpeta.actual || "entrada");
  const [selId, setSelId] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [redaccion, setRedaccion] = useState(null); // { modo, original }
  const [visor, setVisor] = useState(null);
  const [hoja, setHoja] = useState(null); // móvil: { tipo: "remitente"|"enlace"|"carpetas"|"mas", … }

  const lista = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return state.correos
      .filter((c) => c.carpeta === carpeta)
      .filter((c) => !q || `${c.de.nombre} ${c.de.correo} ${c.asunto}`.toLowerCase().includes(q))
      .sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [state.correos, carpeta, busqueda]);

  const sel = lista.find((c) => c.id === selId) || null;

  const verCarpeta = (id) => {
    setCarpeta(id);
    setSelId(null);
    setRedaccion(null);
    setHoja(null);
    if (id === "spam" && state.disparados.E3) dispatch({ type: "accion", clave: "E3", evento: "E3", accion: "abrir_spam" });
  };

  // Tocar la notificación "Tienes 2 mensajes nuevos en Spam" lleva a esa carpeta.
  useEffect(() => {
    const f = (c) => verCarpeta(c);
    irCarpeta.oyentes.add(f);
    if (irCarpeta.actual) {
      verCarpeta(irCarpeta.actual);
      irCarpeta.actual = null;
    }
    return () => irCarpeta.oyentes.delete(f);
  }); // eslint-disable-line react-hooks/exhaustive-deps

  const registrar = (correo, verbo, detalle) => {
    if (!correo?.clave) return;
    dispatch({ type: "accion", clave: correo.clave, evento: correo.evento, accion: nombreAccion(correo, verbo), detalle });
  };
  // Mensajes de estado de Zimbra ("Mensaje enviado"): se ven en la app, no como notificación del sistema.
  const toast = (texto, extra = {}) => dispatch({ type: "toast", texto, extra: { estado: extra.tipo !== "alerta", ...extra } });

  const moverSel = (destino, verbo, aviso) => {
    if (!sel) return;
    dispatch({ type: "mover", id: sel.id, carpeta: destino });
    registrar(sel, verbo);
    toast(aviso);
    setSelId(null);
    setHoja(null);
  };

  const h = {
    seleccionar(id) {
      setSelId(id);
      setRedaccion(null);
      dispatch({ type: "abrirCorreo", id });
    },
    carpeta(id) {
      verCarpeta(id);
    },
    inspeccion(tipo) {
      if (sel?.clave) dispatch({ type: "inspeccion", clave: sel.clave, tipo });
    },
    abrirHoja(datos) {
      // En móvil, abrir la hoja del remitente es inspección voluntaria. La del enlace se abre
      // sola al tocarlo, así que se guarda aparte y no cuenta (respuesta de Cristian, 28-sep).
      h.inspeccion(datos.tipo === "enlace" ? "enlace_movil" : "remitente");
      setHoja(datos);
    },
    clicEnlace(enlace) {
      setHoja(null);
      registrar(sel, "clic_enlace", { url: enlace.url });
      if (enlace.pagina) dispatch({ type: "abrirPagina", pagina: enlace.pagina, seccion: enlace.seccion });
    },
    abrirAdjunto(adj) {
      registrar(sel, "abrir_adjunto", { archivo: adj.nombre });
      if (adj.peligroso) {
        toast(T.toasts.descargando(adj.nombre));
        setTimeout(() => toast(eventoPorId.E3.errorZip, { tipo: "alerta" }), 1200);
      } else if (adj.visor) setVisor(adj.visor);
    },
    maletin(adj) {
      toast(T.toasts.maletin(adj.nombre));
    },
    eliminarAdjunto(adj) {
      dispatch({ type: "eliminarAdjunto", id: sel.id, adjunto: adj.id });
      registrar(sel, "eliminar_adjunto", { archivo: adj.nombre });
      toast(T.toasts.adjuntoEliminado(adj.nombre));
    },
    responder() {
      if (sel) setRedaccion({ modo: "responder", original: sel });
    },
    responderTodos() {
      if (sel) setRedaccion({ modo: "responderTodos", original: sel });
    },
    reenviar() {
      if (sel) setRedaccion({ modo: "reenviar", original: sel });
    },
    nuevo() {
      setRedaccion({ modo: "nuevo", original: null });
    },
    spam() {
      if (carpeta === "spam") moverSel("entrada", "no_es_spam", T.toasts.movidoEntrada);
      else moverSel("spam", "spam", T.toasts.movidoSpam);
    },
    eliminar() {
      moverSel("papelera", "eliminar", T.toasts.eliminado);
    },
    archivar() {
      moverSel("archivo", "archivar", T.toasts.archivado);
    },
    imprimir() {
      toast(T.toasts.impresora);
    },
    enviar({ para, asunto, cuerpo, adjuntos }) {
      const { modo, original } = redaccion;
      dispatch({
        type: "agregarCorreo",
        correo: {
          id: `enviado-${Date.now()}`,
          carpeta: "enviados",
          leido: true,
          de: { nombre: state.jugador.nombreCompleto, correo: state.jugador.correo },
          para,
          asunto,
          cuerpo: [{ tipo: "pre", texto: cuerpo }],
          adjuntos,
        },
      });
      if (original) registrar(original, verboDeEnvio(modo, para), { para });
      // E5: el informe a Andrea. Solo cuenta el PDF.
      if (para.includes(config.personas.andrea.correo)) {
        if (adjuntos.some((a) => a.tipo === "pdf")) {
          dispatch({ type: "accion", clave: "E5", evento: "E5", accion: "enviar_pdf" });
          dispatch({ type: "reaccion", id: "informePdf" });
        } else if (adjuntos.some((a) => a.tipo === "docx")) {
          dispatch({ type: "accion", clave: "E5", evento: "E5", accion: "enviar_docx" });
          dispatch({ type: "reaccion", id: "informeDocx" });
        }
      }
      // E2: Andrea agradece si revisaste el adjunto antes de responder.
      if (original?.clave === "E2" && modo !== "reenviar" && state.registro.acciones.some((a) => a.clave === "E2" && a.accion === "abrir_adjunto")) {
        dispatch({ type: "reaccion", id: "programacion" });
      }
      toast(T.toasts.enviado);
      setRedaccion(null);
    },
    guardarBorrador() {
      toast(T.toasts.borrador);
      setRedaccion(null);
    },
    cancelarRedaccion() {
      setRedaccion(null);
    },
  };

  return { state, pestana, setPestana, carpeta, sel, lista, busqueda, setBusqueda, redaccion, visor, setVisor, hoja, setHoja, h };
}

/** Hojas inferiores del correo en móvil: detalles del remitente, URL del enlace, carpetas y "más". */
function HojasMovil({ c }) {
  const { hoja, setHoja, h, sel, carpeta, state } = c;
  const cerrar = () => setHoja(null);
  return (
    <>
      <HojaInferior abierta={hoja?.tipo === "remitente"} onCerrar={cerrar} titulo={T.tarjeta.titulo} etiquetaCerrar={T.tarjeta.cerrar}>
        {hoja?.de ? <DetallesRemitente de={hoja.de} /> : null}
      </HojaInferior>
      <HojaInferior abierta={hoja?.tipo === "enlace"} onCerrar={cerrar} titulo={T.enlace.titulo} etiquetaCerrar={T.enlace.cancelar}>
        {hoja?.enlace ? (
          <div className="zc-hoja-enlace">
            <p className="zc-hoja-enlace__url">{hoja.enlace.url}</p>
            <div className="zc-hoja-enlace__botones">
              <button type="button" className="zc-hoja-btn" onClick={cerrar}>
                {T.enlace.cancelar}
              </button>
              <button type="button" className="zc-hoja-btn zc-hoja-btn--primario" onClick={() => h.clicEnlace(hoja.enlace)}>
                {T.enlace.abrir}
              </button>
            </div>
          </div>
        ) : null}
      </HojaInferior>
      <HojaInferior abierta={hoja?.tipo === "carpetas"} onCerrar={cerrar} titulo={T.carpetasTitulo} etiquetaCerrar={textos.escritorio.cerrar}>
        <nav className="zc-carpetas zc-carpetas--hoja" aria-label={T.carpetasTitulo}>
          <ListaCarpetas correos={state.correos} carpeta={carpeta} onCarpeta={h.carpeta} />
        </nav>
      </HojaInferior>
      <HojaInferior abierta={hoja?.tipo === "mas"} onCerrar={cerrar} titulo={T.botones.mas} etiquetaCerrar={textos.escritorio.cerrar}>
        {sel ? (
          <ul className="zc-hoja-menu">
            <li>
              <button type="button" onClick={() => { cerrar(); h.responderTodos(); }}>
                <Icono nombre="responder" /> {T.botones.responderTodos}
              </button>
            </li>
            {carpeta !== "spam" ? (
              <li>
                <button type="button" onClick={h.archivar}>
                  <Icono nombre="bandeja" /> {T.botones.archivo}
                </button>
              </li>
            ) : null}
            <li>
              <button type="button" onClick={() => { cerrar(); h.imprimir(); }}>
                <Icono nombre="imprimir" /> {T.botones.imprimir}
              </button>
            </li>
          </ul>
        ) : null}
      </HojaInferior>
    </>
  );
}

function CorreoMovil({ c }) {
  const { state, carpeta, sel, lista, redaccion, h, setHoja } = c;
  const carpetaDef = CARPETAS.find((x) => x.id === carpeta);
  const n = carpetaDef ? contarCarpeta(state.correos, carpetaDef) : 0;

  let contenido;
  if (redaccion) {
    contenido = <Redactar key={redaccion.modo + (redaccion.original?.id || "")} {...redaccion} archivos={state.archivos} movil onEnviar={h.enviar} onCancelar={h.cancelarRedaccion} />;
  } else if (sel) {
    const enSpam = carpeta === "spam";
    contenido = (
      <div className="zc-movil-detalle">
        <div className="zc-movil-barra">
          <button type="button" className="zc-movil-barra__btn zc-movil-barra__btn--icono" onClick={() => h.carpeta(carpeta)}>
            <Icono nombre="atras" tam={20} />
            <span>{T.volver}</span>
          </button>
          <span className="zc-movil-barra__titulo">{T.carpetas[carpeta]}</span>
        </div>
        <Lectura correo={sel} movil h={h} />
        <div className="zc-movil-acciones" role="toolbar" aria-label="Correo">
          <button type="button" onClick={h.responder}>
            <Icono nombre="responder" tam={20} />
            <span>{T.botones.responder}</span>
          </button>
          <button type="button" onClick={h.reenviar}>
            <Icono nombre="reenviar" tam={20} />
            <span>{T.botones.reenviar}</span>
          </button>
          <button type="button" onClick={h.eliminar} disabled={carpeta === "papelera"}>
            <Icono nombre="papelera" tam={20} />
            <span>{T.botones.eliminar}</span>
          </button>
          <button type="button" onClick={h.spam}>
            <Icono nombre={enSpam ? "bandeja" : "spam"} tam={20} />
            <span>{enSpam ? T.botones.noSpam : T.botones.spam}</span>
          </button>
          <button type="button" onClick={() => setHoja({ tipo: "mas" })} aria-haspopup="dialog">
            <Icono nombre="mas" tam={20} />
            <span>{T.botones.mas}</span>
          </button>
        </div>
      </div>
    );
  } else {
    contenido = (
      <div className="zc-movil-lista">
        <div className="zc-movil-cab">
          <button type="button" className="zc-movil-cab__btn" onClick={() => setHoja({ tipo: "carpetas" })} aria-haspopup="dialog" aria-label={T.carpetasTitulo}>
            <Icono nombre="menu" tam={22} />
          </button>
          <h2 className="zc-movil-cab__titulo">
            {T.carpetas[carpeta]}
            {n ? ` (${n})` : ""}
          </h2>
          <button type="button" className="zc-movil-cab__btn" onClick={h.nuevo} aria-label={T.nuevoMensaje}>
            <Icono nombre="borradores" tam={22} />
          </button>
        </div>
        <ListaMensajes correos={lista} seleccion={null} onSeleccionar={h.seleccionar} carpeta={carpeta} />
      </div>
    );
  }

  return (
    <div className="zc zc--movil">
      {contenido}
      <HojasMovil c={c} />
      <VisorDocumento doc={c.visor} onCerrar={() => c.setVisor(null)} />
    </div>
  );
}

function CorreoPC({ c }) {
  const { state, pestana, setPestana, carpeta, sel, lista, busqueda, setBusqueda, redaccion, h } = c;
  return (
    <div className="zc">
      <Cabecera pestana={pestana} onPestana={setPestana} busqueda={busqueda} onBusqueda={setBusqueda} usuario={state.jugador.nombreCompleto} />
      {pestana === 0 ? (
        <>
          <BarraHerramientas
            haySeleccion={!!sel}
            enSpam={carpeta === "spam"}
            enPapelera={carpeta === "papelera"}
            h={h}
            onNuevo={h.nuevo}
            redactando={!!redaccion}
            onCancelarRedaccion={h.cancelarRedaccion}
            onGuardarBorrador={h.guardarBorrador}
          />
          <div className="zc-cuerpo">
            <PanelCarpetas correos={state.correos} carpeta={carpeta} onCarpeta={h.carpeta} />
            {redaccion ? (
              <Redactar key={redaccion.modo + (redaccion.original?.id || "")} {...redaccion} archivos={state.archivos} onEnviar={h.enviar} onCancelar={h.cancelarRedaccion} />
            ) : (
              <>
                <ListaMensajes correos={lista} seleccion={sel?.id} onSeleccionar={h.seleccionar} carpeta={carpeta} />
                <Lectura correo={sel} h={h} />
              </>
            )}
          </div>
        </>
      ) : (
        <div className="zc-vacio-pestana">
          <p>{T.vacioPestana(T.pestanas[pestana])}</p>
        </div>
      )}
      <VisorDocumento doc={c.visor} onCerrar={() => c.setVisor(null)} />
    </div>
  );
}

export default function Correo() {
  const movil = useEsMovil();
  const c = useCorreo();
  return movil ? <CorreoMovil c={c} /> : <CorreoPC c={c} />;
}
