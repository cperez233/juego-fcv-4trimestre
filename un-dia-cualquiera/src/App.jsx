import { useCallback, useRef, useState } from "react";
import { JuegoProvider } from "./estado/juego.jsx";
import Escritorio from "./escritorio/Escritorio.jsx";
import RegistroDev from "./escritorio/RegistroDev.jsx";
import { Titulo, Ingreso, Intro } from "./pantallas/Inicio.jsx";
import { Revelacion, Rebobinado, Resultado, Cierre } from "./pantallas/Final.jsx";
import { construirResultado } from "./engine/resumen.js";
import { jugadorPractica } from "./util/jugador.js";
import { marcarIntentoLocal } from "./util/intentos.js";
import { iniciar, enviarResultado } from "./api.js";
import "./pantallas/pantallas.css";

/**
 * Flujo (guion 8.1): Título → Ingreso → Intro → Tutorial + Jornada → Revelación → Rebobinado → Resultado → Cierre.
 */
export default function App() {
  const [pantalla, setPantalla] = useState("titulo");
  const [jugador, setJugador] = useState(null);
  const [modo, setModo] = useState("oficial");
  const [partida, setPartida] = useState(0);
  const [tutorial, setTutorial] = useState(true);
  const [fin, setFin] = useState(null); // { resultado, productividad, pendientesHechos }
  const inicio = useRef(null);

  const empezarJornada = () => {
    inicio.current = new Date().toISOString();
    setPartida((n) => n + 1);
    setTutorial(true);
    setPantalla("jornada");
  };

  const alTerminar = useCallback(
    (state) => {
      const resultado = construirResultado(state.registro, {
        jugador: state.jugador,
        modo: state.modo,
        inicio: inicio.current,
        fin: new Date().toISOString(),
        dispositivo: window.matchMedia("(max-width: 767px)").matches ? "movil" : "pc",
        duracionActivaMs: state.msReal,
      });
      if (state.modo === "oficial") enviarResultado(resultado);
      if (import.meta.env.DEV) window.__resultado = resultado;
      const ev = resultado.evaluacion;
      const total = Object.keys(ev.pendientes).length;
      setFin({ resultado, productividad: Math.round((Math.max(0, ev.productividad) / total) * 100), pendientesHechos: ev.puntosPendientes, pendientesTotal: total });
      setPantalla("revelacion");
    },
    []
  );

  const practicar = () => {
    setJugador((j) => jugadorPractica(j));
    setModo("practica");
    setFin(null);
    setPantalla("intro");
  };

  let contenido;
  switch (pantalla) {
    case "titulo":
      contenido = <Titulo onJugar={() => setPantalla("ingreso")} />;
      break;
    case "ingreso":
      contenido = (
        <Ingreso
          onVolver={() => setPantalla("titulo")}
          onPractica={practicar}
          onIniciar={(j) => {
            marcarIntentoLocal(j.cedula);
            iniciar(j.cedula);
            setJugador(j);
            setModo("oficial");
            setPantalla("intro");
          }}
        />
      );
      break;
    case "intro":
      contenido = <Intro onFin={empezarJornada} />;
      break;
    case "jornada":
      contenido = (
        <JuegoProvider key={partida} jugador={jugador} modo={modo} onFin={alTerminar}>
          <Escritorio tutorial={tutorial} onFinTutorial={() => setTutorial(false)} />
          {import.meta.env.DEV ? <RegistroDev /> : null}
        </JuegoProvider>
      );
      break;
    case "revelacion":
      contenido = <Revelacion resultado={fin.resultado} productividad={fin.productividad} onSeguir={() => setPantalla("rebobinado")} />;
      break;
    case "rebobinado":
      contenido = <Rebobinado resultado={fin.resultado} jugador={jugador} onFin={() => setPantalla("resultado")} />;
      break;
    case "resultado":
      contenido = <Resultado resultado={fin.resultado} jugador={jugador} productividad={fin.productividad} pendientesHechos={fin.pendientesHechos} pendientesTotal={fin.pendientesTotal} onSeguir={() => setPantalla("cierre")} />;
      break;
    default:
      contenido = <Cierre onPractica={practicar} onInicio={() => setPantalla("titulo")} />;
  }
  return contenido;
}
