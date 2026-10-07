# Backend de chatenlugar

La aplicación ahora dispone de una API Node.js preparada para PostgreSQL. El frontend continúa en React/Vite y la API se ejecuta en el puerto `3001`.

## Módulos ya preparados

- Registro, inicio de sesión y token de acceso firmado.
- Perfil y cambio de contraseña.
- Búsqueda y detalle de campañas.
- Notificaciones leídas/no leídas.
- Esquema inicial para turnos de trabajo, actualizaciones, colecciones, tienda y pedidos.

## Desarrollo local

1. Copia `.env.example` como `.env` y define una base de datos PostgreSQL local en `DATABASE_URL`.
2. Ejecuta `server/database/schema.sql` y luego `server/database/seed.sql` en esa base de datos.
3. Inicia la API con `npm run dev:api`.
4. En otra terminal inicia el frontend con `npm run dev`.

Comprueba la conexión en `http://127.0.0.1:3001/api/health`.

## Railway

En Railway se creará un servicio PostgreSQL y un servicio Node para esta API. Sus variables mínimas son `DATABASE_URL`, `JWT_SECRET`, `CLIENT_ORIGIN`, `NODE_ENV=production` y `PORT`. `DATABASE_URL` debe ser la referencia interna de PostgreSQL que entrega Railway; nunca se sube al repositorio.

La siguiente etapa será conectar la interfaz React con los endpoints de acceso y perfil, eliminando definitivamente el almacenamiento de cuentas en el navegador.
