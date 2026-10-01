# Propuesta de vista de usuario — chatenlugar

Fecha: 1 de octubre de 2026.

## Objetivo

Rediseñar la experiencia posterior al inicio de sesión para que una persona entienda, en pocos segundos, tres cosas: en qué campaña está participando, cuál es su próxima acción y qué Polera Temática está vinculada a esa campaña. La interfaz no debe parecer un foro antiguo ni mezclar sin jerarquía chat, producto, montos y navegación.

La observación actual indica una pantalla con un botón azul `UNIRSE A SALA DE CHAT`, una vista tipo foro al ingresar y un carrusel lateral de una Polera Temática. Se tomará esa funcionalidad como base de producto, pero no se copiará la forma actual de presentarla.

## Hallazgos de la captura autenticada

La captura de `chat_room.php?id=2` permite precisar el diagnóstico. La pantalla actual está construida en tres columnas, pero ninguna responde a una tarea clara del usuario:

- **Columna izquierda:** acumula opciones heterogéneas (`Polera Temática`, `Producto`, `Divisa`, `Campaña`, `Dominio`, textos inscritos, URL, venta y compra/venta) con iconos inconexos. No hay jerarquía, estado activo comprensible ni una separación entre navegación personal, campañas y administración.
- **Centro:** combina el encabezado `DICCIONARIO`, el nombre de campaña `SUSHI`, textos técnicos como “slider informativo”, “chat de producto”, “usuario y actividad bursátil”, un monto diario extremo y un espacio de conversación casi vacío. La frase `BUSCAR SALA DE CHAT ; LUGAR` no explica una acción ni el estado de la campaña.
- **Conversación:** el campo de mensaje está al final, pero el usuario no sabe a qué está aportando, quién puede participar, qué letra está en juego ni qué ocurrirá al enviar el mensaje. Es necesario definir si esto es un chat en vivo, un foro de publicaciones o ambos.
- **Columna derecha:** lista tipos de contenido y muestra una Polera Temática SUSHI, pero la ficha no tiene nombre de producto, precio/estado, campaña asociada, acción ni controles de carrusel reconocibles. Parece un elemento decorativo cuando debería ser una pieza comercial.
- **Lenguaje de negocio:** términos como `actividad bursátil`, `divisa`, `monto diario asignado` y `monto diario recibido` transmiten una operación financiera que no ha sido definida como tal. Deben desaparecer de la vista de usuario hasta contar con reglas legales y de negocio aprobadas.

### Cambio de estructura propuesto

La nueva vista no conservará esas tres columnas rígidas. La reemplazaremos por una jerarquía orientada a tareas:

1. **Barra superior simple:** campañas, colección, productos, notificaciones y perfil.
2. **Resumen de campaña arriba:** nombre, letra actual, avance, próximo turno y una sola acción prioritaria.
3. **Conversación central:** aportes ordenados y editor de mensaje, siempre asociados a la campaña y su regla actual.
4. **Panel contextual adaptable:** producto Amaroestudio, carrusel controlable y reglas o actividad relevante. En móvil se convierte en secciones consecutivas.

El diseño deja de presentar el producto como un “slider informativo” y la conversación como una “sala” aislada: ambos serán partes explícitas de la misma campaña.

## Experiencia a construir

### 1. Inicio de sesión → panel personal

La primera pantalla será un panel de trabajo personal, no una página con bloques desconectados. Tendrá:

- Resumen de la campaña activa: nombre, letra en curso, número de puja y próximo turno del usuario.
- Una acción principal inequívoca: `Ir a la campaña` o `Participar ahora`, según el estado real del usuario.
- Accesos secundarios a campañas, colección, productos y notificaciones.
- Actividad reciente con mensajes, cambios de turno y resultados ordenados por tiempo.

### 2. Campaña → espacio de participación

El botón actual dejará de abrir un foro sin contexto. Abrirá un espacio de campaña con tres zonas claras:

1. **Contexto fijo de campaña:** letra actual, avance, regla de turno y próximo hito del usuario.
2. **Conversación:** mensajes o publicaciones en orden, respuesta contextual, contador de mensajes nuevos y reglas visibles sin ocupar toda la pantalla.
3. **Producto asociado:** Polera Temática o Fardo, con imagen, nombre, detalle y acceso a la ficha completa.

En móvil, estas zonas se apilan y el contexto de campaña queda disponible como una barra compacta. No se usarán columnas apretadas ni información crítica escondida.

### 3. Producto → carrusel útil, no decorativo

Las poleras de Amaroestudio serán un módulo de productos reales:

- Tarjeta principal con foto, campaña, nombre, estado y acción `Ver detalle`.
- Navegación manual con flechas y puntos; el avance automático solo será suave y se pausará al pasar el cursor, enfocar un control o activar reducción de movimiento.
- Cada cambio mostrará qué producto se está viendo; nunca se intercambiarán productos sin control del usuario.
- La ficha de producto mostrará la relación con campaña, letra, disponibilidad, condiciones y, si corresponde, solicitud de impresión.

### 4. Colección y acciones posteriores

La colección mostrará productos obtenidos, estado de impresión y despacho. La solicitud de impresión será una acción separada de la compra: al confirmarla se informará que comienza el plazo de despacho de hasta 15 días y se mostrará la fecha límite calculada por el servidor.

## Principios de interfaz

| Problema actual | Decisión de rediseño |
| --- | --- |
| Botón sin explicar qué ocurrirá | Etiqueta basada en estado y texto de apoyo antes de entrar. |
| Foro desconectado de la compra o puja | Conversación dentro de la campaña, junto a su letra, progreso y producto. |
| Carrusel de una sola polera sin propósito claro | Módulo de producto navegable, con detalle y relación explícita con la campaña. |
| Muchas cajas compitiendo por atención | Una acción principal por estado; el resto queda como información secundaria. |
| Información técnica o comercial difícil de leer | Lenguaje directo: campaña, letra, turno, producto, colección e impresión. |
| Animaciones decorativas que distraen | Movimiento breve para cambios de estado, carrusel y confirmación de acciones; siempre respetando `prefers-reduced-motion`. |

## Flujos prioritarios

1. Usuario inicia sesión → reconoce su campaña y su próximo turno → entra a la campaña.
2. Usuario entra a campaña → lee/participa en la conversación → revisa el producto asociado → abre su ficha.
3. Usuario alcanza un turno → recibe aviso claro → ejecuta o revisa la oportunidad asignada.
4. Usuario compra → ve la entrada en su colección → solicita impresión cuando decide hacerlo → ve el máximo de 15 días desde la solicitud.

## Datos que cada pantalla necesita

La maqueta puede usar datos simulados, pero la interfaz final necesita una fuente real para: campaña y letra actual, contador de pujas, turno asignado, estado de participación, producto asociado, imágenes, disponibilidad, mensajes, mensajes no leídos, productos de colección, solicitud de impresión y fecha límite de despacho.

La ganancia, los porcentajes, el resultado de las pujas y las fechas de despacho se calcularán y validarán en el backend. La vista solo los presenta con una explicación verificable.

## Decisiones que se deben confirmar antes de conectar datos reales

- Si `UNIRSE A SALA DE CHAT` significa entrar libremente, adherirse a una campaña o pagar/aceptar una condición.
- Si la conversación es un foro público, un chat en tiempo real o ambos; y quién puede publicar, responder y moderar.
- Qué cambio activa el carrusel de poleras: selección de campaña, inventario, publicidad u otro criterio.
- Qué datos puede mostrar una persona antes y después de tener un turno asignado.
- Qué estados exactos tendrá un producto: disponible, asignado, comprado, en colección, impresión solicitada, impreso y despachado.

## Fases de ejecución

1. Aprobar una dirección visual de las tres maquetas.
2. Construir en React el panel personal y navegación con datos simulados.
3. Construir el espacio de campaña, conversación y carrusel accesible.
4. Construir ficha de producto, colección y solicitud de impresión.
5. Conectar API, autenticación, datos en tiempo real y reglas aprobadas de puja.

## Criterio de éxito del primer prototipo

Una persona que entra por primera vez debe poder identificar su campaña, entender qué ocurre al presionar la acción principal, abrir la conversación correcta y reconocer la polera asociada sin pedir explicación externa.
