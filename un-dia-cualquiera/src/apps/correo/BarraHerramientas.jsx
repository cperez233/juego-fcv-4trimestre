import { textos } from "../../data/textos.js";
import Icono from "../../ui/Icono.jsx";

const B = textos.correo.botones;

function Boton({ children, onClick, deshabilitado }) {
  return (
    <button type="button" className="zc-btn" onClick={onClick} disabled={deshabilitado}>
      {children}
    </button>
  );
}

/** Imitación visual sin función (imprimir ▾, etiqueta ▾, Acciones ▾, Ver ▾…). Fuera del orden de tabulación. */
function Decorativo({ children, deshabilitado }) {
  return (
    <span className={`zc-btn zc-btn--deco${deshabilitado ? " is-off" : ""}`} aria-hidden="true">
      {children}
    </span>
  );
}

/** Barra de herramientas del correo. Deshabilitada (gris) si no hay mensaje seleccionado. */
export default function BarraHerramientas({ haySeleccion, enSpam, enPapelera, h, onNuevo, redactando, onCancelarRedaccion, onGuardarBorrador }) {
  const off = !haySeleccion;
  return (
    <div className="zc-barra" role="toolbar" aria-label="Correo">
      <div className="zc-barra__izq">
        <button type="button" className="zc-nuevo" onClick={onNuevo}>
          <span>{textos.correo.nuevoMensaje}</span>
          <Icono nombre="caretAbajo" tam={12} />
        </button>
      </div>

      {redactando ? (
        <div className="zc-barra__grupos">
          <div className="zc-barra__grupo">
            <button type="submit" form="zc-form-redactar" className="zc-btn zc-btn--primario">
              {textos.correo.redactar.enviar}
            </button>
            <Boton onClick={onCancelarRedaccion}>{textos.correo.redactar.cancelar}</Boton>
            <Boton onClick={onGuardarBorrador}>{textos.correo.redactar.guardarBorrador}</Boton>
          </div>
        </div>
      ) : (
        <div className="zc-barra__grupos">
          <div className="zc-barra__grupo">
            <Boton onClick={h.responder} deshabilitado={off}>{B.responder}</Boton>
            <Boton onClick={h.responderTodos} deshabilitado={off}>{B.responderTodos}</Boton>
            <Boton onClick={h.reenviar} deshabilitado={off}>{B.reenviar}</Boton>
          </div>
          <div className="zc-barra__grupo">
            <Boton onClick={h.archivar} deshabilitado={off || enSpam}>{B.archivo}</Boton>
            <Boton onClick={h.eliminar} deshabilitado={off || enPapelera}>{B.eliminar}</Boton>
            <Boton onClick={h.spam} deshabilitado={off}>{enSpam ? B.noSpam : B.spam}</Boton>
          </div>
          <div className="zc-barra__grupo">
            <button type="button" className="zc-btn zc-btn--icono" onClick={h.imprimir} disabled={off} aria-label={B.imprimir}>
              <Icono nombre="imprimir" tam={15} />
              <Icono nombre="caretAbajo" tam={10} />
            </button>
            <Decorativo deshabilitado={off}>
              <Icono nombre="etiqueta" tam={15} />
              <Icono nombre="caretAbajo" tam={10} />
            </Decorativo>
          </div>
          <div className="zc-barra__grupo">
            <Decorativo deshabilitado={off}>
              {B.acciones} <Icono nombre="caretAbajo" tam={10} />
            </Decorativo>
          </div>
          <div className="zc-barra__grupo zc-barra__der">
            <Decorativo deshabilitado>{B.seguirLeyendo}</Decorativo>
            <Decorativo>
              <Icono nombre="chat" tam={14} /> {B.ver} <Icono nombre="caretAbajo" tam={10} />
            </Decorativo>
          </div>
        </div>
      )}
    </div>
  );
}
