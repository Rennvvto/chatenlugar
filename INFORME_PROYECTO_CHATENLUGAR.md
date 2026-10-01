# Informe inicial — chatenlugar

Fecha de revisión: 30 de septiembre de 2026.

## Alcance y fuentes revisadas

Se revisó el documento `practica remota.docx`, sus cuatro capturas y las páginas públicas actuales de `chatenlugar.cl`, que corresponde al sistema anterior. El producto a diseñar se llama **chatenlugar**; Amaroestudio es la empresa vinculada al negocio, no el nombre de la plataforma. El documento debe entenderse como contexto de negocio, no como una especificación cerrada: describe una plataforma de colecciones, compra/venta mediante pujas y chat, asociada a poleras temáticas coleccionables. No define roles, reglas de negocio, pagos ni criterios de éxito.

No se revisó el código PHP, la base de datos, el hosting ni la lógica privada; por tanto, no se puede afirmar cómo se guardan cuentas, contraseñas, pujas o mensajes.

## Requisitos de negocio confirmados

Posteriormente, la jefatura confirmó las siguientes definiciones. Estas reemplazan las interpretaciones iniciales hechas a partir de las capturas:

**Identidad del sistema:** chatenlugar es la plataforma. Amaroestudio es la empresa. HOLA es una campaña de ejemplo y no la página principal ni la identidad general del producto.

| Concepto | Definición confirmada |
| --- | --- |
| Campaña | Sección del buscador tipo diccionario —por ejemplo, HOLA, Hamburguesas, Sushi o Pizza— que contiene salas de chat y una configuración de turnos de puja. |
| Colección | Espacio donde una persona inscrita conserva y muestra sus activos de Amaroestudio. No existe reventa secundaria de los elementos de la colección. A futuro cada usuario podrá inscribir otras colecciones, como tazos, billetes y monedas. |
| Producto | Polera Temática Coleccionable o Fardo de Poleras Temáticas. Son los artículos mostrados en publicaciones y campañas. |
| Plataforma | Plataforma de trabajo: las personas inscritas participan comprando o vendiendo. |
| Puja | La campaña avanza letra por letra y por turnos deterministas. Cada usuario sabe en qué número de puja podrá comprar o vender según esa campaña; por ejemplo, una venta se habilita en la puja 5.000. Las pujas hacen avanzar los turnos y las personas ven publicidad durante el proceso. |
| Ganancia | La persona recibe un porcentaje de poleras vendidas, financiado con publicidad y ventas de Poleras Temáticas. No hay tope de pago. La comisión del vendedor de una polera perteneciente a un fardo depende de la regla de “Marcha Blanca” y de la calidad de comentarios de usuarios adheridos a la campaña. El titular de un fardo recibe una ganancia personalizada por calidad de información y tiempo antes de pedir impresión. |
| Impresión y despacho | El usuario decide cuándo solicitar la impresión de su Polera Temática. Desde esa solicitud, el despacho debe realizarse dentro de 15 días; este plazo no comienza con la compra. |
| Navegación | El navegador trabaja como diccionario, con el recorrido: Tarjeta coleccionable en blanco → Tarjeta coleccionable de Mazo Temático → Polera Temática Coleccionable → Productos. |

El flujo base queda así:

`Navegar el diccionario` → `entrar a una campaña` → `avanzar letra a letra hasta el turno asignado` → `comprar/vender` → `registrar en colección y devengar ganancia según tipo de producto` → `solicitar impresión` → `despacho en un máximo de 15 días`.

### Regla de ganancia, impresión y despacho

La compra y la impresión deben modelarse como eventos distintos. Al comprar, el usuario obtiene una posición en su colección asociada a la polera y queda habilitado para solicitar su impresión. La posición de colección no se puede revender. Al solicitar impresión, se debe calcular y congelar la ganancia que corresponda según la política vigente, crear la orden de impresión y comenzar el plazo de despacho de 15 días. No se debe marcar una polera física como impresa o despachada antes de esa solicitud.

La ganancia debe calcularse exclusivamente en el servidor y quedar auditada: evento de publicidad o venta que la originó, campaña/letra asociada, tipo de producto, porcentaje aplicable, regla de Marcha Blanca, puntajes de calidad, monto generado, beneficiario, fecha de devengo y pago. Nunca se debe calcular solo en la interfaz. La política tiene al menos dos variantes: `comisión de vendedor de polera de fardo = regla Marcha Blanca + calidad de comentarios`; y `ganancia de titular de fardo = calidad de información + tiempo hasta solicitar impresión`. Los coeficientes, escalas y porcentajes aún deben ser entregados por negocio.

La contradicción de plazos quedó resuelta: el plazo de despacho comienza cuando el usuario solicita la impresión, no cuando compra. La plataforma debe guardar `fechaSolicitudImpresion`, calcular `fechaLímiteDespacho = fechaSolicitudImpresion + 15 días` y avisar tanto al usuario como al responsable del despacho.

No se ha confirmado si pedir impresión detiene definitivamente la acumulación de ganancia; se debe declarar como regla antes de la implementación. Es la interpretación más coherente con que una mayor espera genere una mayor ganancia.

La fuente de la ganancia ya está definida: publicidad y venta de poleras. Falta formalizar qué porcentaje recibe cada usuario, qué publicidad/venta se atribuye a cada campaña o letra, cómo se ponderan los puntajes de calidad, cuándo se paga y quién financia el pago. “Marcha Blanca” debe existir como una política versionada y parametrizable, nunca como una regla escrita a mano en el código. Al no existir tope, se necesita un libro mayor de movimientos y un proceso de liquidación; una cifra mostrada en pantalla no basta.

Las visualizaciones de publicidad deben registrarse como eventos verificables y con controles contra duplicación o fraude. La ganancia no puede aumentar solo porque el navegador recarga una página; el sistema debe definir qué impresión publicitaria es válida y mantener trazabilidad del ingreso que financia cada reparto.

Por diseño, comprar un activo y recibir una ganancia creciente solo por esperar se parece a una mecánica de rentabilidad, no a un descuento de e-commerce. Eso no determina por sí solo su clasificación jurídica, pero obliga a validar el modelo con asesoría legal, tributaria y contable antes de lanzar, usar términos como “rentabilidad” o prometer montos. La CMF describe la rentabilidad como la capacidad de un instrumento de generar ganancias o rendimiento futuro y advierte que los retornos no deben presentarse como asegurados sin sustento.[^cmf-rentabilidad]

[^cmf-rentabilidad]: [CMF Educa — ¿En qué instrumentos invertir en el mercado de valores?](https://www.cmfchile.cl/educa/621/w3-article-518.html) y [CMF — consejos para invertir](https://cmfchile.cl/portal/prensa/625/w4-article-24070.html). Referencias informativas, no asesoría legal.

### Mecánica de puja letra a letra y por turnos

Esta regla ya no se interpreta como probabilidad ni como subasta de mayor precio. Cada campaña recorre sus letras secuencialmente —por ejemplo, `H` → `O` → `L` → `A`— y configura hitos de compra/venta. Cada usuario conoce su turno objetivo: cuando el contador de pujas de la campaña alcanza ese número, se habilita la operación correspondiente. Por ejemplo, un usuario configurado para vender en la puja 5.000 ve ese hito antes de alcanzarlo.

El modelo técnico debe guardar una asignación inmutable por usuario: `CampaignTurnAssignment { campaña, letra, usuario, acción, númeroDePujaObjetivo }`. Cada puja válida incrementa el contador de forma transaccional; al llegar a un hito, el backend crea la oportunidad o venta y notifica a la persona. Esto permite reconstruir el resultado completo de una campaña.

Antes de construirla, faltan estas decisiones ejecutables:

1. Si el contador de pujas es global para la campaña, por letra o individual por usuario; y cuántas pujas puede registrar una persona por letra.
2. Qué requisito o pago habilita una puja, cómo se evita duplicarla y qué ocurre si el usuario no ejecuta su compra/venta cuando llega su turno.
3. Cómo se resuelven varios hitos en el mismo número, falta de stock, cancelaciones, pausas de campaña y cambios de campaña.
4. Qué significa exactamente que el usuario “vende” sin reventa secundaria: venta de stock publicado por Amaroestudio, comisión por intermediar o una operación diferente.

### Navegación de diccionario y colecciones

La navegación declarada se modela como una jerarquía navegable: `Tarjeta coleccionable en blanco` → `Tarjeta de Mazo Temático` → `Polera Temática Coleccionable` → `Productos`. La campaña es un nodo del diccionario con letras, salas y reglas de turnos; no una página aislada.

El MVP debe concentrarse en Poleras Temáticas y Fardos. Sin embargo, el modelo debe permitir nuevos tipos de colección inscritos por usuarios —tazos, billetes, monedas y otros— mediante una entidad extensible `CollectibleType`, sin mezclar sus reglas de negocio con las de las poleras mientras no estén aprobadas.

## Diagnóstico del producto actual

La idea tiene una base interesante: un marketplace temático donde la conversación, la identidad de la campaña y la oferta competitiva pueden hacer la compra más entretenida. El problema principal no es PHP por sí mismo: es que la propuesta de producto, la jerarquía visual y las reglas del marketplace todavía están mezcladas y poco definidas.

### Funcionalidad visible

| Área | Estado observado | Lectura |
| --- | --- | --- |
| Inicio | Dos accesos, `USUARIO` y `EMPRESA`; el segundo no muestra flujo visible. | No queda claro qué obtiene cada tipo de persona. |
| Registro e inicio de sesión | Formularios PHP tradicionales de correo/contraseña. | Base correcta, pero necesita validación, recuperación de cuenta, seguridad y mensajes de error claros. |
| Explorador | Buscador con cuatro campañas/productos cargados en JavaScript y navegación por `id`. | Es una demostración, no un catálogo escalable ni filtrable. |
| Sala/campaña | La captura autenticada muestra datos de producto, monto, menú lateral y chat. La visita pública a la URL redirige al login. | Hay intención de combinar comunidad, inventario y transacción, pero el objetivo de cada panel no se entiende. |
| Sección futura | La ruta de lugares muestra “Trabajo en progreso”. | Conviene retirarla de navegación hasta que exista una propuesta real. |

### Problemas de experiencia y diseño

- El lenguaje visual parece una maqueta inicial: fondos planos, tipografías por defecto, demasiado espacio vacío y textos técnicos mezclados con nombres de negocio.
- La pantalla de sala intenta mostrar demasiadas cosas a la vez: chat, campaña, producto, montos, menú y datos de empresa compiten entre sí.
- El CSS público usa posiciones absolutas y tamaños fijos. Eso dificulta que las vistas funcionen bien en móvil y en pantallas pequeñas.
- Los formularios usan el placeholder como etiqueta y no presentan una jerarquía accesible ni ayuda contextual suficiente.
- En las capturas, los nombres `producto`, `campaña`, `marca temática`, `dominio`, `lugar`, `divisa` y `acción bursátil` parecen parte de un mismo modelo. Las definiciones de negocio ya aclaran campaña, colección y producto; faltan definiciones para los términos restantes o deben desaparecer de la nueva interfaz.
- Aunque internamente se hable de “activos” o “trading”, la interfaz pública debe explicar que se comercian poleras temáticas coleccionables. No se debe sugerir inversión financiera si no existe ese servicio regulado.

## Decisión de producto recomendada

No conviene “modernizar las pantallas PHP”. Conviene reconstruir el producto preservando la intención, no el código ni el diseño actual.

La primera definición debería ser:

> **chatenlugar, plataforma de trabajo y colecciones:** una persona inscrita muestra su colección, descubre campañas del diccionario, conversa en sus salas y compra o vende Poleras Temáticas Coleccionables vinculadas al negocio de Amaroestudio, bajo reglas de puja claras.

Una versión mínima no debería intentar ser a la vez red social, bolsa de valores, e-commerce, CMS para empresas y chat general. Primero debe resolver bien descubrimiento, ficha de artículo, puja y conversación contextual.

## Arquitectura propuesta

| Capa | Propuesta | Motivo |
| --- | --- | --- |
| Frontend | React + Vite + TypeScript, React Router, TanStack Query y Tailwind CSS con componentes accesibles. | Interfaz rápida, modular y sencilla de desplegar. |
| Backend | Node.js + TypeScript + Fastify, Zod para validar entradas y OpenAPI para documentar la API. | API pequeña, tipada y apta para chat y operaciones de puja. |
| Datos | PostgreSQL en Railway + Drizzle ORM. | Datos relacionales y transacciones confiables para pujas, ventas y auditoría. |
| Tiempo real | Socket.IO en el backend; Redis solo cuando haya más de una instancia. | Chat y actualizaciones de ofertas en vivo sin complejidad prematura. |
| Archivos | Almacenamiento S3 compatible (por ejemplo, R2), no el disco de Railway. | Las imágenes de productos deben ser persistentes y escalables. |
| Autenticación | Sesiones en cookies `HttpOnly`/`Secure`, contraseñas con Argon2id, verificación de correo y recuperación de contraseña. | Mejor base de seguridad que manejar tokens en `localStorage`. |
| Operación | Monorepo `pnpm`: `apps/web`, `apps/api` y paquetes compartidos. Railway para web, API y PostgreSQL; GitHub para CI. | Un solo repositorio y despliegues reproducibles. |

Railway es una buena opción para la primera etapa: se pueden separar los servicios de frontend, API y PostgreSQL, usar variables de entorno por ambiente y desplegar desde GitHub. No se deben guardar imágenes, secretos ni sesiones en el sistema de archivos del contenedor.

## Modelo de datos inicial

Antes de escribir código hay que validar la taxonomía. Como base, propondría:

`User` → `Collection` → `CollectionEntry` → `PrintRequest` → `Shipment`

El diccionario se modela en paralelo: `DictionaryNode` → `BlankCollectibleCard` → `ThemedDeckCard` → `Campaign` → `CampaignLetter`.

El motor por turnos se modela como `Campaign` → `CampaignLetter` → `CampaignTurnAssignment` → `BidEvent` → `Purchase/SaleOpportunity` → `Product` → `Purchase`. Cada asignación guarda acción (`BUY`/`SELL`), número objetivo y su estado.

Además se requieren `ProductType` (Polera/Fardo), `CollectibleType` (extensible), `AdImpressionEvent`, `AdRevenueEvent`, `SaleRevenueEvent`, `EarningsPolicyVersion`, `QualityScore`, `EarningsAllocation`, `EarningsLedger`, `Payout`, `Notification`, `ShipmentTracking` y un registro de eventos inmutable para pujas, hitos de turno, oportunidades, ventas, ganancias, solicitudes de impresión y despachos. Una publicación debe guardar campaña, letra/serie si aplica, producto/fardo, stock, responsable de venta y estado. Cada puja, hito, asignación de oportunidad y ganancia debe validarse y guardarse en una transacción de base de datos; el cliente nunca debe decidir el resultado ni su saldo.

## Pantallas del MVP

1. Inicio: explicar que es una plataforma de compra/venta de poleras coleccionables y llamar a crear cuenta.
2. Navegador de diccionario: recorrido visual Tarjeta en blanco → Mazo Temático → Polera Temática → Productos; búsqueda de campañas y acceso a sus salas.
3. Sala de campaña: conversación, publicidad identificada, letra actual, contador de pujas y próximos hitos del usuario.
4. Ficha de polera o fardo: fotos, campaña, letra/serie si aplica, stock, reglas de turno, comisión o ganancia aplicable e historial verificable.
5. Flujo de pujas: contador en tiempo real, turno objetivo conocido (`ej.: venta en puja 5.000`), registro de participaciones y resultado auditable.
6. Perfil/colección: colección pública del usuario, entradas de Polera/Fardo, participaciones, compras, ventas y libro de ganancias devengadas/pagadas.
7. Solicitud de impresión: mostrar ganancia vigente, política aplicada, fecha de cálculo y confirmación antes de congelarla e iniciar el plazo de despacho.
8. Panel de operación: publicar poleras/fardos, controlar inventario/seriado, asignaciones de turno, solicitudes de impresión y despachos.
9. Panel administrativo mínimo: diccionario, campañas, reglas de Marcha Blanca, puntajes de calidad, moderación de chat/comentarios, usuarios, políticas de ganancia y vencimientos de despacho.

## Reglas que deben definirse antes del módulo de pujas

- Se venden Poleras Temáticas y Fardos de Poleras Temáticas; falta definir quién los produce/publica, stock por campaña/letra, seriado y si el usuario “vende” una polera propia o recibe una oportunidad de venta administrada por Amaroestudio.
- Quién puede publicar y qué distingue a comprador, vendedor, empresa y administrador. “Plataforma de trabajo” no debe confundirse con una relación laboral sin una definición legal y operativa.
- El contador de puja: alcance exacto del contador, requisitos/costo de cada puja, asignación de turnos de compra/venta, vencimiento de un turno y resolución de falta de stock o cancelación.
- Fórmulas de ganancia: comisión de polera de fardo por Marcha Blanca y calidad de comentarios; ganancia personalizada de fardo por calidad de información y tiempo de impresión; porcentaje de cada factor, fuente de ingresos, moneda y frecuencia/liquidación de pago.
- Definición de “Marcha Blanca” y de los puntajes de calidad: criterios observables, responsables de evaluación, peso de comentarios de usuarios adheridos, apelación, detección de colusión y versión de la regla aplicada.
- Eventos de publicidad válidos, consentimiento/privacidad, atribución de ingreso y controles contra impresiones falsas o repetidas.
- Precio, duración de cada letra, cancelaciones, stock/seriado y límites de participación que eviten que una sola persona monopolice los turnos.
- Si habrá pagos reales, despacho, facturación y devoluciones. Eso incorpora requisitos legales, contables y de prevención de fraude que no deben dejarse para el final.
- Acumulación de ganancia: si se detiene al pedir impresión, condiciones de pérdida/cancelación, comprobantes de cálculo y reglas de liquidación de pagos.
- Despacho: comienza al solicitar impresión; se debe mostrar fecha límite de 15 días, número de seguimiento, alertas, incumplimientos y reembolsos.
- Las colecciones futuras de tazos, billetes y monedas deben tratarse como una fase posterior: se define qué puede inscribir un usuario, cómo se autentica y si comparten o no reglas de pujas/ganancias con las poleras.
- Qué significa “chat”: chat de comunidad, conversación con vendedor o ambas cosas; y qué reglas de moderación tendrá.

## Hoja de ruta de reconstrucción

| Etapa | Entregable | Resultado |
| --- | --- | --- |
| 0. Descubrimiento | Mapa de roles, reglas, inventario de contenido y prototipo navegable. | Evita construir sobre conceptos ambiguos. |
| 1. Fundaciones | Monorepo, diseño base, PostgreSQL, autenticación, roles y despliegue de pruebas. | Plataforma segura sobre la que iterar. |
| 2. Catálogo | Campañas, artículos, imágenes, buscador, ficha y panel de publicación. | Producto navegable y administrable. |
| 3. Motor comercial | Pujas por letra, asignación verificable de oportunidades, libro mayor de ganancias y simulación de liquidaciones. | Núcleo económico auditable. |
| 4. Comunidad | Chat en tiempo real, permisos, moderación y alertas. | Conversación útil y contextual. |
| 5. Salida | Integración de pagos una vez aprobada, migración de datos, pruebas móviles/accesibles, respaldos, monitoreo y dominio. | Lanzamiento controlado. |

## Migración desde PHP

No recomendaría una migración parcial página por página. El camino más seguro es desarrollar el nuevo sistema en un subdominio de pruebas, con datos de prueba, y migrar solo datos validados cuando el MVP esté aprobado.

1. Obtener acceso de solo lectura al repositorio PHP, esquema y respaldo de base de datos.
2. Inventariar cuentas, campañas, productos, imágenes y reglas que realmente estén en uso.
3. Diseñar un script de importación repetible y probarlo en staging.
4. Congelar escrituras brevemente en el sistema antiguo, ejecutar la importación final, verificar conteos y recién cambiar el dominio.

Las contraseñas requieren atención especial: solo se migran hashes compatibles y seguros. Si no lo son, se debe activar un flujo de restablecimiento de contraseña; nunca mover contraseñas en texto plano.

## Riesgos y prioridades

Las mayores incertidumbres son el algoritmo que transforma pujas por letra en opciones reales de compra/venta y la fórmula que reparte ingresos de publicidad/ventas sin tope de pago. Campaña, colección, producto y plazo de despacho ya están definidos; esas dos reglas deben formalizarse antes de diseñar base de datos o interfaz final. Sin ellas, un diseño bonito puede terminar siendo una interfaz para reglas incorrectas.

La prioridad correcta es: **definir el algoritmo de pujas y reparto → diseñar y validar el MVP → construir el libro mayor y la base segura → agregar chat en tiempo real → integrar pagos aprobados**.

## Conclusión

React, Node.js y Railway son una dirección mucho más adecuada para llevar esta idea a un producto mantenible. La oportunidad no es hacer una versión visualmente más limpia de la página actual, sino convertir una interfaz experimental en un marketplace de coleccionables claro, móvil, seguro y coherente.

La recomendación concreta es partir por un MVP de diccionario de campañas + progreso letra a letra + ficha de polera + puja con reglas explícitas + libro mayor de ganancias, usando React/TypeScript en el cliente, Fastify/TypeScript en la API y PostgreSQL en Railway. El primer entorno puede simular la liquidación, pero los pagos reales no pueden entrar a producción hasta que la fórmula, fuente de fondos, operación y requisitos legales estén aprobados; son parte central del producto, no un añadido posterior.
