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
| 8. Tienda y pedidos | Integrada; activación de Flow en curso | PR #8 fusionado en `main` (`9d5efa9`). PR #16 agrega Flow con confirmación servidor-a-servidor y pagos reales pendientes de desplegar y configurar. |
| 9. Administración y reglas | Integrada y desplegada | PR #9 y ampliación administrativa PR #14 fusionados; autorización, auditoría y operaciones de campañas, productos y turnos disponibles. |
| 10. Pruebas, seguridad y publicación | Integrada y desplegada | PR #10 fusionado en `main` (`0bdbc78`); Railway `848d3923` exitoso |

## Despliegue actual

- Aplicación pública y API: `https://api-production-abc38.up.railway.app`
- Salud: `GET /api/health` responde `ok` con PostgreSQL conectado.
- El frontend compilado se sirve desde el mismo servicio y origen que la API.
- Credenciales y variables: administradas exclusivamente en Railway.

## Activación de Flow

- PR #16: `https://github.com/Rennvvto/chatenlugar/pull/16`.
- Crea pagos en pesos chilenos, valida el monto y el pedido, y marca un pedido como pagado únicamente después de consultar la confirmación de Flow desde el servidor.
- Los callbacks duplicados no duplican pagos ni notificaciones; la creación de una sesión se bloquea por pedido para impedir cobros concurrentes.
- Variables requeridas en Railway: `FLOW_API_KEY`, `FLOW_SECRET_KEY`, `FLOW_ENV=production` y `PUBLIC_APP_URL=https://api-production-abc38.up.railway.app`.
- Ninguna credencial se incluye en este repositorio, commits ni archivos de configuración.

## Validaciones pendientes de esta activación

- Compilación React y validación sintáctica de la API antes de fusionar PR #16.
- Revisión automática de GitHub cuando esté disponible.
- Confirmación de salud después del despliegue y una compra controlada con un producto real habilitado. No se simulan pagos aprobados.

## Dependencias externas pendientes

- Administración: se requiere una cuenta real de empresa identificada para asignar el rol administrativo inicial.
- Reglas comerciales: faltan definiciones aprobadas de pujas, comisiones y ganancias. La configuración está intencionalmente inactiva.
- Dominio propio: se requiere acceso al proveedor DNS para conectar `chatenlugar.cl`; mientras tanto la publicación usa el dominio de Railway.
- Railway mantiene compatibilidad temporal con `railway.json` y avisa su futura deprecación. La aplicación sigue desplegando correctamente; migrar a su formato IaC cuando la CLI de Windows pueda evaluarlo de forma fiable.

## Siguiente acción

Completar la revisión de PR #16, fusionarlo, configurar las variables protegidas de Flow en Railway, desplegar y comprobar el flujo de pago con una compra controlada.
