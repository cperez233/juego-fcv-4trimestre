import { useState } from "react";
import { useJuego } from "../estado/juego.jsx";
import { textos } from "../data/textos.js";
import Icono from "../ui/Icono.jsx";
import Reloj, { BotonSeguir } from "./Reloj.jsx";
import { LANZADORES } from "./apps.js";
import AppIcono from "./AppIcono.jsx";
import { useChatNoLeidos } from "./Chat.jsx";
import PendientesWidget from "./Pendientes.jsx";
import { useNotifsNoLeidas } from "./CentroNotificaciones.jsx";
import { sonidoActivo, guardarSonido } from "../util/sonido.js";

const T = textos.escritorio;

export function useCorreosNoLeidos() {
  const { state } = useJuego();
  return state.correos.filter((c) => !c.leido && (c.carpeta === "entrada" || c.carpeta === "spam")).length;
}

export function Insignia({ n }) {
  if (!n) return null;
  return (
    <span className="insignia" aria-hidden="true">
      {n}
    </span>
  );
}

/** Indicador de red. Es un botón: desconectar la red es una de las reacciones de E7. */
export function IndicadorRed({ compacto = false }) {
  const { state, dispatch } = useJuego();
  const texto = state.red ? T.red.conectado : T.red.desconectado;
  return (
    <button
      type="button"
      className={`red${state.red ? "" : " is-off"}`}
      onClick={() => dispatch({ type: "red" })}
      aria-pressed={!state.red}
      title={state.red ? T.red.desconectar : T.red.reconectar}
      aria-label={`${texto}. ${state.red ? T.red.desconectar : T.red.reconectar}`}
    >
      <Icono nombre={state.red ? "red" : "redOff"} tam={18} />
      <span className={compacto ? "sr-only" : "red__texto"}>{texto}</span>
    </button>
  );
}

export function BotonSonido() {
  const [on, setOn] = useState(sonidoActivo);
  return (
    <button
      type="button"
      className="sonido"
      aria-pressed={on}
      aria-label={on ? T.sonido.silenciar : T.sonido.activar}
      title={on ? T.sonido.silenciar : T.sonido.activar}
      onClick={() => {
        guardarSonido(!on);
        setOn(!on);
      }}
    >
      <Icono nombre={on ? "volumen" : "silencio"} tam={17} />
    </button>
  );
}

/** Menú de inicio: las aplicaciones y quién está en el equipo. */
function MenuInicio({ onCerrar }) {
  const { state, dispatch } = useJuego();
  const M = T.menuInicio;
  return (
    <div className="inicio-menu" role="dialog" aria-label={M.titulo}>
      <p className="inicio-menu__buscar" aria-hidden="true">
        <Icono nombre="buscar" tam={14} /> {M.buscar}
      </p>
      <p className="inicio-menu__etq">{M.apps}</p>
      <ul className="inicio-menu__apps">
        {LANZADORES.map((l) => (
          <li key={l.id}>
            <button
              type="button"
              onClick={() => {
                dispatch({ type: "abrirApp", id: l.id });
                onCerrar();
              }}
            >
              <AppIcono id={l.id} icono={l.icono} tam={36} />
              <span>{T.apps[l.id]}</span>
            </button>
          </li>
        ))}
      </ul>
      <footer className="inicio-menu__pie">
        <span className="inicio-menu__yo">
          <span className="inicio-menu__avatar" aria-hidden="true">
            {state.jugador.nombreCompleto?.[0] || "U"}
          </span>
          {state.jugador.nombreCompleto}
        </span>
        <span className="inicio-menu__apagar" title={M.apagar} aria-hidden="true">
          ⏻
        </span>
      </footer>
    </div>
  );
}

/** Barra de tareas tipo Windows 11: clima y pendientes · inicio + apps + chat (centradas) · bandeja, hora y notificaciones. */
export default function BarraTareas({ chatAbierto, onAlternarChat, pendAbierto, onAlternarPend, centroAbierto, onAlternarCentro }) {
  const notifs = useNotifsNoLeidas();
  const { state, dispatch } = useJuego();
  const noLeidos = useCorreosNoLeidos();
  const chatNoLeidos = useChatNoLeidos();
  const { activa, abiertas } = state.apps;
  const [menu, setMenu] = useState(false);

  return (
    <footer className={`barra${menu ? " is-menu" : ""}`}>
      <div className="barra__izq">
        <div className="barra__clima" aria-hidden="true">
          <span className="barra__clima-ico">⛅</span>
          <span>
            <strong>{T.clima.temp}</strong>
            <small>{T.clima.texto}</small>
          </span>
        </div>
        <PendientesWidget abierto={pendAbierto} onAlternar={onAlternarPend} />
      </div>
      <nav className="barra__apps" aria-label={T.inicio}>
        <button type="button" className={`barra__inicio${menu ? " is-activa" : ""}`} aria-expanded={menu} aria-label={T.menuInicio.titulo} onClick={() => setMenu((x) => !x)}>
          <span className="barra__logo" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
          </span>
        </button>
        <div className="barra__lanzadores" data-ancla="barra">
          {LANZADORES.map((l) => {
            const n = l.id === "correo" ? noLeidos : 0;
            const nombre = T.apps[l.id];
            return (
              <button
                key={l.id}
                type="button"
                className={`barra__app${activa === l.id ? " is-activa" : ""}${abiertas.includes(l.id) ? " is-abierta" : ""}`}
                aria-pressed={activa === l.id}
                aria-label={n ? `${nombre} (${n})` : nombre}
                title={nombre}
                onClick={() => {
                  setMenu(false);
                  dispatch({ type: "lanzar", id: l.id });
                }}
              >
                <span className="barra__icono">
                  <AppIcono id={l.id} icono={l.icono} tam={28} />
                  <Insignia n={n} />
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={`barra__app barra__chat${chatAbierto ? " is-activa is-abierta" : ""}`}
          data-ancla="chat"
          aria-expanded={chatAbierto}
          aria-controls="panel-chat"
          aria-label={chatNoLeidos ? `${T.chat.abrir} (${chatNoLeidos})` : T.chat.abrir}
          title={T.apps.chat}
          onClick={onAlternarChat}
        >
          <span className="barra__icono">
            <AppIcono id="chat" icono="chat" tam={28} />
            <Insignia n={chatNoLeidos} />
          </span>
        </button>
      </nav>
      <div className="barra__sistema">
        <BotonSeguir compacto />
        <span className="barra__ocultos" title={T.iconosOcultos} aria-hidden="true">
          <Icono nombre="chevronArriba" tam={16} />
        </span>
        <div className="barra__rapidos">
          <IndicadorRed compacto />
          <BotonSonido />
          <span className="barra__bateria" title={T.bateria} aria-hidden="true">
            <Icono nombre="bateria" tam={18} />
          </span>
        </div>
        <button type="button" className={`barra__hora${centroAbierto ? " is-activa" : ""}`} onClick={onAlternarCentro} aria-expanded={centroAbierto} aria-label={T.centro.abrir(notifs)}>
          <Reloj />
          <span className="barra__campana">
            <Icono nombre="campana" tam={16} />
            <Insignia n={notifs} />
          </span>
        </button>
      </div>
      {menu ? <MenuInicio onCerrar={() => setMenu(false)} /> : null}
    </footer>
  );
}
