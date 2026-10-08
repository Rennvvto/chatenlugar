# Validación final de chatenlugar

## Controles automatizados

- `npm run build`: compilación de React y estilos.
- `npm run check:api`: sintaxis del servidor principal.
- Comprobación de sintaxis de cada módulo JavaScript bajo `server/` con `node --check`.
- `npm audit --omit=dev`: dependencias de producción sin vulnerabilidades conocidas después de la actualización de seguridad de la Fase 10.
- `git diff --check`: sin errores de espacios al cierre de cada fase.

## Recorridos de API publicados

Se comprueban sin crear cuentas, publicaciones, pedidos ni pagos ficticios:

- Salud de PostgreSQL: `GET /api/health`.
- Campañas y exploración: `GET /api/campaigns`, `GET /api/explore`.
- Catálogo: `GET /api/store/products`.
- Aislamiento: pedidos y administración sin sesión devuelven `401`.

## Seguridad aplicada

- Encabezados HTTP mediante Helmet y ocultamiento de `X-Powered-By`.
- Límite general de solicitudes y límite estricto para autenticación.
- Validación de payloads con Zod, consultas parametrizadas y roles confirmados desde PostgreSQL.
- Secretos fuera del repositorio: Railway administra `DATABASE_URL` y `JWT_SECRET`.
- El frontend se sirve desde el mismo origen que la API en producción; no se expone una URL de API distinta en el cliente desplegado.

## Límites externos

- Pago: no se configura ni simula un proveedor. Los pedidos permanecen pendientes de pago.
- Administración: hace falta identificar una cuenta real de empresa para promoverla al rol administrativo inicial.
- Dominio: no hay credenciales DNS disponibles; se publica en el dominio de Railway.
