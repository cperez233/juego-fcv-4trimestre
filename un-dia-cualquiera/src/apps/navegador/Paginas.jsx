/**
 * Páginas simuladas del navegador. Ningún dominio es un enlace real y ningún formulario
 * guarda ni envía lo que se escribe (docs/04_PLAN_TECNICO.md, reglas no negociables).
 */
import { useEffect, useRef, useState } from "react";
import { useJuego } from "../../estado/juego.jsx";
import { navegador as N } from "../../data/eventos.js";
import Icono from "../../ui/Icono.jsx";

const P = N.paginas;

/**
 * Campo de formulario falso: no guarda lo tecleado. Solo cuenta cuántos caracteres hay y
 * muestra puntos generados. Sin `name`, sin autocompletar: el gestor de contraseñas no tiene qué guardar.
 */
function CampoFalso({ etiqueta, id, onEscribir }) {
  const [n, setN] = useState(0);
  return (
    <label className="pf-campo" htmlFor={id}>
      <span>{etiqueta}</span>
      <input
        id={id}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-lpignore="true"
        data-1p-ignore="true"
        value={"•".repeat(n)}
        onChange={(e) => {
          const largo = e.target.value.length;
          setN(largo);
          if (largo) onEscribir();
        }}
      />
    </label>
  );
}

// ───────── Buscador (E5, E13, impresora, distracciones) ─────────
export function Buscador({ tab }) {
  const { dispatch } = useJuego();
  const [q, setQ] = useState(tab.q || "");
  const B = N.buscador;
  const consulta = tab.q ? B.consultas.find((c) => new RegExp(c.patron, "i").test(tab.q)) : null;

  const buscar = (texto) => {
    const t = texto.trim();
    if (t) dispatch({ type: "navMarcar", id: tab.id, datos: { q: t } });
  };

  return (
    <div className="pg-buscador">
      <form
        className={`pg-buscador__form${tab.q ? " is-arriba" : ""}`}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          buscar(q);
        }}
      >
        {tab.q ? null : <h2 className="pg-buscador__logo">{B.titulo}</h2>}
        <div className="pg-buscador__caja">
          <Icono nombre="buscar" tam={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={B.placeholder} aria-label={B.titulo} autoComplete="off" />
        </div>
        {!tab.q ? (
          <div className="pg-buscador__sugerencias">
            {B.sugerencias.map((sg) => (
              <button key={sg} type="button" className="pg-buscador__sugerencia" onClick={() => { setQ(sg); buscar(sg); }}>
                <Icono nombre="buscar" tam={14} /> {sg}
              </button>
            ))}
          </div>
        ) : null}
      </form>
      {tab.q ? (
        <div className="pg-resultados">
          {consulta ? (
            <>
              <p className="pg-resultados__n">{B.resultadosDe(consulta.total)}</p>
              <ol>
                {consulta.resultados.map((r) => (
                  <li key={r.id} className={`pg-resultado${r.patrocinado ? " is-patrocinado" : ""}`}>
                    {r.patrocinado ? <p className="pg-resultado__patro">{B.patrocinado}</p> : null}
                    <p className="pg-resultado__url">{r.url}</p>
                    <button type="button" className="pg-resultado__titulo" onClick={() => dispatch({ type: "abrirPagina", pagina: r.pagina, seccion: r.seccion, nueva: false })}>
                      {r.titulo}
                    </button>
                    <p className="pg-resultado__desc">{r.descripcion}</p>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <p className="pg-resultados__vacio">{B.sinResultados(tab.q)}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

// ───────── Acceso falso: 1B (E1) y "validar buzón" (14B) ─────────
export function LoginFalso({ tab }) {
  const { dispatch } = useJuego();
  const d = P[tab.pagina];
  const [escribio, setEscribio] = useState(false);
  const [falta, setFalta] = useState(false);
  const marcar = () => {
    if (!escribio) {
      setEscribio(true);
      dispatch({ type: "navMarcar", id: tab.id, datos: { escribio: true } });
    }
  };
  return (
    <div className="pg-login">
      <div className="pg-login__franja">
        <Icono nombre="correo" tam={22} /> {d.marca}
      </div>
      <form
        className="pg-login__caja"
        noValidate
        autoComplete="off"
        onSubmit={(e) => {
          e.preventDefault();
          if (tab.enviado) return;
          if (!escribio) {
            setFalta(true);
            return;
          }
          dispatch({ type: "navMarcar", id: tab.id, datos: { enviado: true } });
          dispatch({ type: "accion", clave: d.clave, evento: d.evento, accion: `${d.prefijo}escribir_credenciales` });
        }}
      >
        <h2>{d.encabezado}</h2>
        <CampoFalso id={`lf-u-${tab.pagina}`} etiqueta={d.usuario} onEscribir={marcar} />
        <CampoFalso id={`lf-c-${tab.pagina}`} etiqueta={d.contrasena} onEscribir={marcar} />
        {tab.enviado ? <p className="pg-login__error" role="alert">{d.error}</p> : null}
        {falta && !escribio ? <p className="pg-login__error" role="alert">Ingrese usuario y contraseña.</p> : null}
        <button type="submit" className="pg-login__btn">
          {d.boton}
        </button>
      </form>
    </div>
  );
}

// ───────── E4 — portal de beneficios falso ─────────
export function BeneficiosFalso({ tab }) {
  const { dispatch } = useJuego();
  const d = P["beneficios-falso"];
  const [quedan, setQuedan] = useState(d.contadorInicial);
  const escribio = useRef(false);
  useEffect(() => {
    const t = setInterval(() => setQuedan((n) => Math.max(3, n - 1)), 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="pg-benef">
      <header className="pg-benef__cab">
        <span className="pg-benef__logo" aria-hidden="true">
          ♥
        </span>
        {d.marca}
      </header>
      <div className="pg-benef__hero">
        <p className="pg-benef__contador">{d.contador(quedan)}</p>
        <h2>{d.encabezado}</h2>
        <p>{d.subtitulo}</p>
      </div>
      {tab.enviado ? (
        <p className="pg-benef__exito" role="status">
          {d.exito}
        </p>
      ) : (
        <form
          className="pg-benef__form"
          noValidate
          autoComplete="off"
          onSubmit={(e) => {
            e.preventDefault();
            if (!escribio.current) return;
            dispatch({ type: "navMarcar", id: tab.id, datos: { enviado: true } });
            dispatch({ type: "accion", clave: "E4", evento: "E4", accion: "llenar_formulario" });
          }}
        >
          {d.campos.map((c, i) => (
            <CampoFalso key={c} id={`bf-${i}`} etiqueta={c} onEscribir={() => (escribio.current = true)} />
          ))}
          <button type="submit" className="pg-benef__btn">
            {d.boton}
          </button>
        </form>
      )}
      <footer className="pg-benef__pie">{d.pie}</footer>
    </div>
  );
}

// ───────── Intranet oficial: inicio, beneficios (E4), capacitaciones (E8), formatos (E13) ─────────
function IntranetInicio({ d }) {
  return (
    <>
      <h2>{d.inicio.encabezado}</h2>
      <ul className="pg-intranet__noticias">
        {d.inicio.noticias.map(([t, x]) => (
          <li key={t}>
            <strong>{t}</strong>
            <span>{x}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function IntranetBeneficios({ d, tab }) {
  const { dispatch } = useJuego();
  const b = d.beneficios;
  return (
    <>
      <h2>{b.encabezado}</h2>
      <p>{b.texto}</p>
      <dl className="pg-intranet__datos">
        {b.datos.map(([k, v]) => (
          <div key={k}>
            <dt>{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      {tab.confirmado ? (
        <p className="pg-intranet__ok" role="status">
          {b.exito}
        </p>
      ) : (
        <button
          type="button"
          className="pg-intranet__btn"
          onClick={() => {
            dispatch({ type: "navMarcar", id: tab.id, datos: { confirmado: true } });
            dispatch({ type: "accion", clave: "E4", evento: "E4", accion: "intranet" });
          }}
        >
          {b.boton}
        </button>
      )}
      <p className="pg-intranet__nota">{b.nota}</p>
    </>
  );
}

function IntranetCapacitaciones({ d }) {
  const { state, dispatch } = useJuego();
  const c = d.capacitaciones;
  const [sesion, setSesion] = useState(0);
  const inscrito = state.registro.acciones.find((x) => x.clave === "E8" && x.accion === "inscribirse");
  return (
    <>
      <h2>{c.encabezado}</h2>
      <p>{c.texto}</p>
      {inscrito ? (
        <p className="pg-intranet__ok" role="status">
          {c.exito(c.sesiones[inscrito.detalle?.sesion ?? 0])}
        </p>
      ) : (
        <form
          className="pg-intranet__form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "accion", clave: "E8", evento: "E8", accion: "inscribirse", detalle: { sesion } });
          }}
        >
          <fieldset>
            <legend className="sr-only">{c.encabezado}</legend>
            {c.sesiones.map((x, i) => (
              <label key={x} className="pg-intranet__opcion">
                <input type="radio" name="sesion" checked={sesion === i} onChange={() => setSesion(i)} /> {x}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="pg-intranet__btn">
            {c.boton}
          </button>
        </form>
      )}
    </>
  );
}

function IntranetEncuesta({ d }) {
  const { state, dispatch } = useJuego();
  const e = d.encuesta;
  const [nota, setNota] = useState(3);
  const hecha = state.registro.acciones.some((x) => x.clave === "14A" && x.accion === "14A_encuesta");
  return (
    <>
      <h2>{e.encabezado}</h2>
      {hecha ? (
        <p className="pg-intranet__ok" role="status">
          {e.exito}
        </p>
      ) : (
        <form
          className="pg-intranet__form"
          onSubmit={(ev) => {
            ev.preventDefault();
            dispatch({ type: "accion", clave: "14A", evento: "E14", accion: "14A_encuesta", detalle: { nota } });
          }}
        >
          <fieldset>
            <legend>{e.pregunta}</legend>
            {e.opciones.map((x, i) => (
              <label key={x} className="pg-intranet__opcion">
                <input type="radio" name="nota" checked={nota === i} onChange={() => setNota(i)} /> {x}
              </label>
            ))}
          </fieldset>
          <button type="submit" className="pg-intranet__btn">
            {e.boton}
          </button>
        </form>
      )}
    </>
  );
}

function IntranetFormatos({ d }) {
  const { state, dispatch } = useJuego();
  const f = d.formatos;
  const v = f.vacaciones;
  const [abierto, setAbierto] = useState(null);
  const [desde, setDesde] = useState(0);
  const [hasta, setHasta] = useState(0);
  const enviado = state.registro.acciones.some((x) => x.clave === "E13" && x.accion === "intranet");
  return (
    <>
      <h2>{f.encabezado}</h2>
      <ul className="pg-intranet__formatos">
        {f.lista.map((x, i) => (
          <li key={x}>
            <span>📄 {x}</span>
            <button type="button" className="pg-intranet__link" onClick={() => setAbierto(i)}>
              {f.diligenciar}
            </button>
          </li>
        ))}
      </ul>
      {abierto === 0 ? (
        enviado ? (
          <p className="pg-intranet__ok" role="status">
            {v.exito}
          </p>
        ) : (
          <form
            className="pg-intranet__form"
            onSubmit={(e) => {
              e.preventDefault();
              dispatch({ type: "accion", clave: "E13", evento: "E13", accion: "intranet" });
              dispatch({ type: "reaccion", id: "vacaciones" });
            }}
          >
            <h3>{v.titulo}</h3>
            <div className="pg-intranet__fila">
              <label>
                {v.desde}
                <select value={desde} onChange={(e) => setDesde(Number(e.target.value))}>
                  {v.opcionesDesde.map((o, i) => (
                    <option key={o} value={i}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                {v.hasta}
                <select value={hasta} onChange={(e) => setHasta(Number(e.target.value))}>
                  {v.opcionesHasta.map((o, i) => (
                    <option key={o} value={i}>
                      {o}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button type="submit" className="pg-intranet__btn">
              {v.boton}
            </button>
          </form>
        )
      ) : abierto != null ? (
        <p className="pg-intranet__nota">{f.otro}</p>
      ) : null}
    </>
  );
}

/** Guion 15.2 — E15: reservar la sala de juntas. */
function IntranetReservas({ d }) {
  const { state, dispatch } = useJuego();
  const r = d.reservas;
  const [sala, setSala] = useState(0);
  const [dia, setDia] = useState(0);
  const [hora, setHora] = useState(1);
  const hecha = state.registro.acciones.find((x) => x.clave === "E15" && x.accion === "reservar");
  return (
    <>
      <h2>{r.encabezado}</h2>
      {hecha ? (
        <p className="pg-intranet__ok" role="status">
          {r.exito(r.salas[hecha.detalle?.sala ?? 0], r.dias[hecha.detalle?.dia ?? 0], r.horas[hecha.detalle?.hora ?? 1])}
        </p>
      ) : (
        <form
          className="pg-intranet__form"
          onSubmit={(e) => {
            e.preventDefault();
            dispatch({ type: "accion", clave: "E15", evento: "E15", accion: "reservar", detalle: { sala, dia, hora } });
          }}
        >
          <div className="pg-intranet__fila">
            <label>
              {r.sala}
              <select value={sala} onChange={(e) => setSala(Number(e.target.value))}>
                {r.salas.map((o, i) => (
                  <option key={o} value={i}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {r.dia}
              <select value={dia} onChange={(e) => setDia(Number(e.target.value))}>
                {r.dias.map((o, i) => (
                  <option key={o} value={i}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {r.hora}
              <select value={hora} onChange={(e) => setHora(Number(e.target.value))}>
                {r.horas.map((o, i) => (
                  <option key={o} value={i}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <button type="submit" className="pg-intranet__btn">
            {r.boton}
          </button>
        </form>
      )}
    </>
  );
}

export function Intranet({ tab }) {
  const { state, dispatch } = useJuego();
  const d = P.intranet;
  const seccion = tab.seccion || "inicio";
  const nombre = (state.jugador.nombre || state.jugador.nombreCompleto || "").split(" ")[0];
  return (
    <div className="pg-intranet">
      <header className="pg-intranet__cab">
        <strong>{d.marca}</strong>
        <nav aria-label={d.marca}>
          {d.menu.map((m) => (
            <button
              key={m.id}
              type="button"
              className={m.id === seccion ? "is-activo" : ""}
              aria-current={m.id === seccion ? "page" : undefined}
              onClick={() => dispatch({ type: "abrirPagina", pagina: "intranet", seccion: m.id, nueva: false })}
            >
              {m.texto}
            </button>
          ))}
        </nav>
        <span className="pg-intranet__hola">{d.hola(nombre)}</span>
      </header>
      <div className="pg-intranet__cuerpo">
        {seccion === "beneficios" ? <IntranetBeneficios d={d} tab={tab} /> : null}
        {seccion === "capacitaciones" ? <IntranetCapacitaciones d={d} /> : null}
        {seccion === "formatos" ? <IntranetFormatos d={d} /> : null}
        {seccion === "encuesta" ? <IntranetEncuesta d={d} /> : null}
        {seccion === "reservas" ? <IntranetReservas d={d} /> : null}
        {seccion === "inicio" ? <IntranetInicio d={d} /> : null}
      </div>
    </div>
  );
}

// ───────── E5 — página del programa ─────────
export function Programa({ tab }) {
  const { dispatch } = useJuego();
  const d = P.programa;
  return (
    <div className="pg-prog">
      <header className="pg-prog__cab">{d.marca}</header>
      <div className="pg-prog__hero">
        <h2>{d.encabezado}</h2>
        <p>{d.subtitulo}</p>
        <ul>
          {d.sellos.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <button
          type="button"
          className="pg-prog__btn"
          onClick={() => {
            dispatch({ type: "navMarcar", id: tab.id, datos: { descargado: true } });
            dispatch({ type: "descargar", clave: "E5", accion: "descargar_programa", archivo: d.archivo, origen: d.dominio });
          }}
        >
          ⬇ {d.boton}
        </button>
      </div>
      {tab.descargado ? (
        <div className="pg-descarga" role="status">
          <span aria-hidden="true">📦</span> {d.archivo} · {d.tamano} · {N.descarga.completa}
        </div>
      ) : null}
    </div>
  );
}

// ───────── E5 — extensión ─────────
export function Extension({ tab }) {
  const { state, dispatch } = useJuego();
  const d = P.extension;
  const [dialogo, setDialogo] = useState(false);
  const instalada = state.nav.extension;
  return (
    <div className="pg-ext">
      <header className="pg-ext__cab">
        <Icono nombre="etiqueta" tam={18} /> {d.marca}
      </header>
      <div className="pg-ext__ficha">
        <div className="pg-ext__icono" aria-hidden="true">
          PDF
        </div>
        <div>
          <h2>{d.nombre}</h2>
          <p className="pg-ext__autor">{d.autor}</p>
          <p>
            <span aria-hidden="true">{"★".repeat(d.estrellas)}{"☆".repeat(5 - d.estrellas)}</span> <span className="sr-only">{d.estrellas} de 5</span> · {d.usuarios}
          </p>
          <p>{d.descripcion}</p>
        </div>
        <button type="button" className="pg-ext__btn" disabled={instalada || tab.cancelado} onClick={() => setDialogo(true)}>
          {instalada ? "✓ Agregada" : d.boton}
        </button>
      </div>
      {dialogo ? (
        <div className="pg-ext__dialogo" role="dialog" aria-modal="true" aria-labelledby="ext-t">
          <h3 id="ext-t">{d.dialogo.titulo}</h3>
          <p>{d.dialogo.puede}</p>
          <p className="pg-ext__permiso">• {d.dialogo.permiso}</p>
          <div className="pg-ext__botones">
            <button
              type="button"
              onClick={() => {
                setDialogo(false);
                dispatch({ type: "navMarcar", id: tab.id, datos: { cancelado: true } });
                dispatch({ type: "extension", acepta: false });
              }}
            >
              {d.dialogo.cancelar}
            </button>
            <button
              type="button"
              className="is-primario"
              onClick={() => {
                setDialogo(false);
                dispatch({ type: "extension", acepta: true });
              }}
            >
              {d.dialogo.agregar}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ───────── E6 — "Tu conexión no es privada" ─────────
export function Certificado({ tab }) {
  const { dispatch } = useJuego();
  const a = P.certificado.alerta;
  const [avanzado, setAvanzado] = useState(false);
  return (
    <div className="pg-cert">
      <div className="pg-cert__caja">
        <span className="pg-cert__icono" aria-hidden="true">
          <Icono nombre="advertencia" tam={46} trazo={1.5} />
        </span>
        <h2>{a.titulo}</h2>
        <p>{a.texto}</p>
        <p className="pg-cert__codigo">{a.codigo}</p>
        <div className="pg-cert__botones">
          <button type="button" className="pg-cert__avanzado" aria-expanded={avanzado} onClick={() => setAvanzado((x) => !x)}>
            {avanzado ? a.ocultar : a.avanzado}
          </button>
          <button type="button" className="pg-cert__volver" onClick={() => dispatch({ type: "abrirPagina", pagina: "buscador", nueva: false })}>
            {a.volver}
          </button>
        </div>
        {avanzado ? (
          <div className="pg-cert__detalle">
            <p>{a.detalle}</p>
            <button
              type="button"
              className="pg-cert__continuar"
              onClick={() => {
                dispatch({ type: "navMarcar", id: tab.id, datos: { continuo: true } });
                dispatch({ type: "accion", clave: "E6", evento: "E6", accion: "continuar" });
                dispatch({ type: "abrirPagina", pagina: "catalogo", nueva: false });
              }}
            >
              {a.continuar}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Catalogo() {
  const d = P.catalogo;
  return (
    <div className="pg-catalogo">
      <header className="pg-catalogo__cab">{d.marca}</header>
      <h2>{d.encabezado}</h2>
      <ul>
        {d.productos.map((x) => (
          <li key={x}>
            <span aria-hidden="true">📦</span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Aviso de permisos anclado bajo la barra de dirección (E6). */
export function PromptPermisos({ tab }) {
  const { dispatch } = useJuego();
  const p = P.catalogo.permisos;
  const decidir = (accion) => {
    dispatch({ type: "navMarcar", id: tab.id, datos: { permisos: accion } });
    dispatch({ type: "accion", clave: "E6", evento: "E6", accion });
  };
  return (
    <div className="nav-permisos" role="dialog" aria-labelledby="perm-t">
      <p id="perm-t">{p.titulo}</p>
      <ul>
        {p.items.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <div className="nav-permisos__botones">
        <button type="button" onClick={() => decidir("bloquear")}>
          {p.bloquear}
        </button>
        <button type="button" className="is-primario" onClick={() => decidir("permitir")}>
          {p.permitir}
        </button>
      </div>
    </div>
  );
}

// ───────── E9 — video del grupo (distracción + falsa actualización) ─────────
export function Video({ tab }) {
  const { state, dispatch } = useJuego();
  const d = P.video;
  const [aviso, setAviso] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAviso(true), 2500);
    return () => clearTimeout(t);
  }, []);
  const clave = state.disparados.E9 ? "E9" : "EX";
  return (
    <div className="pg-video">
      <header className="pg-video__cab">
        <span aria-hidden="true">▶</span> {d.marca}
      </header>
      <div className="pg-video__grid">
        <div>
          <div className="pg-video__player">
            <span className="pg-video__perro" aria-hidden="true">
              🐕
            </span>
            <span className="pg-video__barra" aria-hidden="true">
              <span />
            </span>
            {aviso && !tab.avisoCerrado ? (
              <div className="pg-video__aviso" role="dialog" aria-labelledby="vid-av">
                <p id="vid-av" className="pg-video__aviso-t">
                  ⚠ {d.aviso.titulo}
                </p>
                <p>{d.aviso.texto}</p>
                <div className="pg-video__aviso-botones">
                  <button
                    type="button"
                    className="pg-video__actualizar"
                    onClick={() => {
                      dispatch({ type: "navMarcar", id: tab.id, datos: { avisoCerrado: true } });
                      dispatch({ type: "descargar", clave, archivo: d.aviso.archivo, origen: d.dominio });
                    }}
                  >
                    ⬇ {d.aviso.actualizar}
                  </button>
                  <button type="button" className="pg-video__cerrar" onClick={() => dispatch({ type: "navMarcar", id: tab.id, datos: { avisoCerrado: true } })}>
                    {d.aviso.cerrar}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
          <h2 className="pg-video__titulo">{d.video}</h2>
          <p className="pg-video__vistas">{d.vistas}</p>
        </div>
        <ul className="pg-video__rel" aria-label="Videos relacionados">
          {d.relacionados.map((r) => (
            <li key={r}>
              <span className="pg-video__mini" aria-hidden="true">
                ▶
              </span>
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ───────── Distracción: noticias con falso "tu equipo está infectado" ─────────
export function Noticias({ tab }) {
  const { dispatch } = useJuego();
  const d = P.noticias;
  const a = d.alerta;
  const [alerta, setAlerta] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setAlerta(true), 2200);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="pg-noticias">
      <header className="pg-noticias__cab">{d.marca}</header>
      <ul className="pg-noticias__lista">
        {d.titulares.map((t, i) => (
          <li key={t} className={i === 0 ? "is-principal" : ""}>
            <span className="pg-noticias__img" aria-hidden="true" />
            <strong>{t}</strong>
          </li>
        ))}
      </ul>
      {alerta && !tab.alertaResuelta ? (
        <div className="pg-scare" role="alertdialog" aria-labelledby="scare-t">
          <div className="pg-scare__caja">
            <p id="scare-t" className="pg-scare__t">
              {a.titulo}
            </p>
            <p>{a.texto}</p>
            <p className="pg-scare__tel">{a.telefono}</p>
            <div className="pg-scare__botones">
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "navMarcar", id: tab.id, datos: { alertaResuelta: true } });
                  dispatch({ type: "descargar", clave: "EX", archivo: a.archivo, origen: d.dominio });
                }}
              >
                {a.escanear}
              </button>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "navMarcar", id: tab.id, datos: { alertaResuelta: true } });
                  dispatch({ type: "accion", clave: "EX", evento: "EX", accion: "llamar" });
                  dispatch({ type: "toast", texto: a.llamada, extra: { tipo: "alerta" } });
                }}
              >
                📞 {a.llamar}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ───────── Distracción: tienda con "premio" que pide la tarjeta ─────────
export function Tienda({ tab }) {
  const { dispatch } = useJuego();
  const d = P.tienda;
  const pr = d.premio;
  const [premio, setPremio] = useState(false);
  const escribio = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => setPremio(true), 2000);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="pg-tienda">
      <header className="pg-tienda__cab">{d.marca}</header>
      <ul className="pg-tienda__grid">
        {d.productos.map(([n, v]) => (
          <li key={n}>
            <span className="pg-tienda__img" aria-hidden="true">
              🛒
            </span>
            <strong>{n}</strong>
            <span className="pg-tienda__precio">{v}</span>
          </li>
        ))}
      </ul>
      {premio && !tab.premioCerrado ? (
        <div className="pg-premio" role="dialog" aria-labelledby="premio-t">
          <div className="pg-premio__caja">
            <p id="premio-t" className="pg-premio__t">
              {pr.titulo}
            </p>
            <p>{pr.texto}</p>
            {tab.premioEnviado ? (
              <p className="pg-premio__ok" role="status">
                {pr.exito}
              </p>
            ) : (
              <form
                noValidate
                autoComplete="off"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!escribio.current) return;
                  dispatch({ type: "navMarcar", id: tab.id, datos: { premioEnviado: true } });
                  dispatch({ type: "accion", clave: "EX", evento: "EX", accion: "cupon_tarjeta" });
                }}
              >
                {pr.campos.map((c, i) => (
                  <CampoFalso key={c} id={`tp-${i}`} etiqueta={c} onEscribir={() => (escribio.current = true)} />
                ))}
                <button type="submit" className="pg-premio__btn">
                  {pr.boton}
                </button>
              </form>
            )}
            <button type="button" className="pg-premio__cerrar" onClick={() => dispatch({ type: "navMarcar", id: tab.id, datos: { premioCerrado: true } })}>
              {pr.cerrar}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ───────── E13 — anuncio de formatos (descarga un .exe) ─────────
export function FormatosAnuncio({ tab }) {
  const { dispatch } = useJuego();
  const d = P["formatos-anuncio"];
  const bajar = () => {
    dispatch({ type: "navMarcar", id: tab.id, datos: { descargado: true } });
    dispatch({ type: "descargar", clave: "E13", archivo: d.archivo, origen: d.dominio });
  };
  return (
    <div className="pg-formatos">
      <header className="pg-formatos__cab">{d.marca}</header>
      <div className="pg-formatos__grid">
        <div>
          <h2>{d.encabezado}</h2>
          <p>{d.texto}</p>
          <div className="pg-formatos__doc" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <button type="button" className="pg-formatos__chico" onClick={bajar}>
            {d.enlaceChico}
          </button>
        </div>
        <aside className="pg-formatos__anuncio">
          <p className="pg-formatos__pub">{d.publicidad}</p>
          <button type="button" className="pg-formatos__btn" onClick={bajar}>
            ⬇ {d.boton}
          </button>
          <p className="pg-formatos__peso">{d.tamano}</p>
        </aside>
      </div>
      {tab.descargado ? (
        <div className="pg-descarga" role="status">
          <span aria-hidden="true">📦</span> {d.archivo} · {d.tamano} · {N.descarga.completa}
        </div>
      ) : null}
    </div>
  );
}

// ───────── Guion 15.2 — E16: herramienta del "soporte técnico" falso ─────────
export function SoporteRemoto({ tab }) {
  const { dispatch } = useJuego();
  const d = P["soporte-remoto"];
  return (
    <div className="pg-soporte">
      <header className="pg-soporte__cab">
        <span aria-hidden="true">🛠</span> {d.marca}
      </header>
      <div className="pg-soporte__cuerpo">
        <h1>{d.encabezado}</h1>
        <p>{d.texto}</p>
        <ol>
          {d.pasos.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
        <button
          type="button"
          className="pg-soporte__btn"
          disabled={tab.descargo}
          onClick={() => {
            dispatch({ type: "navMarcar", id: tab.id, datos: { descargo: true } });
            dispatch({ type: "descargar", clave: "E16", archivo: d.archivo, origen: d.dominio });
          }}
        >
          ⬇ {d.boton}
        </button>
        <p className="pg-soporte__pie">{d.pie}</p>
      </div>
    </div>
  );
}

// ───────── Guion 15.2 — E17: "tu navegador está desactualizado" (pestaña que se abre sola) ─────────
export function ActualizarNavegador({ tab }) {
  const { dispatch } = useJuego();
  const d = P.actualizar;
  return (
    <div className="pg-actualizar" role="alert">
      <div className="pg-actualizar__caja">
        <p className="pg-actualizar__icono" aria-hidden="true">
          ⚠
        </p>
        <h1>{d.encabezado}</h1>
        <p>{d.texto}</p>
        <p className="pg-actualizar__version">{d.version}</p>
        <button
          type="button"
          className="pg-actualizar__btn"
          disabled={tab.descargo}
          onClick={() => {
            dispatch({ type: "navMarcar", id: tab.id, datos: { descargo: true } });
            dispatch({ type: "descargar", clave: "E17", archivo: d.archivo, origen: d.dominio });
          }}
        >
          {d.boton}
        </button>
        <p className="pg-actualizar__contador">{d.contador}</p>
      </div>
    </div>
  );
}
