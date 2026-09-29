import { useEffect, useRef } from "react";
import { useJuego } from "../estado/juego.jsx";
import { textos } from "../data/textos.js";
import Icono from "../ui/Icono.jsx";
import AppIcono from "./AppIcono.jsx";

// Guion 12.1: pocas notificaciones a la vez y más tiempo para leerlas; las que se van quedan en el centro de notificaciones.
const DURACION_MS = 7000;
const DURACION_ESTADO_MS = 3000;

const T = textos.escritorio;

/** Nombre de la app que manda el aviso (como en Windows: ícono + nombre arriba). */
export function origenDe(t) {
  if (t.app) return { app: t.app, nombre: T.tituloVentana[t.app] };
  if (t.origen === "pendientes" || t.tipo === "pendiente") return { app: "pendientes", nombre: T.pendientes.titulo };
  return { app: "sistema", nombre: T.notificaciones };
}

export function IconoOrigen({ app }) {
  if (app === "pendientes") return <Icono nombre="lista" tam={16} className="aviso__ico-sis" />;
  if (app === "sistema") return <Icono nombre="advertencia" tam={16} className="aviso__ico-sis" />;
  return <AppIcono id={app} icono={app} tam={16} />;
}

function Toast({ toast, onAbrirApp }) {
  const { dispatch } = useJuego();
  const o = origenDe(toast);
  const quitar = () => dispatch({ type: "quitarToast", id: toast.id });
  const cuerpo = (
    <>
      {toast.titulo ? <strong className="toast__titulo">{toast.titulo}</strong> : null}
      <span className="toast__cuerpo">
        {toast.tipo === "alerta" ? <Icono nombre="advertencia" tam={14} className="toast__icono" /> : null}
        {toast.texto}
      </span>
    </>
  );
  return (
    <li className={`toast${toast.tipo ? ` toast--${toast.tipo}` : ""}`}>
      <p className="toast__origen">
        <IconoOrigen app={o.app} />
        <span>{o.nombre}</span>
      </p>
      <button type="button" className="toast__x" onClick={quitar} aria-label={T.cerrar}>
        <Icono nombre="cerrar" tam={12} />
      </button>
      {toast.app ? (
        <button
          type="button"
          className="toast__boton"
          onClick={() => {
            onAbrirApp(toast.app, toast.carpeta);
            quitar();
          }}
        >
          {cuerpo}
        </button>
      ) : (
        <p className="toast__boton">{cuerpo}</p>
      )}
    </li>
  );
}

/** Vence cada aviso a su tiempo, aunque no alcance a mostrarse. */
function useVencer(lista, ms) {
  const { dispatch } = useJuego();
  const programados = useRef(new Set());
  useEffect(() => {
    for (const t of lista) {
      if (programados.current.has(t.id)) continue;
      programados.current.add(t.id);
      setTimeout(() => dispatch({ type: "quitarToast", id: t.id }), ms);
    }
  }, [lista, ms, dispatch]);
}

/** Notificaciones del sistema (abajo a la derecha en PC). Región viva para lectores de pantalla. */
export default function Toasts({ onAbrirApp, visibles = 2, oculto = false }) {
  const { state } = useJuego();
  const avisos = state.toasts.filter((t) => !t.estado);
  useVencer(avisos, DURACION_MS);
  return (
    <ol className="toasts" aria-live="polite" aria-label={T.notificaciones}>
      {oculto
        ? null
        : avisos.slice(-visibles).map((t) => (
            <Toast key={t.id} toast={t} onAbrirApp={onAbrirApp} />
          ))}
    </ol>
  );
}

/** Mensajes de estado de las apps ("Mensaje enviado", "1 mensaje marcado como spam"): breves y discretos. */
export function EstadoApp() {
  const { state } = useJuego();
  const estados = state.toasts.filter((t) => t.estado);
  useVencer(estados, DURACION_ESTADO_MS);
  const ultimo = estados[estados.length - 1];
  return (
    <div className="estado-app" role="status" aria-live="polite">
      {ultimo ? (
        <p key={ultimo.id} className={`estado-app__txt${ultimo.tipo === "ok" ? " is-ok" : ""}`}>
          {ultimo.tipo === "ok" ? <Icono nombre="check" tam={14} /> : null}
          {ultimo.texto}
        </p>
      ) : null}
    </div>
  );
}
