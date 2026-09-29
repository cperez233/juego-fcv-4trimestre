/**
 * Chat con conversaciones separadas (guion 9.3): Andrea, Julián, el grupo del área y números desconocidos.
 * Lista de conversaciones → conversación, igual en el panel del escritorio y en la hoja del celular.
 */
import { useEffect, useRef, useState } from "react";
import { useJuego, animoDe, sugerenciasDe } from "../estado/juego.jsx";
import { config } from "../data/config.js";
import { textos } from "../data/textos.js";
import { animoAndrea, conversaciones } from "../data/eventos.js";
import { formatearHora, horaAMinutos } from "../util/tiempo.js";
import Icono from "../ui/Icono.jsx";

const T = textos.escritorio.chat;

function iniciales(nombre) {
  return nombre
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

export function useChatNoLeidos() {
  const { state } = useJuego();
  return state.chat.filter((m) => !m.leido).length;
}

/** Avatar de una persona o conversación. */
export function Avatar({ id, animo, tam = "" }) {
  const c = conversaciones[id];
  const p = config.personas[id];
  const texto = c?.desconocido ? "?" : c?.grupo ? "ÁA" : iniciales((p || c).nombre);
  return (
    <span className={`chat__avatar chat__avatar--${id}${tam ? ` chat__avatar--${tam}` : ""}`} aria-hidden="true">
      {texto}
      {id === "andrea" && animo != null ? <span className="chat__animo">{animoAndrea[animo].emoji}</span> : null}
    </span>
  );
}

const nombreDe = (id) => config.personas[id]?.nombre || conversaciones[id]?.nombre || id;

/** Resumen de cada conversación con mensajes, de la más reciente a la más vieja. */
function useConversaciones() {
  const { state } = useJuego();
  const porConv = new Map();
  state.chat.forEach((m, i) => {
    const c = porConv.get(m.conv) || { id: m.conv, ultimo: null, i: -1, noLeidos: 0 };
    c.ultimo = m;
    c.i = i;
    if (!m.leido) c.noLeidos += 1;
    porConv.set(m.conv, c);
  });
  return [...porConv.values()].sort((a, b) => b.i - a.i);
}

function ListaConversaciones({ onAbrir }) {
  const { state } = useJuego();
  const convs = useConversaciones();
  const animo = animoDe(state);
  if (!convs.length) return <p className="chat__vacio">{T.sinMensajes}</p>;
  return (
    <ul className="chat__convs">
      {convs.map((c) => {
        const info = conversaciones[c.id];
        const prefijo = c.ultimo.de === "yo" ? `${T.tu}: ` : info?.grupo ? `${nombreDe(c.ultimo.de).split(" ")[0]}: ` : "";
        return (
          <li key={c.id}>
            <button type="button" className={`chat__conv${c.noLeidos ? " is-nueva" : ""}`} onClick={() => onAbrir(c.id)}>
              <Avatar id={c.id} animo={animo} />
              <span className="chat__conv-txt">
                <span className="chat__conv-fila">
                  <strong>{info?.nombre || nombreDe(c.id)}</strong>
                  <span className="chat__conv-hora">{formatearHora(horaAMinutos(c.ultimo.hora))}</span>
                </span>
                <span className="chat__conv-fila">
                  <span className="chat__conv-prev">
                    {prefijo}
                    {c.ultimo.texto}
                  </span>
                  {c.noLeidos ? (
                    <span className="chat__conv-n">
                      {c.noLeidos}
                      <span className="sr-only"> sin leer</span>
                    </span>
                  ) : null}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function TextoMensaje({ m }) {
  const { dispatch } = useJuego();
  if (!m.enlace) return m.texto;
  const [antes, despues] = m.texto.split(m.enlace.texto);
  return (
    <>
      {antes}
      <button type="button" className="chat__enlace" onClick={() => dispatch({ type: "abrirPagina", pagina: m.enlace.pagina, seccion: m.enlace.seccion })}>
        {m.enlace.texto}
      </button>
      {despues}
    </>
  );
}

function Conversacion({ conv }) {
  const { state, dispatch } = useJuego();
  const fin = useRef(null);
  const info = conversaciones[conv] || { nombre: nombreDe(conv) };
  const mensajes = state.chat.filter((m) => m.conv === conv);
  const n = mensajes.length;
  const animo = animoDe(state);
  const bloqueado = state.bloqueados[conv];
  const sugeridas = sugerenciasDe(state, conv);

  useEffect(() => {
    dispatch({ type: "leerChat", conv });
    fin.current?.scrollIntoView({ block: "end" });
  }, [n, conv, dispatch]);

  return (
    <div className="chat__hilo">
      {info.desconocido ? (
        <div className="chat__aviso-contacto" role="note">
          <p>
            <Icono nombre="advertencia" tam={14} /> {T.noContacto}
          </p>
          {bloqueado ? (
            <p className="chat__aviso-estado">✓ {bloqueado === "reportar" ? T.estadoReportado : T.estadoBloqueado}</p>
          ) : (
            <div className="chat__aviso-botones">
              <button type="button" className="chat__aviso-btn is-reportar" onClick={() => dispatch({ type: "contacto", conv, accion: "reportar" })}>
                {T.reportar}
              </button>
              <button type="button" className="chat__aviso-btn" onClick={() => dispatch({ type: "contacto", conv, accion: "bloquear" })}>
                {T.bloquear}
              </button>
            </div>
          )}
        </div>
      ) : null}
      <ol className="chat__lista">
        {mensajes.map((m) => {
          if (m.de === "yo") {
            return (
              <li key={m.id} className="chat__msg chat__msg--yo">
                <div className="chat__burbuja">
                  <p className="chat__texto">{m.texto}</p>
                  <p className="chat__hora">{formatearHora(horaAMinutos(m.hora))} ✓✓</p>
                </div>
              </li>
            );
          }
          const respondido = state.chatRespuestas[m.id];
          // Guion 16.1: las preguntas de un evento (la clave de Julián, el portal…) no se retiran aunque la misma persona
          // escriba otra cosa después. Solo las preguntas de ambiente ("¿cómo vas?") se reemplazan por la más nueva.
          const superado = !m.evento && mensajes.some((x) => x.de === m.de && x.opciones && mensajes.indexOf(x) > mensajes.indexOf(m));
          const expirado = (m.guion === "c-julian-7b" && state.e7?.resultado) || (m.expira && state.msReal > m.expira);
          const muestraOpciones = m.opciones && !respondido && !expirado && !superado && !bloqueado;
          return (
            <li key={m.id} className={`chat__msg chat__msg--otro chat__msg--${m.de}`}>
              <Avatar id={m.de} animo={animo} />
              <div className="chat__cuerpo-msg">
                <div className="chat__burbuja">
                  {info.grupo ? <p className="chat__autor">{nombreDe(m.de)}</p> : null}
                  <p className="chat__texto">
                    <TextoMensaje m={m} />
                  </p>
                  <p className="chat__hora">{formatearHora(horaAMinutos(m.hora))}</p>
                </div>
                {muestraOpciones ? (
                  <div className="chat__opciones" role="group" aria-label={`Responder a ${info.nombre}`}>
                    {m.opciones.map((o) => (
                      <button key={o.id} type="button" className="chat__opcion" onClick={() => dispatch({ type: "responderChat", id: m.id, opcion: o.id })}>
                        {o.texto}
                      </button>
                    ))}
                  </div>
                ) : m.opciones && !respondido && m.expira && expirado ? (
                  <p className="chat__expiro">{T.expiro}</p>
                ) : null}
              </div>
            </li>
          );
        })}
        <li ref={fin} aria-hidden="true" />
      </ol>
      <div className="chat__redactor">
        {sugeridas.length ? (
          <div className="chat__sugeridas" role="group" aria-label={T.sugerido}>
            {sugeridas.map((sg) => (
              <button key={sg.id} type="button" className="chat__opcion chat__opcion--propia" onClick={() => dispatch({ type: "iniciarChat", id: sg.id })}>
                {sg.texto}
              </button>
            ))}
          </div>
        ) : null}
        <p className="chat__entrada" aria-hidden="true">
          {T.escribir}
          <Icono nombre="enviados" tam={16} />
        </p>
      </div>
    </div>
  );
}

/** Chat completo: lista de conversaciones o una conversación abierta. */
export function ChatApp({ conv, onConv }) {
  if (!conv) return <ListaConversaciones onAbrir={onConv} />;
  return <Conversacion key={conv} conv={conv} />;
}

/** Cabecera del chat: título o, dentro de una conversación, volver + nombre. */
export function CabeceraChat({ conv, onConv, onCerrar }) {
  const { state } = useJuego();
  const info = conv ? conversaciones[conv] : null;
  const animo = animoAndrea[animoDe(state)];
  return (
    <header className="chat__cabecera">
      {conv ? (
        <>
          <button type="button" className="chat__volver" onClick={() => onConv(null)} aria-label={T.volver}>
            <Icono nombre="atras" tam={18} />
          </button>
          <Avatar id={conv} animo={animoDe(state)} tam="chico" />
          <div className="chat__cab-txt">
            <h2>{info?.nombre || nombreDe(conv)}</h2>
            <p>{conv === "andrea" ? textos.escritorio.animoJefa(animo.texto) : info?.subtitulo}</p>
          </div>
        </>
      ) : (
        <>
          <Icono nombre="chat" tam={18} />
          <div className="chat__cab-txt">
            <h2>{T.titulo}</h2>
          </div>
        </>
      )}
      {onCerrar ? (
        <button type="button" className="chat__cerrar" onClick={onCerrar} aria-label={T.cerrar}>
          <Icono nombre="cerrar" tam={16} />
        </button>
      ) : null}
    </header>
  );
}

/** Panel del chat (escritorio), sobre la barra de tareas a la derecha. */
export function ChatPanel({ conv, onConv, onCerrar }) {
  return (
    <section className="chat" id="panel-chat" aria-label={T.titulo}>
      <CabeceraChat conv={conv} onConv={onConv} onCerrar={onCerrar} />
      <div className="chat__cuerpo">
        <ChatApp conv={conv} onConv={onConv} />
      </div>
    </section>
  );
}

/** Aviso breve de un mensaje nuevo cuando el chat está cerrado. Abre esa conversación. */
export function ChatAviso({ onAbrir }) {
  const { state } = useJuego();
  const ultimo = [...state.chat].reverse().find((m) => m.de !== "yo" && !m.silencio);
  const [visible, setVisible] = useState(null);

  useEffect(() => {
    if (!ultimo || ultimo.leido) return undefined;
    setVisible(ultimo.id);
    const t = setTimeout(() => setVisible(null), 8000);
    return () => clearTimeout(t);
  }, [ultimo?.id, ultimo?.leido]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!ultimo || visible !== ultimo.id || ultimo.leido) return null;
  const info = conversaciones[ultimo.conv];
  return (
    <button type="button" className="chat-aviso" onClick={() => onAbrir(ultimo.conv)}>
      <Avatar id={ultimo.conv} animo={animoDe(state)} />
      <span>
        <strong>{info?.grupo ? `${nombreDe(ultimo.de)} · ${info.nombre}` : info?.nombre || nombreDe(ultimo.de)}</strong>
        <span className="chat-aviso__texto">{ultimo.texto}</span>
      </span>
    </button>
  );
}
