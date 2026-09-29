import { textos } from "../../data/textos.js";
import { fechaLarga } from "../../util/tiempo.js";
import TextoRico from "../../ui/TextoRico.jsx";
import Icono from "../../ui/Icono.jsx";
import { PildoraRemitente, EnlaceCorreo } from "./Revelar.jsx";
import Avatar from "./Avatar.jsx";

const T = textos.correo;

function Bloque({ b, correo, movil, h }) {
  switch (b.tipo) {
    case "p":
      return (
        <p>
          <TextoRico texto={b.texto} />
        </p>
      );
    case "pre":
      return <p className="zc-pre">{b.texto}</p>;
    case "firma":
      return (
        <p className="zc-firma">
          {b.lineas.map((l, i) => (
            <span key={i}>
              {l}
              <br />
            </span>
          ))}
        </p>
      );
    case "boton": {
      const enlace = correo.enlaces.find((e) => e.id === b.enlace);
      return (
        <p className="zc-cta-fila">
          <EnlaceCorreo
            enlace={enlace}
            texto={b.texto}
            movil={movil}
            onInspeccion={() => h.inspeccion("enlace")}
            onClic={() => h.clicEnlace(enlace)}
            onAbrirHoja={() => h.abrirHoja({ tipo: "enlace", enlace })}
          />
        </p>
      );
    }
    default:
      return null;
  }
}

function FilaAdjunto({ adj, h }) {
  return (
    <div className="zc-adjunto">
      <Icono nombre="adjunto" tam={16} className="zc-adjunto__icono" />
      <button type="button" className="zc-link" onClick={() => h.abrirAdjunto(adj)}>
        {adj.nombre}
      </button>
      <span className="zc-adjunto__tamano">({adj.tamano})</span>
      <button type="button" className="zc-link zc-link--sub" onClick={() => h.abrirAdjunto(adj)}>
        {T.adjunto.descargar}
      </button>
      <span aria-hidden="true">|</span>
      <button type="button" className="zc-link zc-link--sub" onClick={() => h.maletin(adj)}>
        {T.adjunto.maletin}
      </button>
      <span aria-hidden="true">|</span>
      <button type="button" className="zc-link zc-link--sub" onClick={() => h.eliminarAdjunto(adj)}>
        {T.adjunto.eliminar}
      </button>
    </div>
  );
}

/** Panel de lectura: asunto, encabezados en píldoras, adjuntos, cuerpo, aviso legal y pie. */
export default function Lectura({ correo, movil, h }) {
  if (!correo) {
    return (
      <div className="zc-lectura zc-lectura--vacia">
        <p>{T.lecturaVacia}</p>
      </div>
    );
  }

  const paraTexto = Array.isArray(correo.para) ? correo.para.join(", ") : correo.para;

  return (
    <article className="zc-lectura" aria-labelledby="zc-asunto">
      <header className="zc-lectura__titulo">
        <span className="zc-expandir" aria-hidden="true">
          ⊞
        </span>
        <h2 id="zc-asunto">{correo.asunto}</h2>
        <span className="zc-lectura__n">{T.mensajes(1)}</span>
      </header>

      <div className="zc-lectura__scroll">
        <div className="zc-msg">
          <div className="zc-msg__cabecera">
            <span className="zc-punto" aria-hidden="true" />
            <Avatar />
            <div className="zc-msg__campos">
              <div className="zc-campo">
                <span className="zc-campo__etq">{T.de}</span>
                <PildoraRemitente
                  de={correo.de}
                  movil={movil}
                  onInspeccion={() => h.inspeccion("remitente")}
                  onAbrirHoja={() => h.abrirHoja({ tipo: "remitente", de: correo.de })}
                />
              </div>
              <div className="zc-campo">
                <span className="zc-campo__etq">{T.para}</span>
                <span className="zc-pildora zc-pildora--estatica">{paraTexto}</span>
              </div>
            </div>
            <time className="zc-msg__fecha" dateTime={correo.fecha}>
              {fechaLarga(correo.fecha)}
            </time>
          </div>

          {correo.adjuntos.map((adj) => (
            <FilaAdjunto key={adj.id} adj={adj} h={h} />
          ))}

          <div className="zc-msg__cuerpo">
            {correo.cuerpo.map((b, i) => (
              <Bloque key={i} b={b} correo={correo} movil={movil} h={h} />
            ))}
            {correo.avisoLegal ? <p className="zc-aviso">{textos.avisoLegal}</p> : null}
          </div>

          {movil ? null : (
            <p className="zc-msg__pie">
              <span className="zc-pie__muerto">{T.pie[0]}</span>
              <span aria-hidden="true"> - </span>
              <button type="button" className="zc-pie__link" onClick={h.responder}>
                {T.pie[1]}
              </button>
              <span aria-hidden="true"> - </span>
              <button type="button" className="zc-pie__link" onClick={h.responderTodos}>
                {T.pie[2]}
              </button>
              <span aria-hidden="true"> - </span>
              <button type="button" className="zc-pie__link" onClick={h.reenviar}>
                {T.pie[3]}
              </button>
              <span aria-hidden="true"> - </span>
              <span className="zc-pie__muerto">{T.pie[4]}</span>
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
