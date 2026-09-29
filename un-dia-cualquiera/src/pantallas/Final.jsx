/**
 * Después del clic: revelación de los dos marcadores, rebobinado, resultado y cierre (P5–P8, guion 8.3–8.4).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { textos } from "../data/textos.js";
import { rebobinado as RB, cadenas, e7 as E7, repaso as RP } from "../data/eventos.js";
import { perfiles, puntosDebiles } from "../data/perfiles.js";
import { config } from "../data/config.js";
import { seleccionarTarjetas, cadenaDomino } from "../engine/rebobinado.js";
import { repasoPuntos } from "../engine/repaso.js";
import { formatearHora, horaAMinutos } from "../util/tiempo.js";
import { sonar } from "../util/sonido.js";
import { Timecode } from "./Inicio.jsx";

const reducido = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Número que cuenta hasta su valor (quieto si hay movimiento reducido). */
function Contador({ valor, ms = 1100 }) {
  const [v, setV] = useState(() => (reducido() ? valor : 0));
  useEffect(() => {
    if (reducido()) return setV(valor);
    let raf;
    const t0 = performance.now();
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / ms);
      setV(Math.round(valor * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(paso);
    };
    raf = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(raf);
  }, [valor, ms]);
  return v;
}

/** 581000 → "9 min 41 s" */
function duracion(ms) {
  const t = Math.round(ms / 1000);
  return `${Math.floor(t / 60)} min ${String(t % 60).padStart(2, "0")} s`;
}

const ORDEN_RIESGO = ["bajo", "medio", "alto", "critico"];

function MedidorRiesgo({ nivel, visible }) {
  const T = textos.revelacion;
  const i = ORDEN_RIESGO.indexOf(nivel);
  return (
    <div className={`riesgo${visible ? " is-visible" : ""}`}>
      <ol className="riesgo__escala">
        {ORDEN_RIESGO.map((n, j) => (
          <li key={n} className={`riesgo__tramo riesgo__tramo--${n}${j <= i ? " is-lleno" : ""}${j === i ? " is-actual" : ""}`} style={{ transitionDelay: `${j * 280}ms` }}>
            <span>{T.niveles[n]}</span>
          </li>
        ))}
      </ol>
      <p className="riesgo__texto">
        {T.riesgo}: <strong>{T.niveles[nivel]}</strong>
      </p>
    </div>
  );
}

export function Revelacion({ resultado, productividad, onSeguir }) {
  const T = textos.revelacion;
  const [fase, setFase] = useState(reducido() ? 5 : 0);
  useEffect(() => {
    if (fase >= 5) return undefined;
    const t = setTimeout(() => setFase(fase + 1), [1600, 1700, 1900, 2300, 1400][fase]);
    return () => clearTimeout(t);
  }, [fase]);
  const boton = useRef(null);
  useEffect(() => {
    if (fase >= 5) boton.current?.focus();
  }, [fase]);

  return (
    <main className="capa capa--revelacion">
      <div className="capa__grano" aria-hidden="true" />
      <div className="revelacion" aria-live="polite">
        <p className="revelacion__fin revela">
          <Timecode minuto={780} /> {T.fin}
        </p>
        <p className="revelacion__decisiones revela revela--2">{T.decisiones}</p>

        {fase >= 1 ? (
          <div className="marcador revela">
            <p className="marcador__etq">{T.productividad}</p>
            <p className="marcador__valor">
              <Contador valor={productividad} /> %
            </p>
            <div className="marcador__barra" aria-hidden="true">
              <span style={{ width: `${productividad}%` }} />
            </div>
          </div>
        ) : null}

        {fase >= 2 ? <p className="revelacion__giro revela">{T.giro}</p> : null}

        {fase >= 3 ? (
          <div className="marcador marcador--riesgo revela">
            <p className="marcador__etq">{T.riesgo}</p>
            <MedidorRiesgo nivel={resultado.riesgo.nivel} visible={fase >= 3} />
          </div>
        ) : null}

        {fase >= 4 ? <p className="revelacion__remate revela">{T.remate}</p> : null}
        {fase >= 5 ? (
          <button ref={boton} type="button" className="btn btn--ambar revela" onClick={onSeguir}>
            ⏪ {T.ver}
          </button>
        ) : (
          <button type="button" className="btn btn--fantasma revelacion__saltar" onClick={() => setFase(5)}>
            {textos.intro.saltar}
          </button>
        )}
      </div>
    </main>
  );
}

// ───────── Rebobinado ─────────

function sustituir(texto, correo, t) {
  return texto.replace("{correo}", correo).replace("{t}", t != null ? `${Math.round(t / 1000)} s` : "—");
}

function tarjetaDe(item) {
  const T = textos.rebobinado;
  // Guion 10.3: distracciones y pendientes también se rebobinan.
  if (item.tipo === "distraccion") return RB.distracciones.tarjetas[item.sitio] || null;
  if (item.tipo === "tarde") {
    const h = formatearHora(horaAMinutos(item.pendiente.limite));
    return {
      hiciste: T.tardeHiciste(item.pendiente.texto, h),
      paso: T.tardePaso,
      frase: T.frasePendientes,
      pantalla: { app: "lista", items: [item.pendiente.texto], senal: `⏱ ${T.tardeLimite(h)}` },
      otroLado: { tipo: "neutral", titulo: T.tuDia, lineas: [T.tardeLinea] },
    };
  }
  if (item.tipo === "sinHacer") {
    return {
      hiciste: T.sinHacerTitulo,
      paso: T.sinHacerTexto,
      frase: T.frasePendientes,
      pantalla: { app: "lista", items: item.lista.map((p) => p.texto), senal: T.sinHacerSenal(item.lista.length) },
      otroLado: { tipo: "neutral", titulo: T.tuDia, lineas: [T.sinHacerLinea(item.lista.length)] },
    };
  }
  const datos = RB[item.id];
  if (!datos) return null;
  const clave = item.id === "E7" && item.version === "B" ? `B_${item.accion}` : item.accion;
  return datos.tarjetas[clave] || null;
}

/** Miniatura de tu pantalla con la señal marcada (contorno + 🔍 + texto, no solo color). */
function MiniPantalla({ p }) {
  if (!p) return null;
  const senal = (
    <p className={`mini__senal${p.legitimo ? " is-ok" : ""}`}>
      <span aria-hidden="true">🔍 </span>
      {p.senal}
    </p>
  );
  if (p.app === "correo") {
    const [usuario, dominio] = p.de.split("@");
    return (
      <div className={`mini mini--correo${p.legitimo ? " is-ok" : ""}`}>
        <div className="mini__franja">Correo FCV</div>
        <p className="mini__asunto">{p.asunto}</p>
        <p className="mini__de">
          De: {usuario}@<mark className="mini__marca">{dominio}</mark>
        </p>
        {senal}
      </div>
    );
  }
  if (p.app === "navegador") {
    return (
      <div className={`mini mini--nav${p.legitimo ? " is-ok" : ""}`}>
        <p className={`mini__dir${p.noSeguro ? " is-mal" : ""}`}>
          <mark className="mini__marca">{p.noSeguro ? "⚠ No seguro" : "🔒"} | {p.url}</mark>
        </p>
        <p className="mini__titulo">{p.titulo}</p>
        {senal}
      </div>
    );
  }
  if (p.app === "lista") {
    return (
      <div className="mini mini--lista">
        <div className="mini__franja">📝 {textos.escritorio.pendientes.titulo}</div>
        <ul className="mini__lista">
          {p.items.map((x) => (
            <li key={x}>☐ {x}</li>
          ))}
        </ul>
        {senal}
      </div>
    );
  }
  if (p.app === "chat") {
    return (
      <div className="mini mini--chat">
        <div className="mini__franja">Chat · {p.de}</div>
        <p className="mini__burbuja">
          <mark className="mini__marca">{p.texto}</mark>
        </p>
        {senal}
      </div>
    );
  }
  if (p.app === "alerta" || p.app === "extension") {
    return (
      <div className="mini mini--alerta">
        <p className="mini__titulo">
          <span aria-hidden="true">⚠ </span>
          <mark className="mini__marca">{p.titulo}</mark>
        </p>
        {p.texto ? <p>{p.texto}</p> : null}
        {senal}
      </div>
    );
  }
  return (
    <div className="mini">
      <p className="mini__titulo">{p.titulo}</p>
      {senal}
    </div>
  );
}

function OtroLado({ o, correo, t }) {
  if (!o) return null;
  return (
    <div className={`otro otro--${o.tipo}`}>
      <p className="otro__titulo">{o.titulo}</p>
      <ul>
        {o.lineas.map((l, i) => (
          <li key={i} style={{ animationDelay: `${300 + i * 260}ms` }}>
            {sustituir(l, correo, t)}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Domino({ cadena }) {
  const T = textos.rebobinado;
  if (!cadena) return null;
  return (
    <div className="domino">
      <ol className="domino__pasos">
        {cadena.pasos.map((p, i) => (
          <li key={p} className="revela" style={{ animationDelay: `${i * 220}ms` }}>
            {p}
          </li>
        ))}
        {cadena.cortada ? (
          <li className="domino__corte revela" style={{ animationDelay: `${cadena.pasos.length * 220}ms` }}>
            {T.cortada(Math.round((cadena.tReaccionMs ?? 0) / 1000))}
          </li>
        ) : (
          <li className="domino__sin revela" style={{ animationDelay: `${cadena.pasos.length * 220}ms` }}>
            {T.sinCortar}
          </li>
        )}
      </ol>
    </div>
  );
}

/**
 * Cinta (guion 9.8): el timecode corre desde `desde` hasta `hasta` (⏪ si va hacia atrás, ⏩ si va hacia adelante),
 * frena, suena el STOP y la imagen queda congelada un instante. Luego onFin.
 */
function Cinta({ desde, hasta, onFin }) {
  const [m, setM] = useState(desde);
  const [fase, setFase] = useState("corre"); // "corre" | "stop"
  const atras = hasta < desde;
  useEffect(() => {
    if (reducido()) {
      onFin();
      return undefined;
    }
    let raf;
    let t;
    const dur = Math.max(900, Math.min(1900, 700 + Math.abs(desde - hasta) * 5));
    const t0 = performance.now();
    sonar("cinta");
    const paso = (ahora) => {
      const p = Math.min(1, (ahora - t0) / dur);
      // Arranca rápido y frena al final (ease-out cúbico).
      setM(desde + (hasta - desde) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(paso);
      else {
        setFase("stop");
        sonar("stop");
        t = setTimeout(onFin, 750);
      }
    };
    raf = requestAnimationFrame(paso);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className={`rebobinar is-${fase}`} aria-hidden="true">
      <span className="rebobinar__icono">{fase === "stop" ? "■ STOP" : atras ? "⏪" : "⏩"}</span>
      <Timecode minuto={m} className="rebobinar__tc" />
      <div className="rebobinar__lineas" />
      {fase === "stop" ? <div className="rebobinar__congela" /> : null}
    </div>
  );
}

export function Rebobinado({ resultado, jugador, onFin }) {
  const T = textos.rebobinado;
  const ev = resultado.evaluacion;
  const items = useMemo(() => seleccionarTarjetas(ev).filter((x) => tarjetaDe(x)), [ev]);
  const cadena = useMemo(() => cadenaDomino(ev, resultado.etiquetaMasGrave, cadenas), [ev, resultado.etiquetaMasGrave]);
  const [i, setI] = useState(0);
  const minutoDe = (k) => (items[k] ? horaAMinutos(items[k].hora) : null);
  // Al entrar: la cinta corre de 13:00 hasta la primera decisión y frena (guion 9.8).
  const [cinta, setCinta] = useState(() => ({ desde: 780, hasta: minutoDe(0) ?? 420 }));
  const [dir, setDir] = useState(1);
  const titulo = useRef(null);
  const total = items.length + (cadena ? 1 : 0);

  useEffect(() => {
    if (!cinta) titulo.current?.focus();
  }, [i, cinta]);

  if (cinta) {
    return (
      <main className="capa capa--rebobinado">
        <Cinta key={`${cinta.desde}-${cinta.hasta}-${i}`} desde={cinta.desde} hasta={cinta.hasta} onFin={() => setCinta(null)} />
      </main>
    );
  }

  const ir = (d) => {
    const desde = minutoDe(i);
    const hasta = minutoDe(i + d);
    setDir(d);
    setI(i + d);
    // Entre tarjetas la cinta también corre y frena; la cadena final no lleva cinta.
    if (desde != null && hasta != null && desde !== hasta) setCinta({ desde, hasta });
  };
  const enDomino = cadena && i === items.length;
  const item = items[i];
  const tarjeta = item ? tarjetaDe(item) : null;
  const horaTarjeta = item ? formatearHora(horaAMinutos(item.hora)) : null;
  const ultimo = i >= total - 1;
  const tE7 = ev.eventos.E7.tReaccionMs;

  return (
    <main className="capa capa--rebobinado">
      <div className="capa__grano" aria-hidden="true" />
      <div className="rb">
        <header className="rb__cab">
          <p className="rb__titulo">⏪ {T.titulo}</p>
          {total ? <p className="rb__n">{T.tarjeta(Math.min(i + 1, total), total)}</p> : null}
          <button type="button" className="btn btn--fantasma" onClick={onFin}>
            {T.saltar}
          </button>
        </header>

        {total === 0 ? (
          <p className="rb__vacio">{T.sinTarjetas}</p>
        ) : enDomino ? (
          <section key="domino" className={`rb__tarjeta entra-${dir > 0 ? "der" : "izq"}`} aria-labelledby="rb-h">
            <h1 id="rb-h" ref={titulo} tabIndex={-1} className="rb__hora">
              {T.domino}
            </h1>
            <Domino cadena={cadena} />
            <p className="rb__frase">💬 {RB.E7.frase}</p>
          </section>
        ) : (
          <section key={item.id} className={`rb__tarjeta entra-${dir > 0 ? "der" : "izq"}${item.error ? " is-error" : " is-acierto"}`} aria-labelledby="rb-h">
            <p className="rb__estado">{item.error ? `✕ ${T.error}` : `✓ ${T.acierto}`}</p>
            <h1 id="rb-h" ref={titulo} tabIndex={-1} className="rb__hora">
              <Timecode minuto={horaAMinutos(item.hora)} /> <span>{horaTarjeta}</span>
            </h1>
            <p className="rb__hiciste">⏪ {tarjeta.hiciste}</p>
            <div className="rb__split">
              <div className="rb__lado">
                <p className="rb__lado-etq">{T.tuPantalla}</p>
                {tarjeta.pantalla ? <MiniPantalla p={tarjeta.pantalla} /> : <div className="mini"><p className="mini__titulo">{item.id === "E7" && item.version === "A" ? E7.consecuencias[resultado.etiquetaMasGrave]?.titulo : E7.B.mensaje.texto}</p></div>}
              </div>
              <div className="rb__lado">
                <p className="rb__lado-etq">{T.otroLado}</p>
                <OtroLado o={tarjeta.otroLado} correo={jugador.correo} t={tE7} />
              </div>
            </div>
            {tarjeta.senal ? (
              <p className="rb__senal">
                <strong>🔍 {T.senal}:</strong> {tarjeta.senal}
              </p>
            ) : null}
            <p className="rb__paso">
              <strong>{T.paso}:</strong> {tarjeta.paso}
            </p>
            <p className="rb__frase">💬 {tarjeta.frase}</p>
          </section>
        )}

        <nav className="rb__nav" aria-label="Tarjetas">
          <button type="button" className="btn btn--linea" onClick={() => ir(-1)} disabled={i === 0}>
            ← {T.anterior}
          </button>
          {ultimo || total === 0 ? (
            <button type="button" className="btn btn--ambar" onClick={onFin}>
              {T.verResumen} →
            </button>
          ) : (
            <button type="button" className="btn btn--ambar" onClick={() => ir(1)}>
              {T.siguiente} →
            </button>
          )}
        </nav>
      </div>
    </main>
  );
}

// ───────── Resultado ─────────

/** Dónde se fueron los puntos (guion 11.3): qué hiciste, qué era lo mejor y a qué error humano corresponde. */
function Repaso({ evaluacion }) {
  const filas = useMemo(() => (evaluacion ? repasoPuntos(evaluacion) : []), [evaluacion]);
  const [todas, setTodas] = useState(false);
  if (!evaluacion) return null;
  const ocultas = todas ? 0 : Math.max(0, filas.length - RP.visibles);
  const vistas = ocultas ? filas.slice(0, RP.visibles) : filas;
  return (
    <section className="repaso revela revela--2" aria-labelledby="repaso-titulo">
      <h2 id="repaso-titulo">{RP.titulo}</h2>
      <p className="repaso__intro">{filas.length ? RP.intro : RP.perfecto}</p>
      <ol className="repaso__lista">
        {vistas.map((f) => (
          <li key={f.id} className="repaso__fila">
            <div className="repaso__cab">
              <h3>{f.titulo}</h3>
              {/* Error (restó) en rojo; oportunidad sin aprovechar (sumó menos de lo posible) en neutro. */}
              {f.fueError ? (
                <span className="repaso__pts" aria-label={`Perdiste ${f.perdidos} ${f.perdidos === 1 ? "punto" : "puntos"}`}>
                  {RP.perdiste(f.perdidos)}
                </span>
              ) : (
                <span className="repaso__pts is-falto" aria-label={RP.faltoLargo(f.perdidos)}>
                  {RP.falto(f.perdidos)}
                </span>
              )}
            </div>
            <p className="repaso__error">
              {RP.errores[f.error]}
              {f.maximo > 0 ? <span className="repaso__obtuvo"> · {RP.obtuviste(f.obtuvo, f.maximo)}</span> : null}
            </p>
            {f.hiciste ? (
              <p>
                <strong>{RP.hicisteEtq}:</strong> {f.hiciste}
              </p>
            ) : null}
            {f.lista ? (
              <ul className="repaso__pendientes">
                {f.lista.map((p) => (
                  <li key={p.id}>
                    <strong>{p.texto}</strong> <span className="repaso__obtuvo">· {p.estado}</span>
                    <span className="repaso__mejor">{p.mejor}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="repaso__mejor">
                <strong>{RP.mejorEtq}:</strong> {f.mejor}
              </p>
            )}
          </li>
        ))}
      </ol>
      {ocultas || todas ? (
        <button type="button" className="repaso__mas" aria-expanded={todas} onClick={() => setTodas((x) => !x)}>
          {todas ? RP.verMenos : RP.verTodo(ocultas)}
        </button>
      ) : null}
    </section>
  );
}

export function Resultado({ resultado, jugador, productividad, pendientesHechos, pendientesTotal, onSeguir }) {
  const T = textos.resultado;
  const perfil = perfiles.find((p) => p.id === resultado.perfil);
  const debil = resultado.puntoDebil ? puntosDebiles[resultado.puntoDebil] : null;
  const h = useRef(null);
  useEffect(() => h.current?.focus(), []);
  return (
    <main className="capa capa--resultado">
      <div className="capa__grano" aria-hidden="true" />
      <article className="carta revela" aria-labelledby="carta-perfil">
        <header className="carta__cab">
          <span>{jugador.nombreCompleto}</span>
          <span>{textos.titulo.nombre}</span>
        </header>
        <div className="carta__puntaje">
          <p className="carta__etq">{T.puntaje}</p>
          <p className="carta__num" ref={h} tabIndex={-1} aria-label={`${T.puntaje}: ${resultado.puntaje} ${T.de(config.puntajeMaximo)}`}>
            <Contador valor={resultado.puntaje} ms={1400} />
            <span className="carta__max"> / {config.puntajeMaximo}</span>
          </p>
        </div>
        <div className="carta__perfil">
          <p className="carta__etq">{T.perfil}</p>
          <h1 id="carta-perfil">
            <span aria-hidden="true">{perfil.icono} </span>
            {perfil.nombre}
          </h1>
          <p className="carta__mensaje">“{perfil.mensaje}”</p>
        </div>
        <dl className="carta__datos">
          <div>
            <dt>{T.puntoDebil}</dt>
            <dd>{debil ? `${debil.icono} ${debil.nombre}` : T.sinPuntoDebil}</dd>
          </div>
          <div>
            <dt>{T.riesgo}</dt>
            <dd className={`carta__riesgo carta__riesgo--${resultado.riesgo.nivel}`}>{textos.revelacion.niveles[resultado.riesgo.nivel]}</dd>
          </div>
          <div>
            <dt>{T.productividad}</dt>
            <dd>
              {productividad} % · {T.pendientes(pendientesHechos, pendientesTotal)}
              {T.distracciones(resultado.distracciones)}
            </dd>
          </div>
          {resultado.duracionActivaMs != null ? (
            <div>
              <dt>{T.tiempo}</dt>
              <dd>{duracion(resultado.duracionActivaMs)}</dd>
            </div>
          ) : null}
        </dl>
        {debil ? <p className="carta__consejo">{debil.consejo}</p> : null}
        <p className="carta__pie">{resultado.modo === "practica" ? T.practica : T.registrado}</p>
      </article>
      <Repaso evaluacion={resultado.evaluacion} />
      <button type="button" className="btn btn--ambar carta__seguir" onClick={onSeguir}>
        {T.continuar} →
      </button>
    </main>
  );
}

export function Cierre({ onPractica, onInicio }) {
  const T = textos.cierre;
  const h = useRef(null);
  useEffect(() => h.current?.focus(), []);
  return (
    <main className="capa capa--cierre">
      <div className="capa__grano" aria-hidden="true" />
      <section className="cierre">
        <h1 ref={h} tabIndex={-1} className="cierre__preguntas revela">
          {T.preguntas}
        </h1>
        <p className="cierre__llamado revela revela--2">{T.llamado}</p>
        <ul className="cierre__canales revela revela--3">
          {T.canales.map((c) => (
            <li key={c.texto}>
              <span aria-hidden="true">{c.icono}</span>
              <span>
                <strong>{c.texto}</strong>
                {c.nota ? <span className="cierre__nota"> {c.nota}</span> : null}
              </span>
            </li>
          ))}
        </ul>
        <p className="cierre__lema revela revela--4">
          <em>{T.lema}</em> — {T.firma}
        </p>
        <div className="titulo__acciones revela revela--4">
          <button type="button" className="btn btn--ambar" onClick={onPractica}>
            {T.botonPractica}
          </button>
          <button type="button" className="btn btn--linea" onClick={onInicio}>
            {T.inicio}
          </button>
        </div>
      </section>
    </main>
  );
}
