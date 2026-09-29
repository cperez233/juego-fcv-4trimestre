# 01 · Contexto y decisiones

## Qué se pidió

Un juego educativo **web** para la capacitación del 4.º trimestre de 2026 de la Dirección de Ciberseguridad de la FCV. Requisito explícito de Cristian: que sea **único**, no un quiz ni un Kahoot. Al final hay que entregar documentación parecida a la del trimestre pasado (documentación técnica, manual de instalación e informe de resultados/estadísticas).

## Documento base: "Errores humanos en la red"

Archivo: `Referencia /Borrador capacitación 4to trimestre.docx`. Lema: *Pequeñas acciones, grandes riesgos.* Idea clave: la capacitación **no** vuelve a explicar phishing, ransomware, etc.; habla de **qué hacemos nosotros** frente a esas amenazas.

| Diapositiva | Tema | Ideas que el juego debe reflejar |
|---|---|---|
| 3 | Navegar sin verificar | Verificar la dirección del sitio; desconfiar de páginas desconocidas; no ingresar información en sitios de legitimidad dudosa; no confiar en una página por su apariencia. |
| 4 | Descargar sin comprobar | Evitar software de páginas desconocidas, versiones modificadas o no oficiales, archivos de procedencia no verificable, instalar sin autorización. Priorizar fuentes oficiales o institucionalmente autorizadas. |
| 5 | Ignorar las señales de alerta | "Sitio no seguro", "Archivo potencialmente peligroso", "Conexión no privada", advertencias del antivirus, solicitudes inesperadas de permisos. Consigna: **Lee → Verifica → Decide**. |
| 6 | Confiar demasiado en el correo | Atención especial a Spam / Correo no deseado, y también a cualquier mensaje inesperado. Consigna: **Remitente → Mensaje → Enlace/Adjunto → Acción solicitada**. |
| 7 | El error más peligroso: no reaccionar | No ocultar el error ni esperar; un error reportado a tiempo evita un incidente mayor. Cerrar con los canales institucionales. |

## Canales institucionales (confirmados por Cristian)

- Correo de Seguridad Informática: **seguridadinformatica@fcv.org**
- WhatsApp: **300 779 3096**
- Mesa de Ayuda: **helpdesk@fcv.org** (los casos se abren por un portal GLPI; la URL del portal aún no se conoce → en el juego se llama simplemente "Mesa de Ayuda").
- Dominio institucional del correo: **@fcv.org**. Webmail: Zimbra (`webmail.fcv.org`). Algunos usan Gmail, pero la mayoría Zimbra.

## El juego anterior (CiberHéroes Doomsday, 3.er trimestre)

Código en `Referencia /Codigo_Fuente_CiberHeroes`. Tema: clasificación de activos N1–N4 con estética de Avengers. React 18 + Vite 5, un solo archivo de ~3000 líneas (`max-heroes-doomsday.jsx`), servidor Node nativo (`server.js`, puerto 5005) que sirve `dist/` y recibe `POST /api/score`, guarda en carpetas `DDMMYYYY - CEDULA/` + SQLite (vía script Python), API PHP opcional, cabeceras de seguridad en `security-headers.js`, systemd y scripts de supervisión.

Qué reutilizar: el patrón de servidor Node + cabeceras de seguridad + guardado por participación + exportación a Excel, y la estructura de la documentación.

Qué **no** repetir:
- La lista de cédulas autorizadas se servía en `public/data/identificaciones.csv` (≈4 780 cédulas descargables por cualquiera). En el juego nuevo se valida en el servidor.
- Un solo archivo gigante: el juego nuevo va modular y con el contenido en archivos de datos.
- La única participación se controlaba en `localStorage` (se puede saltar). Ahora se controla en el servidor.

Resultados del juego anterior (`Referencia /Documentación/Resultados_Estadisticas.pdf`): 284 personas, 70 % ganó, 88 puntajes perfectos (12/12), retención a ronda 4 del 75 %, picos el día de lanzamiento. Lecciones: era fácil, y el informe solo decía quién ganó, no **qué errores comete la gente**. El juego nuevo corrige ambas cosas.

## Idea elegida y por qué

Se evaluaron 4 ideas (escritorio simulado, incidente en reversa, "ahora eres el atacante", buscar señales con lupa). Se eligió **escritorio simulado ("Un día cualquiera") + final en reversa ("Después del clic")** porque:
- El tema del documento es el comportamiento, y un escritorio simulado lo observa directamente.
- Cubre los 5 errores de forma natural.
- Genera estadísticas útiles para el informe (qué % hizo clic, qué % revisó el remitente, cuánto tardan en reportar).
- Aprovecha las habilidades de diseño web del equipo.

## Decisiones tomadas (con su razón)

| Decisión | Razón |
|---|---|
| Nombre: **Un día cualquiera**; la parte final se llama **Después del clic** | Elegido por Cristian. |
| Público general, sin sistemas específicos por área | No todos usan SAHI u otros sistemas; el documento es transversal. |
| Correos legítimos mezclados y falsos positivos restan (−1) | Que desconfiar de todo no sea una estrategia ganadora; enseñar a verificar, no paranoia. |
| Pendientes completados de forma segura suman | Da motivo real para actuar y castiga la inacción. |
| El tutorial **no** dice que se puede revisar remitente/enlaces | Para medir el comportamiento natural de inspección. |
| Aviso de privacidad en el ingreso: uso agregado, no sancionatorio, Ley 1581 de 2012 | Si la gente cree que su jefe verá sus errores, juega "a quedar bien". El texto lo valida jurídica (pendiente). |
| Una partida puntuada por cédula + modo práctica | Si repiten, ya conocen las trampas y el dato deja de servir; la práctica conserva el valor pedagógico. |
| En Zimbra, "Spam" ≠ reportar | El botón Spam solo mueve el correo y entrena el filtro; no avisa a nadie. Reportar es **reenviar a seguridadinformatica@fcv.org**. El juego enseña eso. |
| Consecuencia del evento 7 según el error cometido | Para que la relación causa-efecto sea clara (credenciales → correos enviados; malware → archivos bloqueados, etc.). |
| Perfiles con reglas explícitas y "El que reacciona" con prioridad | Es el comportamiento que más se quiere premiar. |
| Rebobinado corto (todos los errores + máx. 2 aciertos, con "Saltar") | Mantener la partida en 6–7 min. |
| Alerta de "protección del equipo" genérica | No se sabe qué antivirus usan. |
| No reproducir logos de marcas (Zimbra, navegadores, SO) | Se replica la disposición y los colores del webmail institucional, con una marca genérica "Correo FCV". |

## Pendientes abiertos

1. Validación del aviso de privacidad por jurídica y enlace a la política de tratamiento de datos de la FCV.
2. URL del portal GLPI (opcional).
3. Verificar que los dominios falsos del guion no existan o no sean de alguien real (ver `02_GUION.md`, sección 7).
4. Lista de cédulas autorizadas vigente (el CSV del juego anterior puede servir de punto de partida; confirmar con Cristian).
