# Seguimiento de chatenlugar

## Estado real al 8 de octubre de 2026

| Fase | Estado | Evidencia |
| --- | --- | --- |
| 1. Base fullstack y visual | Integrada | PR #1 fusionado en `main` (`b931b42`) |
| 2. Railway y PostgreSQL | Integrada y desplegada | PR #2 fusionado en `main` (`c233a3e`); API pública activa |
| 3. React con API real | Integrada | PR #3 fusionado en `main` (`f8bb70f`) |
| 4. Navegación funcional | Integrada | PR #4 fusionado en `main` (`6e6cdcb`) |
| 5. Campañas y trabajo por turnos | Integrada | PR #5 fusionado en `main` (`2d9fce8`) |
| 6. Notificaciones | Integrada | PR #6 fusionado en `main` (`74b0eb2`) |
| 7. Comunidad y explorar | Integrada y desplegada | PR #7 fusionado en `main` (`24680e7`) |
| 8. Tienda y pedidos | En revisión | Rama `phase-8-store-orders`, commit `acf66d0`; despliegue Railway `a3aac73c` exitoso |
| 9 a 10 | Pendientes | Se ejecutarán como fases y PR independientes |

## Despliegue actual

- API: `https://api-production-abc38.up.railway.app`
- Salud: `/api/health` responde `ok` con PostgreSQL conectado.
- Credenciales y variables: administradas exclusivamente en Railway.
- La Fase 8 agrega pedidos en estado `pending_payment`; no existe proveedor ni credencial de pago configurados, por lo que el sistema no simula pagos aprobados.

## Próxima acción

Abrir, revisar y fusionar el PR de la Fase 8; luego iniciar administración y reglas en una rama nueva desde `main`.
