import { useId, useMemo, useRef, useState } from "react";
import { config } from "../../data/config.js";
import { archivosAdjuntables } from "../../data/eventos.js";
import { textos } from "../../data/textos.js";
import { fechaLarga } from "../../util/tiempo.js";
import Icono from "../../ui/Icono.jsx";

const T = textos.correo.redactar;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function nombreDe(correo) {
  return config.contactos.find((c) => c.correo === correo)?.nombre;
}

function textoOriginal(o) {
  const cuerpo = o.cuerpo
    .map((b) => (b.tipo === "firma" ? b.lineas.join("\n") : b.texto?.replace(/\*\*/g, "")))
    .filter(Boolean)
    .join("\n\n");
  const para = Array.isArray(o.para) ? o.para.join(", ") : o.para;
  return `\n\n${T.originalSeparador}\nDe: "${o.de.nombre}" <${o.de.correo}>\n${textos.correo.para} ${para}\nEnviado: ${fechaLarga(o.fecha)}\n${textos.correo.asunto} ${o.asunto}\n\n${cuerpo}`;
}

export function valoresIniciales(modo, original) {
  if (!original) return { para: [], asunto: "", cuerpo: "" };
  const esResp = modo === "responder" || modo === "responderTodos";
  const prefijo = esResp ? T.prefijoRespuesta : T.prefijoReenvio;
  return {
    para: esResp ? [original.de.correo] : [],
    asunto: original.asunto.startsWith(prefijo) ? original.asunto : prefijo + original.asunto,
    cuerpo: textoOriginal(original),
  };
}

/**
 * Campo "Para:" con burbujas y autocompletar que solo ofrece los contactos del juego.
 * Patrón combobox de ARIA 1.2.
 */
function CampoPara({ para, setPara, error }) {
  const [texto, setTexto] = useState("");
  const [activo, setActivo] = useState(0);
  const [abierto, setAbierto] = useState(false);
  const idLista = useId();
  const input = useRef(null);

  const sugerencias = useMemo(() => {
    const q = texto.trim().toLowerCase();
    return config.contactos.filter(
      (c) => !para.includes(c.correo) && (!q || c.nombre.toLowerCase().includes(q) || c.correo.includes(q))
    );
  }, [texto, para]);

  const agregar = (correo) => {
    if (!para.includes(correo)) setPara([...para, correo]);
    setTexto("");
    setActivo(0);
  };

  const confirmarTexto = () => {
    const t = texto.trim().replace(/[,;]$/, "");
    if (!t) return false;
    if (abierto && sugerencias[activo]) {
      agregar(sugerencias[activo].correo);
      return true;
    }
    if (EMAIL.test(t)) {
      agregar(t.toLowerCase());
      return true;
    }
    return false;
  };

  const teclas = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAbierto(true);
      setActivo((i) => Math.min(sugerencias.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActivo((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" || e.key === "," || e.key === ";") {
      if (texto.trim()) {
        e.preventDefault();
        confirmarTexto();
      }
    } else if (e.key === "Tab" && texto.trim()) {
      if (confirmarTexto()) e.preventDefault();
    } else if (e.key === "Escape") {
      setAbierto(false);
    } else if (e.key === "Backspace" && !texto && para.length) {
      setPara(para.slice(0, -1));
    }
  };

  const mostrarLista = abierto && sugerencias.length > 0;

  return (
    <div className="zc-red__fila">
      <label className="zc-red__etq" htmlFor="zc-para">
        {T.para}
      </label>
      <div className={`zc-para${error ? " is-error" : ""}`} onClick={() => input.current?.focus()}>
        {para.map((c) => (
          <span key={c} className="zc-burbuja">
            {nombreDe(c) ? `${nombreDe(c)} <${c}>` : c}
            <button type="button" className="zc-burbuja__x" onClick={() => setPara(para.filter((x) => x !== c))} aria-label={T.quitar(c)}>
              <Icono nombre="cerrar" tam={12} />
            </button>
          </span>
        ))}
        <input
          ref={input}
          id="zc-para"
          className="zc-para__input"
          role="combobox"
          aria-expanded={mostrarLista}
          aria-controls={idLista}
          aria-autocomplete="list"
          aria-activedescendant={mostrarLista ? `${idLista}-${activo}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "zc-para-error" : undefined}
          autoComplete="off"
          spellCheck={false}
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setActivo(0);
          }}
          onFocus={() => setAbierto(true)}
          onBlur={() => setTimeout(() => setAbierto(false), 120)}
          onKeyDown={teclas}
        />
        <ul id={idLista} role="listbox" aria-label={T.sugerencias} className="zc-sugerencias" hidden={!mostrarLista}>
          {sugerencias.map((c, i) => (
            <li
              key={c.correo}
              id={`${idLista}-${i}`}
              role="option"
              aria-selected={i === activo}
              className={`zc-sugerencia${i === activo ? " is-activa" : ""}`}
              onMouseDown={(e) => {
                e.preventDefault();
                agregar(c.correo);
              }}
            >
              <strong>{c.nombre}</strong> <span>&lt;{c.correo}&gt;</span>
            </li>
          ))}
        </ul>
      </div>
      {error ? (
        <p id="zc-para-error" className="zc-red__error" role="alert">
          <Icono nombre="advertencia" tam={14} /> {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Redactar / Responder / Reenviar. Nada de lo escrito sale del navegador:
 * el mensaje "enviado" solo aparece en la carpeta Enviados de esta partida.
 */
export default function Redactar({ modo, original, onEnviar, movil, onCancelar, archivos }) {
  const inicial = useMemo(() => valoresIniciales(modo, original), [modo, original]);
  const [para, setPara] = useState(inicial.para);
  const [asunto, setAsunto] = useState(inicial.asunto);
  const [cuerpo, setCuerpo] = useState(inicial.cuerpo);
  const [error, setError] = useState(null);
  const [adjuntos, setAdjuntos] = useState(() => (modo === "reenviar" && original ? original.adjuntos : []));
  const [elegir, setElegir] = useState(false);
  const disponibles = [archivosAdjuntables.docx, ...(archivos?.pdf ? [archivosAdjuntables.pdf] : [])].filter((a) => !adjuntos.some((x) => x.id === a.id));

  const enviar = (e) => {
    e.preventDefault();
    const pendiente = document.getElementById("zc-para")?.value.trim();
    let destinatarios = para;
    if (pendiente) {
      if (!EMAIL.test(pendiente)) {
        setError(T.errorDireccion(pendiente));
        return;
      }
      destinatarios = [...para, pendiente.toLowerCase()];
    }
    if (!destinatarios.length) {
      setError(T.errorSinDestinatario);
      return;
    }
    onEnviar({ para: destinatarios, asunto, cuerpo, adjuntos });
  };

  return (
    <form id="zc-form-redactar" className="zc-redactar" onSubmit={enviar} noValidate aria-label={asunto || T.nuevo}>
      {movil ? (
        <div className="zc-movil-barra">
          <button type="button" className="zc-movil-barra__btn" onClick={onCancelar}>
            {T.cancelar}
          </button>
          <span className="zc-movil-barra__titulo">{asunto || T.nuevo}</span>
          <button type="submit" className="zc-movil-barra__btn zc-movil-barra__btn--primario">
            {T.enviar}
          </button>
        </div>
      ) : null}
      <div className="zc-red__campos">
        <CampoPara para={para} setPara={(p) => { setPara(p); setError(null); }} error={error} />
        <div className="zc-red__fila">
          <label className="zc-red__etq" htmlFor="zc-asunto-input">
            {T.asunto}
          </label>
          <input id="zc-asunto-input" className="zc-red__input" value={asunto} onChange={(e) => setAsunto(e.target.value)} autoComplete="off" />
        </div>
        <div className="zc-red__fila">
          <span className="zc-red__etq">{T.adjuntos}</span>
          <span className="zc-red__adjuntos">
            {adjuntos.map((a) => (
              <span key={a.id} className="zc-red__adjunto">
                <Icono nombre="clip" tam={13} /> {a.nombre} ({a.tamano})
                <button type="button" className="zc-burbuja__x" onClick={() => setAdjuntos(adjuntos.filter((x) => x.id !== a.id))} aria-label={T.quitarAdjunto(a.nombre)}>
                  <Icono nombre="cerrar" tam={12} />
                </button>
              </span>
            ))}
            <span className="zc-adjuntar">
              <button type="button" className="zc-btn" aria-expanded={elegir} onClick={() => setElegir((x) => !x)}>
                <Icono nombre="clip" tam={14} /> {T.adjuntar}
              </button>
              {elegir ? (
                <span className="zc-adjuntar__menu" role="group" aria-label={T.elegirArchivo}>
                  <span className="zc-adjuntar__titulo">{T.elegirArchivo}</span>
                  {disponibles.length ? (
                    disponibles.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className="zc-adjuntar__item"
                        onClick={() => {
                          setAdjuntos([...adjuntos, a]);
                          setElegir(false);
                        }}
                      >
                        <span aria-hidden="true">{a.tipo === "pdf" ? "📕" : "📄"}</span> {a.nombre} <span className="zc-adjuntar__tam">{a.tamano}</span>
                      </button>
                    ))
                  ) : (
                    <span className="zc-adjuntar__vacio">{T.sinArchivos}</span>
                  )}
                </span>
              ) : null}
            </span>
          </span>
        </div>
      </div>
      <label className="sr-only" htmlFor="zc-cuerpo">
        {T.nuevo}
      </label>
      <textarea id="zc-cuerpo" className="zc-red__cuerpo" value={cuerpo} onChange={(e) => setCuerpo(e.target.value)} autoFocus={modo !== "reenviar"} />
    </form>
  );
}
