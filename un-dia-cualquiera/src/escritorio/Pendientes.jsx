import { useEffect, useRef, useState } from "react";
import { useJuego, animoDe, pendientesVisibles } from "../estado/juego.jsx";
import { pendientes, animoAndrea } from "../data/eventos.js";
import { textos } from "../data/textos.js";
import { formatearHora, horaAMinutos } from "../util/tiempo.js";
import { config } from "../data/config.js";
import Icono from "../ui/Icono.jsx";

const T = textos.escritorio.pendientes;

/** Productividad (guion 9.1): pendientes a tiempo − distracciones, sobre el total del día. */
export function productividadDe(state) {
  const hechos = pendientes.filter((p) => state.pendientes[p.id] === "hecho").length;
  const distracciones = Math.min(config.distraccionesMax, Object.keys(state.visitados).length);
  const puntos = Math.max(0, hechos - distracciones);
  return { hechos, total: pendientes.length, porcentaje: Math.round((puntos / pendientes.length) * 100) };
}

export function usePendientesResumen() {
  const { state } = useJuego();
  const visibles = pendientesVisibles(state);
  const { porcentaje } = productividadDe(state);
  const hechos = visibles.filter((p) => state.pendientes[p.id]).length;
  return { hechos, total: visibles.length, porcentaje };
}

/** Marcador de productividad (lo único que se ve durante el día, guion 8.3). */
export function Productividad() {
  const { state } = useJuego();
  const { porcentaje } = usePendientesResumen();
  const animo = animoAndrea[animoDe(state)];
  return (
    <div className="productividad">
      <div className="productividad__fila">
        <span>{textos.escritorio.productividad}</span>
        <strong>{porcentaje} %</strong>
      </div>
      <div className="productividad__barra" role="progressbar" aria-valuenow={porcentaje} aria-valuemin={0} aria-valuemax={100} aria-label={textos.escritorio.productividad}>
        <span style={{ width: `${porcentaje}%` }} />
      </div>
      <p className="productividad__animo">
        <span aria-hidden="true">{animo.emoji}</span> {textos.escritorio.animoJefa(animo.texto)}
      </p>
    </div>
  );
}

/** Lista de pendientes: cada ítem con ícono + texto de estado (no solo color). */
export function ListaPendientes() {
  const { state } = useJuego();
  return (
    <ul className="pendientes__lista">
      {pendientesVisibles(state).map((p) => {
        const e = state.pendientes[p.id];
        const vencido = !e && p.limite && state.minuto > horaAMinutos(p.limite);
        const estado = e === "hecho" ? T.hecho : e === "tarde" ? T.tarde : vencido ? T.vencido : T.porHacer;
        const clase = e === "hecho" ? " is-hecho" : e === "tarde" || vencido ? " is-tarde" : "";
        return (
          <li key={p.id} className={`pendientes__item${clase}`}>
            <Icono nombre={e ? "casillaOk" : "casilla"} tam={18} />
            <span className="pendientes__texto">
              {p.texto}
              {p.donde && !e ? <span className="pendientes__donde">{p.donde}</span> : null}
              {p.limite ? (
                <span className="pendientes__limite">
                  {e === "tarde" || vencido ? `⚠ ${estado} · ` : ""}
                  {T.antesDe(formatearHora(horaAMinutos(p.limite)))}
                </span>
              ) : null}
            </span>
            <span className="sr-only">{estado}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Resalta el botón unos segundos cuando cambia la lista (nuevo pendiente o uno completado), en vez de otra notificación. */
function useCambio(valor) {
  const [activo, setActivo] = useState(false);
  const antes = useRef(valor);
  useEffect(() => {
    if (antes.current === valor) return undefined;
    antes.current = valor;
    setActivo(true);
    const t = setTimeout(() => setActivo(false), 2600);
    return () => clearTimeout(t);
  }, [valor]);
  return activo;
}

/** Pendientes en la barra de tareas (guion 12.2): botón con el avance y panel que se abre hacia arriba. */
export default function PendientesWidget({ abierto, onAlternar }) {
  const { state, dispatch } = useJuego();
  const { hechos, total, porcentaje } = usePendientesResumen();
  const cambio = useCambio(`${hechos}/${total}`);
  const nuevos = state.pendientesNuevos || 0;
  // Al ver la lista, los pendientes nuevos dejan de marcarse.
  useEffect(() => {
    if (abierto && nuevos) dispatch({ type: "verPendientes" });
  }, [abierto, nuevos, dispatch]);
  return (
    <div className={`pendientes${abierto ? " is-abierto" : ""}${cambio ? " is-cambio" : ""}`} data-ancla="pendientes">
      <button type="button" className="pendientes__boton" aria-expanded={abierto} aria-controls="panel-pendientes" onClick={onAlternar} title={abierto ? T.plegar : T.desplegar}>
        <Icono nombre="lista" tam={18} />
        <span className="pendientes__titulo">{T.titulo}</span>
        <span className="pendientes__contador">
          {hechos}/{total}
        </span>
        {nuevos ? (
          <span className="pendientes__nuevo">
            {T.nuevos(nuevos)}
          </span>
        ) : null}
        <span className="pendientes__mini" aria-hidden="true">
          <span style={{ width: `${porcentaje}%` }} />
        </span>
        <Icono nombre="caretAbajo" tam={14} className="pendientes__caret" />
      </button>
      <div id="panel-pendientes" className="pendientes__panel" hidden={!abierto}>
        <h2 className="pendientes__panel-titulo">{T.titulo}</h2>
        <ListaPendientes />
        <Productividad />
      </div>
    </div>
  );
}
