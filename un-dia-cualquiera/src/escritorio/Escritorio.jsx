import { useCallback, useEffect, useRef, useState } from "react";
import { useJuego } from "../estado/juego.jsx";
import { textos } from "../data/textos.js";
import { useEsMovil } from "../ui/useEsMovil.js";
import Icono from "../ui/Icono.jsx";
import HojaInferior from "../ui/HojaInferior.jsx";
import { fechaJuegoLarga } from "../util/tiempo.js";
import { sonar } from "../util/sonido.js";
import Ventana from "./Ventana.jsx";
import BarraTareas, { IndicadorRed, BotonSonido, Insignia, useCorreosNoLeidos } from "./BarraTareas.jsx";
import { ListaPendientes, Productividad, usePendientesResumen } from "./Pendientes.jsx";
import { ChatPanel, ChatAviso, ChatApp, CabeceraChat, useChatNoLeidos } from "./Chat.jsx";
import Toasts, { EstadoApp } from "./Toasts.jsx";
import CentroNotificaciones from "./CentroNotificaciones.jsx";
import FondoEscritorio from "./FondoEscritorio.jsx";
import Reloj, { BotonSeguir } from "./Reloj.jsx";
import ModalProteccion from "./ModalProteccion.jsx";
import PanelE7 from "./PanelE7.jsx";
import Tutorial from "./Tutorial.jsx";
import { LANZADORES } from "./apps.js";
import AppIcono from "./AppIcono.jsx";
import { irCarpeta } from "../estado/irCarpeta.js";
import Correo from "../apps/correo/Correo.jsx";
import Navegador from "../apps/navegador/Navegador.jsx";
import Documentos from "../apps/Documentos.jsx";
import MesaAyuda from "../apps/MesaAyuda.jsx";
import "./escritorio.css";

const T = textos.escritorio;

const APPS = { correo: Correo, navegador: Navegador, documentos: Documentos, mesa: MesaAyuda };

/** Sonidos de toasts y mensajes nuevos. */
function useSonidos() {
  const { state } = useJuego();
  const vistos = useRef(new Set());
  useEffect(() => {
    for (const x of [...state.toasts, ...state.chat]) {
      if (x.sonido && !vistos.current.has(x.id)) {
        vistos.current.add(x.id);
        sonar(x.sonido);
      }
    }
  }, [state.toasts, state.chat]);
  useEffect(() => {
    if (state.modal === "5B" || state.modal === "e7") sonar("alerta");
  }, [state.modal]);
}

/** Abre el chat en la conversación de un mensaje que lo pide (E7B). */
function useAbrirChat(abrir) {
  const { state } = useJuego();
  const ultimo = state.chat[state.chat.length - 1];
  useEffect(() => {
    if (ultimo?.abrirChat) abrir(ultimo.conv);
  }, [ultimo?.id]); // eslint-disable-line react-hooks/exhaustive-deps
}


function useAbrirDesdeToast() {
  const { dispatch } = useJuego();
  return (app, carpeta) => {
    dispatch({ type: "abrirApp", id: app });
    if (carpeta) {
      irCarpeta.actual = carpeta;
      irCarpeta.oyentes.forEach((f) => f(carpeta));
    }
  };
}

function ArchivosEscritorio() {
  const { state, dispatch } = useJuego();
  const bloqueados = state.efectos.locked;
  return (
    <ul className="escritorio__archivos" aria-label="Archivos">
      {T.archivosEscritorio.map((nombre) => (
        <li key={nombre}>
          <button
            type="button"
            className={`archivo-escritorio${bloqueados ? " is-bloqueado" : ""}`}
            onClick={() => {
              if (bloqueados) dispatch({ type: "toast", texto: `${nombre}.locked — No se puede abrir.`, extra: { tipo: "alerta" } });
              else if (nombre.endsWith(".docx")) dispatch({ type: "abrirApp", id: "documentos" });
              else dispatch({ type: "toast", texto: `${nombre}: vista previa no disponible en la simulación.`, extra: { estado: true } });
            }}
          >
            <span className="archivo-escritorio__img" aria-hidden="true">
              {bloqueados ? "🔒" : nombre.endsWith(".xlsx") ? "📊" : nombre.endsWith(".jpg") ? "🖼" : "📄"}
            </span>
            <span className="archivo-escritorio__nombre">{bloqueados ? `${nombre}.locked` : nombre}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function Escritorio({ tutorial, onFinTutorial }) {
  const movil = useEsMovil();
  const { state, dispatch } = useJuego();
  useSonidos();
  return (
    <>
      {movil ? <EscritorioMovil /> : <EscritorioPC />}
      {state.modo === "practica" ? <div className="marca-agua" aria-hidden="true">{textos.practica.marcaAgua}</div> : null}
      {state.efectos.camara ? (
        <div className="camara-luz" role="status">
          ● Cámara en uso
        </div>
      ) : null}
      <ModalProteccion />
      {tutorial ? (
        <Tutorial
          onFin={() => {
            dispatch({ type: "empezar" });
            onFinTutorial();
          }}
        />
      ) : null}
    </>
  );
}

function EscritorioPC() {
  const { state, dispatch } = useJuego();
  const [pendAbierto, setPendAbierto] = useState(true);
  const [chatAbierto, setChatAbierto] = useState(false);
  const [centro, setCentro] = useState(false);
  const [conv, setConv] = useState(null);
  const abrirChat = (c) => {
    setConv(c || null);
    setChatAbierto(true);
  };
  const cerrarCentro = useCallback(() => setCentro(false), []);
  const abrirDesdeToast = useAbrirDesdeToast();
  const { activa, abiertas } = state.apps;
  useAbrirChat(abrirChat);

  // En E7A el chat se cierra para no tapar la alerta.
  useEffect(() => {
    if (state.modal === "e7") {
      setChatAbierto(false);
      setCentro(false);
    }
  }, [state.modal]);

  // Al abrir una app, los pendientes se pliegan para no tapar la ventana.
  useEffect(() => {
    if (activa) setPendAbierto(false);
  }, [activa]);

  return (
    <div className="escritorio">
      <FondoEscritorio />
      <main className="escritorio__area">
        <div className="escritorio__columna">
          <ul className="escritorio__iconos" aria-label={T.inicio}>
            {LANZADORES.map((l) => (
              <li key={l.id}>
                <button type="button" className="icono-escritorio" onDoubleClick={() => dispatch({ type: "abrirApp", id: l.id })} onClick={() => dispatch({ type: "abrirApp", id: l.id })}>
                  <AppIcono id={l.id} icono={l.icono} tam={44} />
                  <span className="icono-escritorio__nombre">{T.apps[l.id]}</span>
                </button>
              </li>
            ))}
          </ul>
          <ArchivosEscritorio />
        </div>

        {abiertas.map((id) => {
          const App = APPS[id];
          const l = LANZADORES.find((x) => x.id === id);
          return (
            <div key={id} className="escritorio__ventana" hidden={activa !== id}>
              <Ventana id={id} icono={l.icono} onMinimizar={() => dispatch({ type: "minimizar" })} onCerrar={() => dispatch({ type: "cerrarApp", id })}>
                <App id={id} />
              </Ventana>
            </div>
          );
        })}
        <PanelE7 />
      </main>

      {chatAbierto ? <ChatPanel conv={conv} onConv={setConv} onCerrar={() => setChatAbierto(false)} /> : null}
      {/* Una sola pila de avisos abajo a la derecha (guion 12.1): chat y sistema no se tapan entre sí. */}
      <div className={`avisos${chatAbierto ? " con-chat" : ""}`} hidden={centro}>
        <Toasts onAbrirApp={abrirDesdeToast} oculto={centro} />
        {chatAbierto || centro ? null : <ChatAviso onAbrir={abrirChat} />}
      </div>
      <EstadoApp />
      {centro ? <CentroNotificaciones onCerrar={cerrarCentro} onAbrirApp={abrirDesdeToast} onAbrirChat={abrirChat} /> : null}

      <BarraTareas
        chatAbierto={chatAbierto}
        onAlternarChat={() => {
          setCentro(false);
          setChatAbierto((x) => !x);
        }}
        pendAbierto={pendAbierto}
        onAlternarPend={() => setPendAbierto((x) => !x)}
        centroAbierto={centro}
        onAlternarCentro={() => {
          setChatAbierto(false);
          setCentro((x) => !x);
        }}
      />
    </div>
  );
}

/** Móvil (< 768 px): "pantalla de teléfono" con una app a pantalla completa. */
function EscritorioMovil() {
  const { state, dispatch } = useJuego();
  const [hoja, setHoja] = useState(null); // "pendientes" | "chat" | null
  const [conv, setConv] = useState(null);
  const { hechos, total } = usePendientesResumen();
  const chatNoLeidos = useChatNoLeidos();
  const correoNoLeidos = useCorreosNoLeidos();
  const abrirDesdeToast = useAbrirDesdeToast();
  const { activa, abiertas } = state.apps;
  useAbrirChat((c) => {
    setConv(c || null);
    setHoja("chat");
  });
  useEffect(() => {
    if (activa) setHoja(null);
  }, [activa]);

  return (
    <div className="telefono">
      <header className="telefono__estado">
        <Reloj compacto />
        <BotonSeguir compacto />
        <IndicadorRed compacto />
        <div className="telefono__acciones">
          <button
            type="button"
            className="telefono__boton"
            data-ancla="pendientes"
            onClick={() => {
              setHoja("pendientes");
              dispatch({ type: "verPendientes" });
            }}
            aria-haspopup="dialog"
          >
            <span className="barra__icono">
              <Icono nombre="lista" tam={18} />
              <Insignia n={state.pendientesNuevos || 0} />
            </span>
            <span>
              {hechos}/{total}
            </span>
            <span className="sr-only">{T.pendientes.titulo}</span>
          </button>
          <button type="button" className="telefono__boton" data-ancla="chat" onClick={() => setHoja("chat")} aria-haspopup="dialog">
            <span className="barra__icono">
              <Icono nombre="chat" tam={18} />
              <Insignia n={chatNoLeidos} />
            </span>
            <span className="sr-only">Chat{chatNoLeidos ? ` (${chatNoLeidos})` : ""}</span>
          </button>
        </div>
      </header>

      <main className="telefono__pantalla">
        {activa ? null : (
          <div className="telefono__inicio">
            <p className="telefono__fecha">{fechaJuegoLarga()}</p>
            <p className="telefono__aviso">{T.movilAviso}</p>
            <section className="telefono__tarjeta" aria-label={T.pendientes.titulo}>
              <h2>{T.pendientes.titulo}</h2>
              <ListaPendientes />
              <Productividad />
            </section>
            <div className="telefono__sonido">
              <BotonSonido />
            </div>
          </div>
        )}
        {abiertas.map((id) => {
          const App = APPS[id];
          return (
            <section key={id} className="telefono__app" hidden={activa !== id} aria-label={T.tituloVentana[id]}>
              <App id={id} />
            </section>
          );
        })}
        <PanelE7 />
      </main>

      <Toasts onAbrirApp={abrirDesdeToast} />
      <EstadoApp />
      {hoja ? null : (
        <ChatAviso
          onAbrir={(c) => {
            setConv(c);
            setHoja("chat");
          }}
        />
      )}

      <nav className="telefono__nav" data-ancla="barra" aria-label={T.inicio}>
        {LANZADORES.map((l) => {
          const n = l.id === "correo" ? correoNoLeidos : 0;
          return (
            <button
              key={l.id}
              type="button"
              className={`telefono__lanzador${activa === l.id ? " is-activa" : ""}`}
              aria-pressed={activa === l.id}
              aria-label={n ? `${T.apps[l.id]} (${n})` : T.apps[l.id]}
              onClick={() => dispatch({ type: "lanzar", id: l.id })}
            >
              <span className="barra__icono">
                <Icono nombre={l.icono} tam={22} />
                <Insignia n={n} />
              </span>
              <span>{T.apps[l.id]}</span>
            </button>
          );
        })}
      </nav>

      <HojaInferior abierta={hoja === "pendientes"} onCerrar={() => setHoja(null)} titulo={T.pendientes.titulo} etiquetaCerrar={T.cerrar}>
        <ListaPendientes />
        <Productividad />
      </HojaInferior>
      <HojaInferior abierta={hoja === "chat"} onCerrar={() => setHoja(null)} titulo={T.chat.titulo} etiquetaCerrar={T.chat.cerrar} className="hoja--chat">
        {conv ? <CabeceraChat conv={conv} onConv={setConv} /> : null}
        <ChatApp conv={conv} onConv={setConv} />
      </HojaInferior>
    </div>
  );
}
