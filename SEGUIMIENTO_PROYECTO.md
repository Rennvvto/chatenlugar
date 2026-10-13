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

- Estado: rediseño en curso en la rama `redesign-unified-workspace`.
- Alcance: Campañas, Equipo, Explorar, Tienda y Mi perfil comparten ahora la misma estructura aprobada: lienzo blanco, fondo azul, barra superior, navegación lateral y acciones coral.
- Funciones preservadas: búsqueda contra API, publicaciones y comentarios, pedidos y pago Flow, solicitud de impresión, edición de perfil y cambio de contraseña.
- Validaciones locales: compilación React, sintaxis de API y revisión de diff correctas. Pendiente: PR, despliegue Railway y revisión final desde la URL pública.
