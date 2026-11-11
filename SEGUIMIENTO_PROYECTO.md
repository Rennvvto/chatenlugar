# Seguimiento de chatenlugar

## Estado real al 13 de octubre de 2026

| Fase | Estado | Evidencia |
| --- | --- | --- |
| 1. Base fullstack y visual | Integrada | PR #1 fusionado en `main` (`b931b42`) |
| 2. Railway y PostgreSQL | Integrada y desplegada | PR #2 fusionado en `main` (`c233a3e`) |
| 3. React con API real | Integrada | PR #3 fusionado en `main` (`f8bb70f`) |
| 4. Navegación funcional | Integrada y completada | PR #4 y corrección de Colecciones en PR #12 fusionados en `main` |
| 5. Campañas y trabajo por turnos | Integrada | PR #5 fusionado en `main` (`2d9fce8`) |
| 6. Notificaciones | Integrada | PR #6 fusionado en `main` (`74b0eb2`) |
| 7. Comunidad y explorar | Integrada y desplegada | PR #7 fusionado en `main` (`24680e7`) |
| 8. Tienda y pedidos | Integrada y pagos Flow activos | PR #8 fusionado en `main` (`9d5efa9`) y PR #16 fusionado (`911f823`). Flow está configurado y desplegado en producción. |
| 9. Administración y reglas | Integrada y desplegada | PR #9 y ampliación administrativa PR #14 fusionados; autorización, auditoría y operaciones de campañas, productos y turnos disponibles. |
| 10. Pruebas, seguridad y publicación | Integrada y desplegada | PR #10 fusionado en `main` (`0bdbc78`); Railway `848d3923` exitoso |

## Despliegue actual

- Aplicación pública y API: `https://api-production-abc38.up.railway.app`
- Salud: `GET /api/health` responde `ok` con PostgreSQL conectado.
- El frontend compilado se sirve desde el mismo servicio y origen que la API.
- Credenciales y variables: administradas exclusivamente en Railway.

## Activación de Flow

- PR #16 fusionado: `https://github.com/Rennvvto/chatenlugar/pull/16` (`911f823`).
- Crea pagos en pesos chilenos, valida el monto y el pedido, y marca un pedido como pagado únicamente después de consultar la confirmación de Flow desde el servidor.
- Los callbacks duplicados no duplican pagos ni notificaciones; la creación de una sesión se bloquea por pedido para impedir cobros concurrentes.
- Variables protegidas configuradas en Railway: `FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_ENV=production` y `PUBLIC_APP_URL=https://api-production-abc38.up.railway.app`.
- Ninguna credencial se incluye en este repositorio, commits ni archivos de configuración.

## Validaciones de esta activación

- Compilación React, validación sintáctica de la API y revisión de diff superadas antes de fusionar PR #16.
- Despliegue Railway `21768863-4b42-4b38-8669-2c44072ad1ef` exitoso el 13 de octubre de 2026.
- `GET /api/health` responde `200` con PostgreSQL conectado.
- La ruta de pago exige autenticación (`401` sin sesión), por lo que no expone pedidos ajenos.
- Pendiente: una compra controlada con un producto real habilitado. No se simulan pagos aprobados.

## Dependencias externas pendientes

- Administración: se requiere una cuenta real de empresa identificada para asignar el rol administrativo inicial.
- Reglas comerciales: faltan definiciones aprobadas de pujas, comisiones y ganancias. La configuración está intencionalmente inactiva.
- Dominio propio: se requiere acceso al proveedor DNS para conectar `chatenlugar.cl`; mientras tanto la publicación usa el dominio de Railway.
- Railway mantiene compatibilidad temporal con `railway.json` y avisa su futura deprecación. La aplicación sigue desplegando correctamente; migrar a su formato IaC cuando la CLI de Windows pueda evaluarlo de forma fiable.

## Siguiente acción

Habilitar un producto real y ejecutar una compra controlada de bajo monto para validar el ciclo completo de Flow, retorno y confirmación servidor-a-servidor.

## Actualización visual del espacio de trabajo

- Estado: integrado y desplegado mediante PR #19 (`ee0e03b`).
- Alcance: Campañas, Equipo, Explorar, Tienda y Mi perfil comparten ahora la misma estructura aprobada: lienzo blanco, fondo azul, barra superior, navegación lateral y acciones coral.
- Funciones preservadas: búsqueda contra API, publicaciones y comentarios, pedidos y pago Flow, solicitud de impresión, edición de perfil y cambio de contraseña.
- Validaciones: compilación React, sintaxis de API, revisión de diff y cinco rutas locales correctas. Railway `d67efcf1-f2fa-486e-a920-17c33df6f418` quedó en línea; la URL pública, `/api/health` y los recursos JavaScript/CSS responden `200` con los tipos de contenido correctos.

## Campañas: letras, textos y pujas

- Estado: integrado y verificado en producción mediante PR #22 (`cd048fe`).
- Alcance: textos configurables por letra, una puja por persona y letra, límite predeterminado de cinco pujas, revelación del texto ganador y avance seguro a la siguiente letra.
- Chat: cada texto seleccionado desbloquea un chat personalizado; las pujas y mensajes quedan registrados como interacciones de esquirlas, sin asignar valores monetarios.
- Empates: quedan bloqueados para una resolución administrativa auditada; no se aplica un desempate inventado.
- Reglas: las referencias de 1.000 esquirlas, comisiones de poleras y fardos se guardan como configuración inactiva hasta recibir una fórmula comercial aprobada.
- Producción: `GET /api/campaigns/hola/letter-chat` responde `200` con la letra H, tres opciones de texto y el límite de cinco pujas.
- Cuenta administrativa: `Joseamaro22@gmail.com` aún no existe en PostgreSQL. Debe registrarse antes de asignarle el rol de administración.

## Frontend según el PDF del CEO (2 de noviembre de 2026)

- Alcance: el frontend anterior se retiró y se reemplazó por las tres pantallas del PDF entregado por el CEO: `/`, `/concepto/:termino` y `/crear-usuario`, en `src/lugar/`. El PDF no se versiona porque este repositorio es público.
- Regla de trabajo: el frontend sigue literalmente los PDF, en dibujo y en texto, sin mejoras visuales. Lo que el PDF no define queda pendiente de confirmación.
- Retirado: pantallas de perfil, tienda, pedidos y pago, comunidad, colecciones, notificaciones, administración y espacio de campaña. La API y PostgreSQL siguen activos; esas pantallas vuelven cuando lleguen sus PDF.
- Límite actual: el PDF no dibuja dónde se ingresan correo y contraseña, por lo que no se puede iniciar sesión ni comprar desde la web.
- Datos: las campañas y las opciones de tarjeta vienen de la API. Los nodos y las fichas son el ejemplo del PDF: sus campos van vacíos y el ocultamiento de información no está conectado a las compras.
- Datos iniciales: se agrega la campaña `PIXEL` porque aparece en el PDF.
- Publicación: el servicio se despliega con `railway up`; fusionar en `main` no publica por sí solo.
- Dominio: `chatenlugar.cl` sigue sirviendo el sitio PHP anterior hasta mover el DNS.

## Segundo PDF del CEO (10 de noviembre de 2026)

- Alcance: el PDF trae 14 pantallas. La 12 es igual a `/concepto/:termino` y no cambia. Las demás reemplazan o agregan:
  - `/`: portada del visitante, solo con el buscador y la firma By/AMAROESTUDIO.
  - `/buscar/:termino`: mapamundi con los nodos de lugares y la lista de campañas. Se llega buscando o eligiendo una campaña en el buscador; cada nodo abre `/concepto/:termino`.
  - `/crear-usuario` a `/crear-usuario/9`: los nueve pasos que abre INGRESAR, desde SELECCIONAR LUGAR hasta CREAR HEXÁGONO. Las flechas `<` y `>` del panel avanzan y retroceden, y el último paso lleva a `/by/usuario`.
  - `/by/:usuario`: página del usuario inscrito. Reemplaza el diseño anterior de `/crear-usuario`.
  - `/usuario`: lista MIS CONCEPTOS INSTANTE y demás. El PDF no dice cómo se llega; por ahora solo se abre con la dirección.
- Método: cada pantalla tiene una capa SVG generada desde el PDF, con los dibujos y el texto en fuentes con licencia (Sathu, Myriad Pro). El texto en PT Sans queda como texto real. Comparadas con el PDF en un navegador, las 14 pantallas no tienen desplazamiento; las diferencias restantes, de 0,2 % a 1,2 %, son el suavizado de las letras.
- Notas dentro del dibujo: textos como "ACA PONER TODOS LOS PRODUCTOS...", "DRAG AND DROP" o "SCROLL INFINITO CON CAMPANAS CREADAS" están dentro del marco, así que se muestran tal cual. El scroll infinito de las barras de campañas sí funciona.
- Pendiente de dibujo: escribir un lugar nuevo, elegir la tarjeta en blanco, arrastrar productos a la tienda, editar y guardar el monto de esquirla, los nodos con letra de sugerencia de `/by/usuario`, el menú MIS ..., las flechas de USUARIO y la pantalla para ingresar correo y contraseña. Los campos siguen vacíos y nada se guarda en la base de datos.
