export const createNotification = (client, { userId, type, title, body = '', link = null }) => client.query(
  `INSERT INTO notifications (user_id, type, title, body, link)
   VALUES ($1, $2, $3, $4, $5)`,
  [userId, type, title, body, link],
)
