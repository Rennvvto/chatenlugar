# Seguimiento de chatenlugar

## Estado real al 8 de octubre de 2026

| Fase | Estado | Evidencia |
| --- | --- | --- |
| 1. Base fullstack y visual | Integrada | PR #1 fusionado en `main` (`b931b42`) |
| 2. Railway y PostgreSQL | Integrada y desplegada | PR #2 fusionado en `main` (`c233a3e`); API pública activa |
| 3. React con API real | Integrada | PR #3 fusionado en `main` (`f8bb70f`) |
| 4. Navegación funcional | Integrada | PR #4 fusionado en `main` (`6e6cdcb`) |
| 5. Campañas y trabajo por turnos | Integrada | PR #5 fusionado en `main` (`2d9fce8`) |
| 6. Notificaciones | En curso | Rama `phase-6-notifications` |
| 7 a 10 | Pendientes | Se ejecutarán como fases y PR independientes |

## Despliegue actual

- API: `https://api-production-abc38.up.railway.app`
- Salud: `/api/health` responde `ok` con PostgreSQL conectado.
- Credenciales y variables: administradas exclusivamente en Railway.

## Próxima acción

Conectar el centro de notificaciones al backend y comprobar el aislamiento por usuario antes de abrir el PR de la Fase 6.
