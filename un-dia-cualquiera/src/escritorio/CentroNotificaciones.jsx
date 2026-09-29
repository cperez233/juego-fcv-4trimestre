/**
 * Centro de notificaciones (guion 12.1): como en Windows 11, al tocar la hora se abren los avisos del día
 * y el calendario. Así nada se pierde aunque la notificación se haya ido.
 */
import { useEffect, useRef } from "react";
import { useJuego } from "../estado/juego.jsx";
import { textos } from "../data/textos.js";
import { config } from "../data/config.js";
import { conversaciones } from "../data/eventos.js";
import { formatearHora, horaAMinutos, fechaJuegoLarga } from "../util/tiempo.js";
import Icono from "../ui/Icono.jsx";
import { origenDe, IconoOrigen } from "./Toasts.jsx";
import { Avatar } from "./Chat.jsx";

const T = textos.escritorio;
const C = T.centro;

function nombreConv(n) {
  const info = conversaciones[n.conv];
  const de = config.personas[n.de]?.nombre || n.de;
  return info?.grupo ? `${de} · ${info.nombre}` : info?.nombre || de;
}

/** Mes del juego (septiembre de 2026, empieza en martes), con el día de la jornada marcado. */
function Calendario() {
  const c = C.calendario;
  const celdas = [...Array(c.primerDia).fill(null), ...Array.from({ length: c.dias }, (_, i) => i + 1)];
  return (
    <section className="centro__cal" aria-label={c.mes}>
      <p className="centro__cal-fecha">{fechaJuegoLarga()}</p>
      <p className="centro__cal-mes">{c.mes}</p>
      <div className="centro__cal-grilla" aria-hidden="true">
        {c.semana.map((d, i) => (
          <span key={`s${i}`} className="centro__cal-sem">
            {d}
          </span>
        ))}
        {celdas.map((d, i) => (
          <span key={i} className={d === c.hoy ? "is-hoy" : ""}>
            {d || ""}
          </span>
        ))}
      </div>
    </section>
  );
}

export default function CentroNotificaciones({ onCerrar, onAbrirApp, onAbrirChat }) {
  const { state, dispatch } = useJuego();
  const ref = useRef(null);
  const lista = [...state.notifs].reverse();

  useEffect(() => {
    dispatch({ type: "leerNotifs" });
    ref.current?.focus();
    const esc = (e) => e.key === "Escape" && onCerrar();
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [dispatch, onCerrar]);

  const abrir = (n) => {
    if (n.tipo === "chat") onAbrirChat(n.conv);
    else if (n.app) onAbrirApp(n.app, n.carpeta);
    onCerrar();
  };

  return (
    <div className="centro" role="dialog" aria-label={C.titulo} ref={ref} tabIndex={-1}>
      <section className="centro__notifs">
        <header className="centro__cab">
          <h2>{C.titulo}</h2>
          {lista.length ? (
            <button type="button" className="centro__borrar" onClick={() => dispatch({ type: "borrarNotifs" })}>
              {C.borrarTodo}
            </button>
          ) : null}
        </header>
        {lista.length ? (
          <ul className="centro__lista">
            {lista.map((n) => {
              const esChat = n.tipo === "chat";
              const o = esChat ? { app: "chat", nombre: T.tituloVentana.chat } : origenDe(n);
              const accionable = esChat || n.app;
              const cuerpo = (
                <>
                  {esChat ? <Avatar id={n.conv} tam="chico" /> : null}
                  <span className="centro__txt">
                    {esChat || n.titulo ? <strong>{esChat ? nombreConv(n) : n.titulo}</strong> : null}
                    <span>{n.texto}</span>
                  </span>
                </>
              );
              return (
                <li key={n.id} className="centro__item">
                  <p className="centro__origen">
                    <IconoOrigen app={o.app} />
                    <span>{o.nombre}</span>
                    <span className="centro__hora">{formatearHora(horaAMinutos(n.hora))}</span>
                  </p>
                  {accionable ? (
                    <button type="button" className="centro__cuerpo" onClick={() => abrir(n)}>
                      {cuerpo}
                    </button>
                  ) : (
                    <p className="centro__cuerpo">{cuerpo}</p>
                  )}
                  <button type="button" className="centro__x" onClick={() => dispatch({ type: "borrarNotifs", id: n.id })} aria-label={C.quitar}>
                    <Icono nombre="cerrar" tam={12} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="centro__vacio">{C.vacio}</p>
        )}
      </section>
      <Calendario />
    </div>
  );
}

/** Campana de la barra: cuántas notificaciones hay sin ver. */
export function useNotifsNoLeidas() {
  const { state } = useJuego();
  return state.notifs.filter((n) => !n.leida).length;
}
