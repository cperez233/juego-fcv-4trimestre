import { useJuego, puedeSeguir } from "../estado/juego.jsx";
import { formatearHora, fechaJuegoCorta } from "../util/tiempo.js";
import Icono from "../ui/Icono.jsx";
import { textos } from "../data/textos.js";

const T = textos.escritorio;

/** Reloj del juego (7:00 a.m. → 1:00 p.m.). role="timer" no interrumpe a los lectores de pantalla. */
export default function Reloj({ compacto = false }) {
  const { state } = useJuego();
  const horaTxt = formatearHora(state.minuto);
  return (
    <span className={`reloj${state.adelanto ? " is-adelantando" : ""}`} data-ancla="reloj" role="timer" aria-label={`${T.reloj}: ${horaTxt}`}>
      <span className="reloj__hora">
        {state.adelanto ? <span className="reloj__ff" aria-hidden="true">⏩ </span> : null}
        {horaTxt}
      </span>
      {compacto ? null : <span className="reloj__fecha">{fechaJuegoCorta()}</span>}
    </span>
  );
}

/** ⏩ Seguir con mi día: atajo opcional; el día avanza solo (guion 11.1). */
export function BotonSeguir({ compacto = false }) {
  const { state, dispatch } = useJuego();
  const activo = puedeSeguir(state);
  // El día avanza solo (guion 11.1); el botón queda como atajo discreto, sin resaltarse.
  return (
    <button
      type="button"
      className="seguir"
      onClick={() => dispatch({ type: "seguir" })}
      disabled={!activo}
      title={T.seguirAyuda}
    >
      <Icono nombre="adelantar" tam={15} />
      <span className={compacto ? "sr-only" : "seguir__texto"}>{state.adelanto ? T.adelantando : T.seguir}</span>
    </button>
  );
}
