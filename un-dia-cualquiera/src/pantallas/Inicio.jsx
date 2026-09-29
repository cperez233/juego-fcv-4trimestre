/**
 * Título, "Cómo se juega", ingreso e intro (guion 8.1, P1 y P2).
 */
import { useEffect, useRef, useState } from "react";
import { textos } from "../data/textos.js";
import { config } from "../data/config.js";
import TextoRico from "../ui/TextoRico.jsx";
import { crearJugador } from "../util/jugador.js";
import { yaJugoLocal } from "../util/intentos.js";
import { validar } from "../api.js";

/** Timecode de cinta: HH:MM:SS;FF */
export function Timecode({ minuto, className = "" }) {
  const h = Math.floor(minuto / 60);
  const m = Math.floor(minuto % 60);
  const s = Math.floor((minuto * 60) % 60);
  return (
    <span className={`timecode ${className}`} aria-hidden="true">
      {String(h).padStart(2, "0")}:{String(m).padStart(2, "0")}:{String(s).padStart(2, "0")}
    </span>
  );
}

export function Titulo({ onJugar }) {
  const T = textos.titulo;
  const [como, setComo] = useState(false);
  if (como) return <ComoSeJuega onVolver={() => setComo(false)} onJugar={onJugar} />;
  return (
    <main className="capa capa--titulo">
      <div className="capa__grano" aria-hidden="true" />
      <div className="titulo">
        <p className="titulo__cinta">
          <span className="rec" aria-hidden="true">
            ● REC
          </span>
          <Timecode minuto={418} />
        </p>
        <h1 className="titulo__nombre revela">
          <span>Un día</span>
          <span>cualquiera</span>
        </h1>
        <p className="titulo__lema revela revela--2">{T.lema}</p>
        <p className="titulo__bajada revela revela--3">{T.bajada}</p>
        <div className="titulo__acciones revela revela--4">
          <button type="button" className="btn btn--ambar" onClick={onJugar} autoFocus>
            {T.jugar} <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="btn btn--linea" onClick={() => setComo(true)}>
            {T.comoSeJuega}
          </button>
        </div>
      </div>
      <p className="capa__firma">{T.firma}</p>
    </main>
  );
}

function ComoSeJuega({ onVolver, onJugar }) {
  const T = textos.comoSeJuega;
  const h = useRef(null);
  useEffect(() => h.current?.focus(), []);
  return (
    <main className="capa">
      <div className="capa__grano" aria-hidden="true" />
      <section className="como">
        <h1 ref={h} tabIndex={-1} className="capa__h revela">
          {T.titulo}
        </h1>
        <ol className="como__lista">
          {T.puntos.map(([ico, t], i) => (
            <li key={i} className="revela" style={{ animationDelay: `${120 + i * 90}ms` }}>
              <span className="como__ico" aria-hidden="true">
                {ico}
              </span>
              <span>{t}</span>
            </li>
          ))}
        </ol>
        <p className="como__dur">{T.duracion}</p>
        <div className="titulo__acciones">
          <button type="button" className="btn btn--ambar" onClick={onJugar}>
            {T.jugar} <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="btn btn--linea" onClick={onVolver}>
            {T.volver}
          </button>
        </div>
      </section>
    </main>
  );
}

export function Ingreso({ onIniciar, onPractica, onVolver }) {
  const T = textos.ingreso;
  const [v, setV] = useState({ nombre: "", apellido: "", cedula: "" });
  const [errores, setErrores] = useState({});
  const [aviso, setAviso] = useState(null); // "noAutorizado" | "yaParticipo"
  const [enviando, setEnviando] = useState(false);
  const jugador = crearJugador(v);
  const h = useRef(null);
  useEffect(() => h.current?.focus(), []);

  const validarCampos = () => {
    const e = {};
    if (!v.nombre.trim()) e.nombre = T.errores.nombre;
    if (!v.apellido.trim()) e.apellido = T.errores.apellido;
    const c = v.cedula;
    if (c.length < config.documento.min || c.length > config.documento.max) e.cedula = T.errores.documento;
    return e;
  };

  const enviar = async (ev) => {
    ev.preventDefault();
    const e = validarCampos();
    setErrores(e);
    setAviso(null);
    if (Object.keys(e).length) {
      document.getElementById(`ing-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    if (yaJugoLocal(v.cedula)) {
      setAviso("yaParticipo");
      return;
    }
    setEnviando(true);
    const r = await validar(v.cedula);
    setEnviando(false);
    if (r?.estado === "no_autorizado") return setAviso("noAutorizado");
    if (r?.estado === "ya_participo") return setAviso("yaParticipo");
    onIniciar(jugador);
  };

  const campo = (id, etiqueta, extra = {}) => (
    <div className={`campo${errores[id] ? " is-error" : ""}`}>
      <label htmlFor={`ing-${id}`}>{etiqueta}</label>
      <input
        id={`ing-${id}`}
        value={v[id]}
        onChange={(e) => setV({ ...v, [id]: extra.soloDigitos ? e.target.value.replace(/\D/g, "").slice(0, config.documento.max) : e.target.value })}
        onBlur={() => setErrores((x) => ({ ...x, [id]: validarCampos()[id] }))}
        aria-invalid={errores[id] ? true : undefined}
        aria-describedby={errores[id] ? `ing-${id}-err` : extra.ayuda ? `ing-${id}-ayuda` : undefined}
        {...extra.attrs}
      />
      {errores[id] ? (
        <p id={`ing-${id}-err`} className="campo__error">
          ⚠ {errores[id]}
        </p>
      ) : extra.ayuda ? (
        <p id={`ing-${id}-ayuda`} className="campo__ayuda">
          {extra.ayuda}
        </p>
      ) : null}
    </div>
  );

  return (
    <main className="capa">
      <div className="capa__grano" aria-hidden="true" />
      <form className="ingreso" onSubmit={enviar} noValidate>
        <h1 ref={h} tabIndex={-1} className="capa__h">
          {T.titulo}
        </h1>
        <p className="ingreso__instr">{T.instruccion}</p>
        <div className="ingreso__fila">
          {campo("nombre", T.nombre, { attrs: { autoComplete: "given-name" } })}
          {campo("apellido", T.apellido, { attrs: { autoComplete: "family-name" } })}
        </div>
        {campo("cedula", T.documento, { soloDigitos: true, ayuda: T.ayudaDocumento, attrs: { inputMode: "numeric", autoComplete: "off" } })}
        <p className="ingreso__correo" aria-live="polite">
          {v.nombre && v.apellido ? T.tuCorreo(jugador.correo) : " "}
        </p>

        <div className="ingreso__privacidad">
          <p>
            <span aria-hidden="true">🔒 </span>
            <TextoRico texto={T.privacidad} />
          </p>
          <p className="ingreso__ley">
            {T.ley} {T.urlPolitica ? <a href={T.urlPolitica}>{T.verPolitica}</a> : null}
          </p>
        </div>

        {aviso ? (
          <div className="ingreso__aviso" role="alert">
            <p>{T.errores[aviso]}</p>
            {aviso === "yaParticipo" ? (
              <button type="button" className="btn btn--linea" onClick={onPractica}>
                {T.errores.botonPractica}
              </button>
            ) : null}
          </div>
        ) : null}

        <p className="ingreso__intento">⚠ {T.unIntento}</p>
        <div className="titulo__acciones">
          <button type="submit" className="btn btn--ambar" disabled={enviando}>
            {enviando ? "…" : T.boton} <span aria-hidden="true">→</span>
          </button>
          <button type="button" className="btn btn--linea" onClick={onVolver}>
            {T.volver}
          </button>
        </div>
      </form>
    </main>
  );
}

export function Intro({ onFin }) {
  const T = textos.intro;
  const [n, setN] = useState(1);
  useEffect(() => {
    if (n > T.lineas.length) return undefined;
    const t = setTimeout(() => setN(n + 1), n === 1 ? 2200 : 3000);
    return () => clearTimeout(t);
  }, [n, T.lineas.length]);
  const terminado = n > T.lineas.length;
  return (
    <main className="capa capa--intro">
      <div className="capa__grano" aria-hidden="true" />
      <div className="intro" aria-live="polite">
        {T.lineas.slice(0, n).map((l, i) => (
          <p key={i} className={`intro__linea revela${i === 0 ? " intro__linea--hora" : ""}${i === T.lineas.length - 1 ? " intro__linea--final" : ""}`}>
            {l}
          </p>
        ))}
      </div>
      <button type="button" className={`btn ${terminado ? "btn--ambar" : "btn--linea"} intro__saltar`} onClick={onFin} autoFocus>
        {terminado ? T.continuar : T.saltar} <span aria-hidden="true">→</span>
      </button>
    </main>
  );
}
