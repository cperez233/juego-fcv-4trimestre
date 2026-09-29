# 03 · Especificación de interfaz

La jornada ocurre dentro de un **escritorio simulado**. La meta es que el jugador reconozca su entorno real (sobre todo el correo) para que lo aprendido se transfiera al trabajo. Referencias visuales: `docs/referencias-ui/zimbra-bandeja.png` y `zimbra-lectura.png` (capturas del webmail real; contienen datos personales — úsalas solo para la disposición y los estilos, nunca para nombres o correos).

No se reproducen logos de marcas (Zimbra, navegadores, sistemas operativos). Se replica la **disposición, jerarquía y colores** del webmail institucional con una marca genérica **"Correo FCV"**.

## 1. Escritorio (contenedor)

- Fondo de escritorio sobrio (no imitar Windows ni macOS). Íconos/lanzadores: **Correo**, **Navegador**, **Documentos**, **Mesa de Ayuda**.
- Barra de tareas inferior con esos 4 lanzadores, indicador de red (se usa en E7 para "desconectar"), y **reloj del juego** (7:00 a.m. → 1:00 p.m.).
- Widget **Pendientes** (esquina superior derecha, plegable): 4 ítems con check; se marcan solos al cumplirse de forma segura.
- Widget **Chat interno** (esquina inferior derecha): burbujas del jefe (Andrea) y del compañero (Julián). Notificación con sonido suave opcional.
- Ventanas de app dentro del escritorio (una activa a la vez en desktop; se puede alternar desde la barra). No hace falta arrastrar/redimensionar.
- Notificaciones tipo toast arriba a la derecha ("Tienes 2 mensajes nuevos en Spam").
- Modales del sistema: alerta de protección del equipo (E5B), permisos del navegador (E6), login falso (1B dentro del navegador).

## 2. Correo FCV (réplica de la disposición de Zimbra clásico)

**Encabezado (franja azul, ~#0B74C0; muestrear el tono exacto de la captura):**
- Izquierda: logo genérico "Correo FCV" en blanco.
- Centro-derecha: caja de búsqueda blanca con ícono de sobre ▾ y placeholder "Buscar".
- Derecha: nombre del usuario en blanco, negrita, con ▾ y una barra delgada de cuota debajo.
- Segunda fila en la franja azul: pestañas **Correo** (activa: fondo blanco, texto oscuro), **Contactos**, **Agenda**, **Tareas**, **Maletín** (texto blanco). Ícono de refrescar a la derecha. Solo "Correo" funciona; las demás muestran un estado vacío.

**Barra de herramientas (fondo claro):**
- Izquierda (ancho de la columna de carpetas): botón azul **"Nuevo mensaje ▾"**.
- Botones con borde gris claro y esquinas poco redondeadas: **Responder · Responder a todos · Reenviar** | **Archivo · Eliminar · Spam** | ícono imprimir ▾ · ícono etiqueta ▾ | **Acciones ▾**. Deshabilitados (gris) si no hay mensaje seleccionado.
- Derecha: **Seguir leyendo**, **Ver ▾**.

**Columna izquierda — carpetas:**
- "▾ Carpetas de correo" con engranaje. **Bandeja de entrada** (seleccionada: fondo celeste), **Enviados**, **Borradores (n)** en negrita, **Spam**, **Papelera**. Íconos pequeños grises a la izquierda de cada carpeta. Contador de no leídos en negrita cuando aplique.
- Debajo: "Búsquedas", "Etiquetas", "▸ Zimlets" (decorativos).
- Mini calendario al pie (decorativo, mes actual del juego).

**Columna central — lista:**
- Cabecera: "Ordenado por Fecha ▿" y a la derecha "N conversaciones".
- Cada fila: punto gris de estado, **remitente** y fecha a la derecha; segunda línea: **asunto** en oscuro + vista previa en gris; íconos de clip (si hay adjunto) y bandera a la derecha. No leídos en negrita. Fila seleccionada: fondo celeste con borde.
- Relleno de la bandeja: además de los correos de los eventos, 6–10 correos inocuos de relleno (circulares, recordatorios) para que la bandeja se vea real. Todos de `@fcv.org` con nombres ficticios.

**Columna derecha — lectura:**
- Estado vacío: "Para ver una conversación, haz clic en ella."
- Título del asunto en negrita grande con "⊞" a la izquierda y "N mensajes" a la derecha.
- Avatar de silueta azul; **De:** en una "píldora" gris redondeada con `"Nombre" <correo>`; fecha a la derecha; **Para:** en otra píldora.
- **Detalles del remitente (medición de inspección):** al pasar el cursor o tocar la píldora "De:", aparece una tarjeta con nombre, dirección completa y dominio. Esto registra `inspecciono=true` para ese evento. Igual para enlaces: al pasar el cursor/tocar un enlace aparece la URL real en un tooltip o en la barra inferior.
- Fila de adjunto: ícono de documento, nombre `(tamaño)` y enlaces **Descargar | Maletín | Eliminar**.
- Cuerpo en fuente más grande (~16 px). Firma.
- **Aviso legal institucional** al pie de los correos de `@fcv.org`: párrafo gris, itálica, letra pequeña, justificado (texto genérico corto redactado para el juego). Los correos falsos no lo tienen: es una señal más, sin que el juego la mencione.
- Al pie: "Mostrar texto entre comillas - Responder - Responder a todos - Reenviar - Más acciones".

**Redactar / Reenviar:** panel sencillo con Para (autocompletar solo con los contactos del juego), Asunto (prellenado "RV: …"), cuerpo, botón **Enviar**. Reenviar a Seguridad Informática = reporte.

**Tipografía y tono:** sans del sistema (Arial/Helvetica), 13 px en la interfaz, bordes grises finos, sombras mínimas. Debe sentirse como el webmail real, no como una versión "mejorada".

## 3. Navegador genérico

- Pestañas arriba, barra de dirección con indicador a la izquierda: 🔒 para sitios válidos y **⚠ No seguro** para los inseguros (con texto, no solo ícono).
- Barra de favoritos con **"Intranet FCV"** (E4) y un par de favoritos decorativos.
- Página de búsqueda genérica ("Buscar en la web") para E5, con resultados estilo buscador (título azul, URL verde, descripción).
- Pantalla de "Tu conexión no es privada" (E6) con la estructura típica: ícono de advertencia, título, texto, botón primario "Volver a un sitio seguro", enlace "Avanzado" que despliega "Continuar de todos modos (no seguro)".
- Prompt de permisos anclado bajo la barra de dirección (E6).
- Página falsa de beneficios (E4) y login falso (1B): convincentes pero con las señales descritas en el guion.

## 4. Documentos y Mesa de Ayuda

- **Documentos:** editor sencillo con el "Informe mensual" abierto; menú **Archivo** con: Nuevo, Abrir, Guardar, **Guardar como PDF**, Imprimir. Guardar como PDF genera `Informe_mensual.pdf` disponible para adjuntar en el correo.
- **Mesa de Ayuda:** formulario de caso (categoría, descripción, Enviar) con estética de portal de tickets genérico. Confirmación: "Caso #48213 creado. Te contactaremos pronto."

## 5. Capas fuera del escritorio (intro, transición, rebobinado, resultado, cierre)

Estas pantallas tienen identidad propia, distinta del escritorio: dirección editorial y cinematográfica (tipografía con carácter, mucho aire, ritmo), con un motivo visual de **cinta/rebobinado** (líneas de escaneo sutiles, contador de tiempo retrocediendo). Evitar estética genérica de IA (gradientes morados, glassmorphism, neón, tarjetas idénticas con íconos). Si la skill `editorial-ui` está disponible, cárgala para estas pantallas.

## 6. Móvil (< 768 px)

- El escritorio se convierte en una "pantalla de teléfono": lanzadores en barra inferior, una app a pantalla completa, pendientes y chat como hojas deslizables.
- Correo: una sola columna (lista → detalle con botón atrás); barra de acciones compacta (íconos con etiqueta: Responder, Reenviar, Eliminar, Spam, ⋯).
- Detalles de remitente/enlace: **un toque** abre una hoja inferior con la información (nunca "mantener presionado").
- Sin scroll horizontal. Objetivos táctiles ≥ 44 px.

## 7. Accesibilidad

- Todo operable con teclado; foco visible.
- Contraste AA en texto.
- Señales y estados nunca solo por color: ícono + texto.
- `prefers-reduced-motion`: sin efectos de parpadeo/escaneo; transiciones por fundido.
- Sonido opcional con botón de silencio; nada crítico depende del audio.
