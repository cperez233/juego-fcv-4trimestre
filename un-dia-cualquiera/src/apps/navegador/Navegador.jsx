import { useEffect, useState } from "react";
import { useJuego } from "../../estado/juego.jsx";
import { navegador as N } from "../../data/eventos.js";
import Icono from "../../ui/Icono.jsx";
import {
  Buscador,
  LoginFalso,
  BeneficiosFalso,
  Intranet,
  Programa,
  Extension,
  Certificado,
  Catalogo,
  PromptPermisos,
  Video,
  Noticias,
  Tienda,
  FormatosAnuncio,
  SoporteRemoto,
  ActualizarNavegador,
} from "./Paginas.jsx";
import "./navegador.css";

const PAGINAS = {
  buscador: Buscador,
  "login-falso": LoginFalso,
  "login-buzon": LoginFalso,
  "beneficios-falso": BeneficiosFalso,
  intranet: Intranet,
  programa: Programa,
  extension: Extension,
  certificado: Certificado,
  catalogo: Catalogo,
  video: Video,
  noticias: Noticias,
  tienda: Tienda,
  "formatos-anuncio": FormatosAnuncio,
  "soporte-remoto": SoporteRemoto,
  actualizar: ActualizarNavegador,
};

// Ícono pequeño de cada pestaña (sin logos de marcas).
const FAVICON = { intranet: "🏥", video: "▶", noticias: "📰", tienda: "🛍", "login-falso": "✉", "login-buzon": "✉", "beneficios-falso": "♥", programa: "⬇", "formatos-anuncio": "📄", extension: "🧩", certificado: "⚠", catalogo: "📦", "soporte-remoto": "🛠", actualizar: "⚠" };

export function datosDe(tab) {
  if (tab.pagina === "buscador") return { dominio: "", titulo: tab.q ? `${tab.q} — ${N.buscador.titulo}` : N.inicio, interna: true };
  const d = N.paginas[tab.pagina];
  if (tab.pagina === "intranet") {
    if (tab.seccion === "encuesta") return { ...d, ruta: d.encuesta.ruta, titulo: `${d.titulo} — Encuesta` };
    const sec = d.menu.find((m) => m.id === (tab.seccion || "inicio")) || d.menu[0];
    return { ...d, ruta: sec.ruta, titulo: `${d.titulo} — ${sec.texto}` };
  }
  return d || { dominio: "", titulo: N.inicio, interna: true };
}

// Direcciones que el jugador puede escribir a mano.
const DIRECCIONES = Object.entries(N.paginas)
  .filter(([id, p]) => p.dominio && !p.interna && !["certificado", "catalogo", "actualizar"].includes(id))
  .map(([id, p]) => [p.dominio, id]);

/** Barra de dirección tipo Chrome: candado o "No seguro" siempre con texto, no solo ícono. */
function BarraDireccion({ tab }) {
  const { dispatch } = useJuego();
  const d = datosDe(tab);
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState("");

  const ir = (e) => {
    e.preventDefault();
    const t = texto.trim().toLowerCase();
    setEditando(false);
    if (!t) return;
    const hit = DIRECCIONES.find(([dom]) => t.replace(/^https?:\/\//, "").startsWith(dom));
    if (hit) dispatch({ type: "abrirPagina", pagina: hit[1], nueva: false });
    else {
      dispatch({ type: "abrirPagina", pagina: "buscador", nueva: false });
      dispatch({ type: "navMarcar", id: tab.id, datos: { q: texto.trim() } });
    }
  };

  const seguro = d.interna || d.seguro;
  return (
    <form className="nav-dir" onSubmit={ir} role="search">
      {d.interna && !d.dominio ? (
        <span className="nav-dir__estado">
          <Icono nombre="buscar" tam={14} />
        </span>
      ) : seguro ? (
        <span className="nav-dir__estado" title="La conexión es segura">
          <Icono nombre="candado" tam={14} />
          <span className="sr-only">Conexión segura (https)</span>
        </span>
      ) : (
        <span className="nav-dir__estado nav-dir__estado--mal">
          <Icono nombre="advertencia" tam={14} /> No seguro
        </span>
      )}
      {editando ? (
        <input className="nav-dir__input" autoFocus value={texto} onChange={(e) => setTexto(e.target.value)} onBlur={() => setEditando(false)} aria-label="Dirección" autoComplete="off" />
      ) : (
        <button
          type="button"
          className="nav-dir__texto"
          onClick={() => {
            setTexto(d.dominio ? d.dominio + (d.ruta || "") : "");
            setEditando(true);
          }}
          aria-label={`Dirección: ${d.dominio || N.buscador.placeholder}`}
        >
          {d.dominio ? (
            <>
              <span className="nav-dir__dominio">{d.dominio}</span>
              <span className="nav-dir__ruta">{d.ruta}</span>
            </>
          ) : (
            <span className="nav-dir__placeholder">{N.buscador.placeholder}</span>
          )}
        </button>
      )}
      <span className="nav-dir__estrella" aria-hidden="true">
        ☆
      </span>
    </form>
  );
}

/** Navegador genérico (sin marca): pestañas, barra de dirección, favoritos y páginas simuladas. */
export default function Navegador() {
  const { state, dispatch } = useJuego();
  const { pestanas, activa, extension } = state.nav;
  const tab = pestanas.find((p) => p.id === activa) || pestanas[0];
  const Pagina = PAGINAS[tab.pagina] || Buscador;
  const visible = state.apps.activa === "navegador";
  const permisosPendientes = tab.pagina === "catalogo" && !tab.permisos;

  // Ventanas críticas (1B, alerta E6, permisos E6) congelan el reloj mientras se ven.
  const critico = visible && (((tab.pagina === "login-falso" || tab.pagina === "login-buzon") && !tab.enviado) || tab.pagina === "certificado" || permisosPendientes);
  useEffect(() => {
    dispatch({ type: "critico", id: "navegador", on: critico });
  }, [critico, dispatch]);
  useEffect(() => () => dispatch({ type: "critico", id: "navegador", on: false }), [dispatch]);

  return (
    <div className="nav">
      <div className="nav-pestanas" role="tablist" aria-label="Pestañas">
        {pestanas.map((p) => {
          const d = datosDe(p);
          return (
            <div key={p.id} className={`nav-pestana${p.id === tab.id ? " is-activa" : ""}`}>
              <button type="button" role="tab" aria-selected={p.id === tab.id} className="nav-pestana__titulo" onClick={() => dispatch({ type: "navCambiar", id: p.id })}>
                <span className="nav-pestana__fav" aria-hidden="true">
                  {FAVICON[p.pagina] || "○"}
                </span>
                <span className="nav-pestana__txt">{d.titulo}</span>
              </button>
              <button type="button" className="nav-pestana__x" onClick={() => dispatch({ type: "navCerrar", id: p.id })} aria-label={`Cerrar pestaña ${d.titulo}`}>
                <Icono nombre="cerrar" tam={12} />
              </button>
            </div>
          );
        })}
        <button type="button" className="nav-nueva" onClick={() => dispatch({ type: "navNueva" })} aria-label="Nueva pestaña">
          +
        </button>
      </div>
      <div className="nav-barra">
        <span className="nav-flecha" aria-hidden="true">
          <Icono nombre="atras" tam={16} />
        </span>
        <span className="nav-flecha" aria-hidden="true">
          <Icono nombre="adelante" tam={16} />
        </span>
        <span className="nav-flecha" aria-hidden="true">
          <Icono nombre="refrescar" tam={16} />
        </span>
        <BarraDireccion key={tab.id + tab.pagina + (tab.seccion || "")} tab={tab} />
        {extension ? (
          <span className="nav-ext" title="Conversor Rápido">
            <span aria-hidden="true">🧩</span>
            <span className="sr-only">Extensión Conversor Rápido instalada</span>
          </span>
        ) : null}
        <span className="nav-perfil" aria-hidden="true">
          {state.jugador.nombreCompleto?.[0] || "U"}
        </span>
      </div>
      <div className="nav-favoritos">
        {N.favoritos.map((f) => (
          <button key={f.id} type="button" className="nav-fav" onClick={() => dispatch({ type: "abrirPagina", pagina: f.pagina, seccion: f.seccion, nueva: false })}>
            <span aria-hidden="true">{f.icono}</span> {f.texto}
          </button>
        ))}
      </div>
      <div className="nav-pagina">
        {permisosPendientes ? <PromptPermisos tab={tab} /> : null}
        <Pagina key={tab.id + tab.pagina + (tab.seccion || "")} tab={tab} />
      </div>
    </div>
  );
}
