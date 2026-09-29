# 04 · Plan técnico

## Stack

- **Frontend:** React 18 + Vite (mismo stack del juego anterior; el equipo ya lo conoce y el despliegue ya existe). JavaScript o TypeScript a criterio de quien implemente; si se usa TS, que sea ligero.
- **Pruebas:** Vitest para el motor de reglas (puntaje, banderas, perfiles). Verificación visual en el navegador (desktop y 375 px).
- **Servidor:** Node nativo, basado en `Referencia /Codigo_Fuente_CiberHeroes/server.js` y `security-headers.js` (sirve `dist/`, cabeceras de seguridad, puerto configurable, por defecto 5005). Endpoints nuevos abajo.
- **Persistencia:** una carpeta por participación (`DDMMYYYY - CEDULA/resultado.json`, `eventos.jsonl`) + un archivo agregado (SQLite o JSONL) para el informe. Reutilizar el patrón de `src/save-participation.js` del juego anterior; se puede simplificar.
- **Exportación:** script que genere CSV/Excel con una fila por participación y columnas por evento (acción, inspeccionó, tiempo), listo para el informe de estadísticas. Tomar como base `scripts/exportar_excel.py` del juego anterior.
- **Despliegue:** mismo esquema del juego anterior (systemd + supervisor). Documentarlo en el manual de instalación.

## Estructura propuesta (`un-dia-cualquiera/`)

```
un-dia-cualquiera/
├── src/
│   ├── data/                 # TODO el contenido editable
│   │   ├── eventos.js        # E1–E7: correos, páginas, opciones, puntos, etiquetas, textos del rebobinado
│   │   ├── textos.js         # pantallas (ingreso, intro, tutorial, transición, resultado, cierre)
│   │   ├── perfiles.js       # perfiles, mensajes y puntos débiles
│   │   ├── relleno.js        # correos inocuos de relleno de la bandeja
│   │   └── config.js         # ritmo del reloj, duración de E7, canales de reporte, dominio institucional
│   ├── engine/               # lógica pura, sin React, 100 % probada
│   │   ├── registro.js       # log de acciones {evento, accion, inspecciono, tDecisionMs, horaJuego}
│   │   ├── puntaje.js        # puntos por evento, pendientes, total mostrado/crudo
│   │   ├── banderas.js       # ERR, ALERTA, FP, REPORTO, PRISA + etiquetas 🏷
│   │   ├── perfil.js         # perfil + punto débil
│   │   └── rebobinado.js     # selección de tarjetas y cadena de dominó
│   ├── escritorio/           # shell: fondo, barra de tareas, reloj, pendientes, chat, toasts, modales
│   ├── apps/                 # Correo (Zimbra-like), Navegador, Documentos, MesaDeAyuda
│   ├── pantallas/            # Ingreso, Intro, Tutorial, Transicion, Rebobinado, Resultado, Cierre
│   ├── api.js                # validar, iniciar, guardar resultado (falla en silencio en modo práctica)
│   └── main.jsx
├── server.js                 # estático + API
├── security-headers.js
├── scripts/exportar.(py|mjs)
├── data/                     # (fuera de public/) cedulas autorizadas + participaciones — en .gitignore
└── tests/                    # Vitest del engine
```

## API

| Endpoint | Entrada | Salida | Notas |
|---|---|---|---|
| `POST /api/validar` | `{documento}` | `{ok, estado: "habilitado" \| "no_autorizado" \| "ya_participo"}` | Lista de cédulas leída en el servidor desde `data/` (nunca en `public/`). Rate limit simple por IP. |
| `POST /api/iniciar` | `{documento}` | `{ok, partidaId}` | Marca inicio. Si se cierra la pestaña a mitad, se permite reanudar desde el inicio de la jornada una vez (decisión: no reanudar a mitad de evento). |
| `POST /api/resultado` | resultado completo (ver abajo) | `{ok}` | Cierra la participación; a partir de aquí `validar` devuelve `ya_participo`. Validar forma y tamaño del payload. |

Payload de resultado:
```json
{
  "documento": "…", "partidaId": "…", "juego": "un-dia-cualquiera", "version": "1.0",
  "inicio": "ISO", "fin": "ISO", "duracionMs": 0,
  "puntaje": 0, "puntajeCrudo": 0, "maximo": 27,
  "perfil": "reacciona", "puntoDebil": "correo",
  "banderas": {"ERR": true, "ALERTA": false, "FP": false, "REPORTO": true, "PRISA": false},
  "etiquetas": ["CREDENCIALES"],
  "e7": {"version": "A", "accion": "reportar", "tiempoHastaReportarMs": 12000},
  "pendientes": {"programacion": true, "beneficios": false, "informe": true, "spam": true},
  "eventos": [{"id": "E1", "accion": "clic_enlace", "sub": "credenciales", "inspecciono": false, "tDecisionMs": 6400, "horaJuego": "07:18", "puntos": -4}]
}
```

## Reglas no negociables

- Contenido en `src/data/`; componentes sin textos del guion incrustados.
- `engine/` es lógica pura con pruebas para: cada fila de cada tabla de puntos del guion, las 5 reglas de perfil (incluido el orden de prioridad), el punto débil, `PRISA`, y la selección de tarjetas del rebobinado.
- Campos de login/formularios falsos: no guardan el valor tecleado (se muestran asteriscos/placeholder generados), no tienen `name`, `autocomplete="off"`, y nada se envía a ningún lado. El gestor de contraseñas del navegador no debe ofrecer guardar nada.
- Ningún dominio falso es un `<a href>` real; todo "enlace" del juego es un botón interno.
- Modo práctica: no llama a `/api/resultado`.
- CSP estricta como en el juego anterior (sin scripts externos; fuentes externas solo si se justifican).

## Fases y checkpoints

> **Estado 29-sep-2026:** fases 0–4 hechas en el frontend (juego completo jugable, guion v5.10: 17 eventos, máximo 49). Sigue la Fase 5 (backend). Ver `PROGRESO.md`.

Cada fase termina con algo que se puede ver en el navegador. En los **checkpoints (🔍)** se detiene el trabajo y se le muestra a Cristian antes de seguir. Actualizar `docs/PROGRESO.md` al cerrar cada fase.

| Fase | Entregable | Checkpoint |
|---|---|---|
| 0 · Base | Proyecto Vite en `un-dia-cualquiera/`, server.js + cabeceras adaptados, `src/data/` con el guion transcrito | — |
| 1 · Escritorio + Correo | Escritorio, barra de tareas, reloj, pendientes, chat, y **Correo FCV** fiel a las capturas, con E1 y E2 cargados (sin puntaje aún). Desktop y móvil | 🔍 Mostrar a Cristian: ¿se reconoce como su correo? |
| 2 · Motor | `engine/` completo con pruebas en verde; registro de acciones e inspección conectado al Correo | — |
| 3 · Jornada completa | E3–E7, Navegador, Documentos, Mesa de Ayuda, chat del jefe, consecuencias de 7A según etiqueta | 🔍 Partida completa jugable de punta a punta |
| 4 · Después del clic | Transición, rebobinado, cadena de dominó, resultado, cierre, modo práctica | 🔍 Revisión del cierre pedagógico |
| 5 · Backend | `/api/validar`, `/api/iniciar`, `/api/resultado`, persistencia, exportación CSV/Excel | — |
| 6 · QA | Móvil real (375 px), teclado, contraste, reduced motion, tiempo total ≤ 7 min con 2–3 personas, verificación de dominios falsos | 🔍 Prueba con usuarios |
| 7 · Documentación | Documentación técnica, manual de instalación y plantilla de informe de estadísticas, con la misma estructura que los PDF de `Referencia /Documentación/` | 🔍 Entrega |

## Criterios de aceptación

- Una partida completa dura 6–7 min en promedio.
- El puntaje, banderas, perfil y punto débil coinciden con `02_GUION.md` en todas las pruebas.
- Funciona en Chrome/Edge/Firefox actuales y en móvil de 375 px sin scroll horizontal.
- Una cédula no autorizada o que ya participó no puede iniciar una partida oficial (verificado contra el servidor, no solo `localStorage`).
- La lista de cédulas no es descargable desde el navegador.
- La exportación produce un CSV con una fila por participación y las columnas necesarias para el informe (sección 6 del guion).
