export const writeAudit = (client, { actorId, action, entityType, entityId = null, details = {} }) => client.query(
  `INSERT INTO admin_audit_logs (actor_id, action, entity_type, entity_id, details)
   VALUES ($1, $2, $3, $4, $5::jsonb)`,
  [actorId, action, entityType, entityId, JSON.stringify(details)],
)
