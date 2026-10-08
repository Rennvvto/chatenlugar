import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT id, type, title, body, link, read_at, created_at
       FROM notifications WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 50`,
      [req.auth.sub],
    )
    return res.json({ notifications: result.rows, unreadCount: result.rows.filter((item) => !item.read_at).length })
  } catch (error) { return next(error) }
})

router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      'UPDATE notifications SET read_at = COALESCE(read_at, NOW()) WHERE id = $1 AND user_id = $2 RETURNING id, read_at',
      [req.params.id, req.auth.sub],
    )
    if (!result.rowCount) return res.status(404).json({ error: 'NOTIFICATION_NOT_FOUND', message: 'No encontramos esa notificación.' })
    return res.json({ notification: result.rows[0] })
  } catch (error) { return next(error) }
})

router.post('/read-all', requireAuth, async (req, res, next) => {
  try {
    await query('UPDATE notifications SET read_at = NOW() WHERE user_id = $1 AND read_at IS NULL', [req.auth.sub])
    return res.status(204).end()
  } catch (error) { return next(error) }
})

export default router
