# Prompt para iniciar una sesión nueva

Copia desde la línea siguiente y pégalo en una sesión nueva de Claude Code abierta en la carpeta `Juego/`.

---

Vamos a construir **"Un día cualquiera"**, el juego web de sensibilización en ciberseguridad de la FCV para el 4.º trimestre. El diseño ya está cerrado; tu trabajo es implementarlo con calidad de producto, no rediseñarlo.

<contexto>
El juego simula una jornada de trabajo frente a un computador (correo tipo Zimbra, navegador, documentos, Mesa de Ayuda) y registra lo que el colaborador *hace* ante 5 errores humanos comunes. Al final la jornada se rebobina ("Después del clic") y se muestran las consecuencias. Lo juegan colaboradores de todas las áreas del hospital, administrativos y asistenciales, muchos con poca experiencia técnica y desde el celular, así que debe entenderse sin instrucciones y verse como su entorno real. Los resultados alimentan un informe agregado para la Dirección de Ciberseguridad, por eso la medición tiene que ser exacta.
</contexto>

<lectura_obligatoria>
Antes de escribir código, lee en este orden:
1. `CLAUDE.md`
2. `docs/01_CONTEXTO.md` — decisiones ya tomadas y su porqué
3. `docs/02_GUION.md` — fuente de verdad del contenido, puntajes y perfiles
4. `docs/03_UI_ESCRITORIO.md` y las dos imágenes en `docs/referencias-ui/`
5. `docs/04_PLAN_TECNICO.md` — arquitectura, fases y criterios de aceptación
6. `docs/PROGRESO.md` — dónde quedamos
Luego revisa del juego anterior solo lo que vas a reutilizar: `Referencia /Codigo_Fuente_CiberHeroes/server.js`, `security-headers.js` y `src/save-participation.js` (ojo: la carpeta `Referencia ` tiene un espacio al final del nombre).
</lectura_obligatoria>

<tarea>
Ejecuta la **Fase 0** y la **Fase 1** del plan técnico y detente en el checkpoint de la Fase 1 para mostrarme el resultado. Concretamente:
- Fase 0: crea `un-dia-cualquiera/` con Vite + React, adapta el servidor y las cabeceras de seguridad, y transcribe el guion a `src/data/` (todos los eventos, aunque todavía no se usen).
- Fase 1: construye el escritorio (fondo, barra de tareas, reloj del juego, pendientes, chat) y la app **Correo FCV** fiel a las capturas de Zimbra, con los correos E1 y E2 y la bandeja de relleno. Incluye la tarjeta de detalles del remitente y el tooltip de enlaces, porque de ahí sale la métrica de inspección. Debe funcionar en escritorio y en 375 px.
</tarea>

<criterios_de_calidad>
- El correo tiene que sentirse como el webmail que la gente usa a diario: misma disposición, densidad y tono sobrio. Reconocerlo es lo que hace que lo aprendido se transfiera al trabajo real.
- Todo texto del guion vive en `src/data/`; los componentes solo lo renderizan. Cristian necesita poder editar el guion sin tocar lógica.
- Los formularios falsos nunca guardan ni envían lo que se escribe, y los dominios falsos nunca son enlaces reales.
- Accesibilidad desde el inicio: teclado, foco visible, estados con ícono + texto (no solo color), `prefers-reduced-motion`.
- Mantén la solución simple: no agregues librerías, pantallas ni opciones que el plan no pide. Si algo del guion te parece problemático o ambiguo, pregúntame en vez de resolverlo por tu cuenta.
</criterios_de_calidad>

<verificacion>
Antes de darme el checkpoint, abre el juego en el navegador integrado, revísalo en escritorio y en 375 px, compáralo lado a lado con las capturas de `docs/referencias-ui/` y corrige lo que no se parezca. Revisa la consola para confirmar que no hay errores.
</verificacion>

<al_terminar>
Actualiza `docs/PROGRESO.md` (qué se hizo, qué falta, decisiones nuevas, próxima acción). Luego dame un resumen corto en español: qué construiste, capturas o cómo verlo, qué decisiones tomaste que no estaban en los documentos y qué necesitas de mí para seguir con la Fase 2.
</al_terminar>
