# Bitácora de progreso

Actualiza esta bitácora al cerrar cada fase o sesión: qué se hizo, qué quedó pendiente, decisiones nuevas y la próxima acción concreta.

## 2026-09-28 · Diseño (sin código)
- Revisado el material de `Referencia /` (código, documentación, participaciones, documento base).
- Elegida la idea: escritorio simulado + rebobinado. Nombre: **Un día cualquiera / Después del clic**.
- Guion cerrado en `docs/02_GUION.md` (v3.1). UI especificada en `docs/03_UI_ESCRITORIO.md` a partir de capturas del Zimbra real.
- Plan técnico y fases en `docs/04_PLAN_TECNICO.md`.
- Pendientes externos: validación jurídica del aviso de privacidad, URL del portal GLPI (opcional), lista vigente de cédulas, verificación de dominios falsos.

**Próxima acción:** Fase 0 del plan técnico.

## 2026-09-28 · Fases 0 y 1 (checkpoint 🔍 Fase 1)

**Hecho**
- Fase 0: `un-dia-cualquiera/` con Vite 8 + React 18 (JavaScript). `server.js` y `security-headers.js` adaptados del juego anterior: sin Google Fonts, CSP de producción sin `unsafe-inline` en estilos, `form-action 'none'`, límite de tamaño del cuerpo, `safeJoin` corregido. Rutas `/api/validar|iniciar|resultado` creadas pero responden 501 (se implementan en la Fase 5). `data/` privada fuera de `public/` y en `.gitignore`.
- Guion transcrito a `src/data/`: `config.js`, `eventos.js` (E1–E7 con acciones, puntos, etiquetas, banderas, 1B, 5B, 7A, 7B, pendientes y chat), `perfiles.js`, `relleno.js` (9 correos de bandeja + enviados + borrador + contenido de adjuntos), `textos.js` (pantallas P1–P9 e interfaz).
- Fase 1: escritorio (fondo, iconos, ventanas, barra de tareas con red y reloj, pendientes plegables, chat, toasts) y **Correo FCV** fiel a las capturas (colores muestreados de ellas), con E1, E2 y relleno. Tarjeta del remitente y tooltip de URL; en móvil, hoja inferior con un toque. Redactar/Responder/Reenviar con autocompletar de los 4 contactos. Spam, No es spam, Eliminar, Archivo, adjuntos (visor de solo lectura).
- Registro (`src/engine/registro.js`): llegada, apertura, inspección (remitente/enlace) y acciones con `inspecciono` y `tDecisionMs`. El pendiente "programación" se marca solo (abrir adjunto + responder).
- Verificado en Chromium a 1366×768, 1024×768 y 375×812: sin errores de consola, sin scroll horizontal, build de producción con CSP estricta.

**Decisiones nuevas (no estaban en los documentos)**
- Fecha del juego: lunes 28 de septiembre de 2026 (encaja con "Lunes" y "programación de octubre"). Editable en `config.js`.
- Nombre del jugador en el correo: "Tu usuario".
- La tarjeta del remitente y la URL del enlace aparecen tras 450 ms de cursor o foco encima (o con clic); así un paso accidental del mouse o del tabulador no cuenta como inspección.
- El reloj se pausa si la pestaña está oculta; los tiempos del registro son de juego activo.
- Toast "Correo nuevo de …" al llegar cada correo y toast al completar un pendiente.
- Botones decorativos de Zimbra (etiqueta, Acciones, Ver, Seguir leyendo) se ven pero no hacen nada y no reciben foco. "Archivo" saca el mensaje de la bandeja (el motor lo tratará como ignorar).
- Solo en `npm run dev`: panel "Registro (dev)" y `?rapido=N` para acelerar el reloj.

**Preguntas abiertas para la Fase 2** (ver resumen del checkpoint)
1. Enlaces en móvil: el toque abre una hoja con la URL antes de abrir el enlace (así lo pide la UI), pero eso hace que todo clic en móvil cuente como "inspeccionó". ¿Se registra aparte (`inspeccion: "hoja_movil"`) y no cuenta para el % de inspección, o se cambia el comportamiento?
2. Combinaciones dentro de un evento (p. ej., clic en E1 → cierra 1B sin escribir → reenvía a Seguridad): ¿cuenta la primera acción, la peor, o se suman?
3. E2: ¿responder sin abrir el adjunto, abrir sin responder, o eliminar/archivar cuentan 0?
4. Textos que el guion no define (E4 páginas y respuestas a Julián, E5 resultados/informe, E6 correo del proveedor, tarjetas del rebobinado): ¿los redacto yo como propuesta?

**Próxima acción:** respuesta de Cristian al checkpoint → Fase 2 (motor con pruebas Vitest).

## 2026-09-28 (tarde) · Rediseño v4 y juego completo jugable

**Contexto:** Cristian probó el checkpoint de la Fase 1 y dijo que no se podía jugar (solo correo; lo demás "disponible en la siguiente fase"; sin menú, ingreso ni tutorial) y que el juego debía ser divertido, no tedioso. Aprobó el rediseño v4 (guion, sección 8) y pidió: cuidado con que el tiempo pase muy rápido, que haya un ganador y un solo intento por cédula; backend después.

**Hecho (Fases 2, 3 y 4 del plan, completas en el navegador)**
- Guion v4.0 (sección 8): flujo título → ingreso (nombre, apellido, cédula) → intro → tutorial → jornada → revelación de dos marcadores → rebobinado "al otro lado" → resultado → cierre; ritmo por eventos; reglas de combinaciones y casos no cubiertos; criterio de ganador y desempates.
- Motor (`src/engine/`): puntaje de E1–E7 y pendientes, banderas, perfil, punto débil, riesgo, rebobinado, cadena de dominó, resultado (payload) y orden de ranking. **94 pruebas Vitest en verde**, incluida la jornada perfecta = 27.
- Ritmo (`config.reloj`): con un evento abierto el reloj va a 1 min de juego cada 2 s; al resolverlo, a los 3 s se adelanta ⏩ al siguiente; botón "⏩ Seguir con mi día"; tope de 90 s por evento; 1B, 5B, alerta y permisos de E6 y E7 congelan el reloj.
- Apps: Navegador (pestañas, barra con "⚠ No seguro", favoritos, buscador, login falso 1B, portal falso E4, intranet, página del programa, tienda de extensiones, "Tu conexión no es privada" y permisos E6), Documentos (Archivo → Guardar como PDF), Mesa de Ayuda (caso #48213, respuesta por correo), Correo con adjuntar archivo, Spam, adjunto .pdf.zip.
- Chat con respuestas de un toque (advertir a Julián, 7B), ánimo de Andrea y marcador de productividad; alerta 5B; E7A con contador, mapa de la sede y acciones (desconectar la red = ícono de red de la barra); consecuencias visibles por etiqueta (.locked, 47 correos, cámara).
- Pantallas de capa con dirección "cinta de cámara que se rebobina" (serif del sistema, timecodes, ámbar/rojo apagado), animaciones solo CSS y respeto a `prefers-reduced-motion`.
- Un intento por cédula: control **local provisional** (huella de la cédula en el navegador). El control real va en el backend.
- Formularios falsos: los campos solo guardan cuántos caracteres hay y muestran puntos; verificado que el DOM nunca contiene lo tecleado.
- Verificado con partidas automáticas en Chromium: perfecta = 27/27 "El Verificador"; todo mal + reporte en E7 = 0/27 "El que reacciona", riesgo Crítico; 375 px sin scroll horizontal; build de producción con CSP estricta sin errores.

**Decisiones nuevas** (además de la sección 8 del guion)
- Textos redactados para el juego y marcados con ✎ en `src/data/eventos.js`: correo del proveedor, páginas del navegador, respuestas del chat, tarjetas del rebobinado, panel "al otro lado", cadenas de dominó.
- E3 se da por resuelto (y la jornada avanza) cuando se atiende 3A o 3B; el otro se puede seguir atendiendo.
- En E7A, contar a Julián o reiniciar también cierran la alerta; el tiempo máximo es 30 s.
- Preferencia de sonido en el navegador (localStorage); sonidos generados, sin archivos.

**Pendiente / para revisar con Cristian**
1. Perfil "El Verificador" es el perfil por defecto del guion: alguien que ignora todo y solo hace clic en E1 sin escribir también cae ahí (5/27). Propuesta: exigir un puntaje mínimo (p. ej. ≥ 18) o crear un perfil para puntajes bajos sin error.
2. Revisar los textos ✎.
3. Backend (Fase 5): `/api/validar`, `/api/iniciar`, `/api/resultado`, lista de cédulas, ranking con `compararParaRanking`, exportación CSV/Excel.

**Próxima acción:** que Cristian juegue una partida completa y dé su opinión → ajustes → Fase 5 (backend).

## 28-sep-2026 (noche) — Guion v5 aprobado, implementación empezada

**Hecho**
- Cristian jugó 2 partidas y aprobó la v5: más eventos, trampas más creíbles, chats separados, distracciones (tiempo + −1 productividad), partida de unos 10 min, Julián escribe a todos (en 7A ya no se le puede ayudar bien).
- `docs/02_GUION.md` sección 9 (v5.0): 13 eventos, reglas de E8–E13, distracciones, pendientes con hora límite, máximo 41, rebobinado con STOP.
- `src/data/config.js`: versión 5.0, espera tras resolver 2 s, saltoDistraccionMin, e7.julianA, personas camila y desconocido. `puntajeMaximo` sigue en 27 hasta que el motor v5 exista.

**Sigue (en este orden)**
1. `eventos.js`: E1 y E4 más difíciles (candado, pie legal copiado), E8–E13, chats con `conv`, grupo del área, páginas nuevas (video, noticias, tienda, anuncio de formatos, intranet con secciones), pendientes con `aparece` y `limite`, tarjetas de rebobinado nuevas, etiqueta FRAUDE.
2. Motor: evaluadores E8–E13 y EX (distracciones), pendientes a tiempo o tarde, 7A + mensaje de Julián, riesgo y punto débil con los eventos nuevos, tests. Luego `puntajeMaximo` = 41.
3. Reductor: conversaciones de chat, mensajes iniciados por el jugador, reportar o bloquear un número, salto de 15 min por distracción, Protección del equipo genérica (E5, E9, E13, EX), Mesa de Ayuda con asuntos.
4. Interfaz: app de chat con lista de conversaciones, páginas nuevas, escritorio tipo Windows (fondo, barra centrada, ventanas claras, notificaciones abajo a la derecha, pendientes en nota adhesiva), navegador tipo Chrome.
5. Rebobinado: transición que retrocede, frena, STOP y muestra la tarjeta.
6. Verificar con los scripts CDP (partida perfecta = 41, partida con errores, móvil, producción).

## 29-sep-2026 — v5 implementada (más difícil, más realista, sin tiempos muertos)

**Hecho**
- **Datos (`src/data/eventos.js`)**: 13 eventos (E1–E13) según guion 9. E1 y E4 más creíbles (candado, pie legal copiado, saludo genérico). Nuevos: E8 capacitación real con enlace, E9 video del grupo con "actualiza tu reproductor", E10 Julián pide la clave, E11 impresora → Mesa de Ayuda, E12 "Andrea" desde otro número, E13 solicitud de vacaciones con anuncio "DESCARGAR". Distracciones (Videos, Noticias con falso virus, Tienda con premio que pide tarjeta). Pendientes que aparecen durante el día y con hora límite. Tarjetas de rebobinado nuevas. Etiqueta FRAUDE. ✎ = textos redactados para el juego.
- **Motor**: evaluadores E8–E13, EX (navegación libre), E7J (Julián durante el incidente), pendientes a tiempo o tarde, distracciones (−1 c/u, máx. −3), punto débil nuevo "Confiar en quien te escribe". Máximo 41. 108 pruebas.
- **Juego**: chats separados por conversación (Andrea, Julián, grupo del área, número desconocido con Reportar/Bloquear), mensajes que el jugador inicia (preguntarle a Andrea), protección del equipo genérica para cualquier descarga, Mesa de Ayuda con categoría + asunto, salto de 15 min por distracción, intranet con secciones (Inicio, Beneficios, Capacitaciones, Formatos).
- **Interfaz**: escritorio tipo sistema operativo actual (fondo, barra centrada con menú de inicio y clima, ventanas claras con minimizar/maximizar/cerrar, notificaciones abajo a la derecha, pendientes en nota adhesiva), navegador tipo Chrome, chat tipo mensajería.
- **Rebobinado**: la cinta corre hasta la hora de cada decisión, frena, suena el STOP y queda congelada; luego aparece la tarjeta.
- **Verificado en Chromium** (scripts CDP en el scratchpad): partida perfecta = **41/41** (El Verificador, 7/7 pendientes); partida con todos los errores + distracciones = 0 (crudo −26), El que reacciona, riesgo Crítico, punto débil "La prisa", Julián en 7A −2; celular 375 px sin desborde; producción sin violaciones de CSP ni errores.
- Corregido en el camino: la página de acceso falsa seguía congelando el reloj después de escribir la clave.

**Pendiente**
- Cristian juega la v5 y da retroalimentación (ritmo con 13 eventos, dificultad de las opciones).
- Revisar los textos ✎ nuevos en `src/data/eventos.js` y `src/data/textos.js`.
- Verificar que los dominios falsos nuevos (guion 9.9) no existan ni sean de terceros.
- Decidir el perfil por defecto "El Verificador" para puntajes bajos sin errores (sigue abierto).
- Fase 5: backend (validar cédulas, un intento por cédula en servidor, ranking, exportar).

**Siguiente acción:** que Cristian juegue `npm --prefix un-dia-cualquiera run dev` → http://localhost:5173 (en desarrollo, `?rapido=3` acorta las esperas).

## 29-sep-2026 (tarde) — v5.1: claridad, rebobinado completo, gana el más rápido

**Hecho** (guion sección 10)
- **E14 (8:50 a.m.)**, sacado de la diapositiva 6 del documento base ("revisar cualquier mensaje inesperado"): encuesta real de Mesa de Ayuda sobre el caso #47102 (enlace a la intranet, +1) y falso "tu buzón está al 98 %" desde `mesadeayuda-fcv.com` con página de acceso falsa (reportar +2, caer −3 CREDENCIALES). Máximo: 44.
- **Pendientes** con pista de en qué programa se hacen, sin revelar el camino seguro.
- **Sin "decisiones"** en título, revelación ni consejos.
- **Rebobinado**: misma mecánica; ahora todos los errores (incluye cada distracción, cada pendiente tarde y una tarjeta final con los pendientes sin hacer) + los 3 mejores aciertos.
- **Ganador**: mayor puntaje; empate → sorteo en el servidor (cambiado el 30-sep-2026; antes desempataba el menor tiempo activo). `duracionActivaMs` se sigue enviando y mostrando, solo como dato.
- Verificado: 111 pruebas; partida perfecta 44/44; partida con errores → 17 tarjetas (3 distracciones + pendientes sin hacer).

**Pendiente**: verificar el dominio falso `mesadeayuda-fcv.com`; lo demás igual que la entrada anterior (backend, textos ✎, perfil por defecto).

## 30-sep-2026 — v5.2: el día avanza solo, la carta enseña

**Hecho** (guion sección 11)
- **Reloj**: los eventos cuentan como atendidos con solo abrir el correo o leer el mensaje (8 s de margen); si nadie los atiende, el día sigue solo a los 5 s de llegar al siguiente evento (tope 45 s). Eventos y mensajes del grupo llegan espaciados (4 s). El botón ⏩ ya no parpadea. Verificado: una jornada sin tocar nada termina sola; la pausa más larga fue ~7 s reales.
- **Pendiente Spam**: se cumple al revisar los dos correos, sin exigir reportar/eliminar.
- **Carta final**: nueva sección "Dónde se fueron tus puntos" (`src/engine/repaso.js`, textos en `repaso` de `eventos.js`), con el error humano del documento base, lo que hizo y lo mejor.
- **Rebobinado**: aciertos solo de seguridad; el de las 12:15 primero.
- Verificado: 115 pruebas; partida perfecta 44/44; partida con errores → la lista de puntos perdidos suma 44 − puntaje.

**Pendiente**: que Cristian juegue v5.2; revisar los textos ✎ de `repaso`; verificar `mesadeayuda-fcv.com`; Fase 5 (backend).

## 30-sep-2026 (tarde) — v5.3: avisos ordenados y escritorio tipo Windows 11

**Hecho** (guion sección 12)
- Corregido el cuelgue a la 1:00 p.m. (el paso a la revelación dependía de todo el estado y un aviso que se cerraba lo cancelaba).
- Avisos: pila única abajo a la derecha, máx. 2, 7 s, con ✕; centro de notificaciones al tocar la hora (`CentroNotificaciones.jsx`) con campana y calendario; estados de las apps aparte (`EstadoApp`); sin aviso al completar pendientes.
- Escritorio Windows 11: `FondoEscritorio.jsx` (SVG propio), barra translúcida, pendientes en la barra, bandeja agrupada, fecha corta.
- Circular de Ciberseguridad en el buzón (`relleno.js`, `r-seguridad`) que enseña que reportar = reenviar.
- Revisión contra el documento base: las 5 diapositivas de errores tienen eventos (ver respuesta a Cristian). E10 y E12 (chat) quedan fuera de las 5, agrupados como "Confiar sin verificar quién te escribe".
- Verificado: 115 pruebas; partida perfecta 44/44; jornada sin tocar nada termina sola y pasa a la revelación; móvil sin desbordes.

## 30-sep-2026 (noche) — v5.4: cómo reportar y ritmo que respeta al jugador

- Repaso de la carta: "−N" en rojo solo si restó; "faltó N" en gris si sumó menos de lo posible. Textos corregidos: ya no mencionan un botón "Reportar a Seguridad" que no existe (dicen Reenviar → ciberseguridad@fcv.org). E6 aclara que abrir el enlace no resta.
- Tutorial y "Cómo se juega" explican cómo reportar (guion 13.1).
- Reloj (guion 13.2): no se adelanta con actividad reciente del jugador ni con una pregunta del chat por responder; el adelanto se corta si el jugador actúa.
- Verificado: 115 pruebas; partida perfecta; partida con errores; jornada quieta termina sola (pausa máx. ~12 s reales); con clics seguidos el reloj nunca salta.

## 30-sep-2026 (cierre) — v5.5: reloj sin pausas, Spam y E6

- Reloj: nunca se detiene (1 min cada 1,5 s); ⏩ solo sin nada en curso; sin espera antes de cada evento (guion 14.1).
- Pendiente Spam aparece con E3. E6: Volver = +3. Quitada la frase sobre el botón Spam del tutorial y la circular.
- Solo clics dentro de algo abierto cuentan como actividad (13.2).
- Verificado: 115 pruebas; partida perfecta 44/44; partida con errores (17 tarjetas); jornada quieta ≈ 8,5 min reales sin pausas.

## 30-sep-2026 (cierre 2) — v5.6: E15–E18 y reloj más rápido (máximo 51)

- Reloj 1 min cada 1,1 s; esperas más cortas (guion 15.1).
- E15 reservar sala (Intranet → Reservas), E16 soporte técnico falso por chat (`soporte-remoto-fcv.com`), E17 pestaña emergente "navegador desactualizado" (`actualiza-tu-navegador.net`), E18 reenviar el acta a Camila. 9 pendientes; máximo 51.
- Verificado: 118 pruebas; partida perfecta 51/51; partida con errores 18 tarjetas; jornada quieta ≈ 6,3 min reales.
- Pendiente: verificar los dos dominios nuevos; revisar textos ✎ de E15–E18.

## 30-sep-2026 (cierre 3) — v5.7

- E4 a las 10:05 (lejos de E10); las preguntas de eventos no se retiran cuando la misma persona escribe otra cosa.
- E17 a las 12:40 y abre el navegador solo.
- Verificado: 118 pruebas; partida perfecta 51/51; con E4 ya llegado, la pregunta de la clave de Julián sigue con sus respuestas.

## 30-sep-2026 (cierre 4) — v5.8

- Repaso: caer y reportar después se marca como error y explica la recuperación (guion 17). 120 pruebas.

## 1-oct-2026 — v5.9: menos saturación tras la prueba con Felipe

- Felipe: 11/51, 0/9 pendientes, sin errores (guion 18.1).
- 6 pendientes (sin Spam, programación ni E18); máximo 48; arranque suave hasta las 9:00; perfil "El que dejó pasar el día"; grupo silenciado; pendientes nuevos marcados en el botón.
- Verificado: 122 pruebas (incluye la partida de Felipe → perfil pasivo); partida perfecta 48/48; jornada quieta termina sola.

- Repaso más corto (guion 19): pendientes en una fila, orden errores → no atendidos → jornada, 8 filas + "Ver N más". Rebobinado sin cambios (18 tarjetas en la partida con errores). 123 pruebas.

## 1-oct-2026 — v5.10

- Vuelve el pendiente de Spam (7 pendientes, máximo 49); tutorial y "Cómo se juega" explican el puntaje sin decir qué es trampa (guion 20). 123 pruebas; perfecta 49/49.
- Propuesto a Cristian: quitar las respuestas de los 7 mensajes de Andrea que no cuentan (ver respuesta del 1-oct).

## 1-oct-2026 — v5.11

- 14B llega a las 9:15 (E14B), aparte de la encuesta real de las 8:50; tutorial sin "resta lo que sale mal". Respuestas de Andrea sin cambios. 123 pruebas; perfecta 49/49; partida con errores 18 tarjetas.
- **Siguiente:** otra prueba con alguien que no haya jugado.

## 30-sep-2026 — Desempate por sorteo

- Pedido de Cristian: gana el mayor puntaje; si hay empate, sorteo (antes: menor tiempo activo y otros criterios). Actualizados tutorial (`textos.js`), guion 8.7 y 10.4, `compararParaRanking` (solo puntaje; empate = 0) y su prueba. El servidor hará el sorteo en la Fase 5. El tiempo de juego se sigue mostrando solo como dato.

- Corrección: el correo de reporte es `ciberseguridad@fcv.org` (no seguridadinformatica@) y el área se llama "Ciberseguridad" en todo el juego y los docs.
- Los "Seguridad" sueltos (chat, rebobinado, guion) también pasaron a "Ciberseguridad"; se dejaron "Seguridad y Salud en el Trabajo" y "Seguridad de la información".
