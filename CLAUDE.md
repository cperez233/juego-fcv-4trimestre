# Un día cualquiera — juego de sensibilización (FCV, 4.º trimestre 2026)

Juego web educativo de la Dirección de Ciberseguridad de la Fundación Cardiovascular de Colombia (FCV). El jugador vive una jornada simulada frente a un computador (correo tipo Zimbra, navegador, documentos, Mesa de Ayuda) y el juego registra lo que *hace*, no lo que *sabe*. Al final la jornada se "rebobina" (*Después del clic*) y se muestran las consecuencias de cada decisión.

Quien trabaja en esto es Cristian, practicante de la Dirección de Ciberseguridad. Escribe en español; responde en español.

## Dónde está todo

| Ruta | Qué es |
|---|---|
| `docs/01_CONTEXTO.md` | Por qué existe el juego, público, decisiones ya tomadas y su razón. Léelo primero. |
| `docs/02_GUION.md` | **Fuente de verdad** del contenido: pantallas, eventos, textos, puntajes, perfiles. |
| `docs/03_UI_ESCRITORIO.md` | Especificación visual: correo tipo Zimbra, navegador, escritorio, móvil. |
| `docs/04_PLAN_TECNICO.md` | Arquitectura, modelo de datos, fases de trabajo y criterios de aceptación. |
| `docs/05_PROMPT_INICIO.md` | Prompt para arrancar una sesión nueva de implementación. |
| `docs/PROGRESO.md` | Bitácora de avance. Actualízala al terminar cada fase o sesión. |
| `docs/referencias-ui/` | Capturas del Zimbra real de la FCV. Solo para referencia visual (contienen datos personales: no copiar nombres ni correos de ellas). |
| `Referencia /` (con espacio al final del nombre) | Material del trimestre pasado: código de *CiberHéroes Doomsday*, su documentación en PDF, participaciones y el documento base `Borrador capacitación 4to trimestre.docx`. Solo lectura. |
| `un-dia-cualquiera/` | Código del juego nuevo (se crea en la Fase 0). |

## Reglas del proyecto

- El contenido sale del documento base (5 errores humanos: navegar sin verificar, descargar sin comprobar, ignorar alertas, confiar demasiado en el correo, no reaccionar). El juego no explica modalidades de ataque; muestra comportamientos.
- Público general: administrativos y asistenciales. Nada que dependa de un software que solo usan algunas áreas (no SAHI, no herramientas internas de seguridad como Wazuh, Strata Cloud Manager o VulnTracker — además, nombrarlas le da información a un atacante).
- Todo el texto del juego vive en archivos de datos (`src/data/`), no incrustado en componentes, para que Cristian pueda editar el guion sin tocar lógica.
- Si el guion y el código discrepan, gana `docs/02_GUION.md`; si hace falta cambiar el guion, propónlo a Cristian antes.
- Los formularios "falsos" del juego nunca capturan ni envían lo que se escribe. Los dominios falsos son texto, nunca enlaces reales.
- Las cédulas autorizadas se validan en el servidor. No se publica la lista en `public/` (el juego anterior lo hacía; es un error que no repetimos).
- Una sola partida puntuada por cédula (validado en servidor) + modo práctica sin registro.
- Muestra avances a Cristian en los checkpoints definidos en el plan en lugar de construir todo de corrido.
