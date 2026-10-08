import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()
const bodySchema = z.object({ body: z.string().trim().min(1).max(500) })

router.get('/updates', optionalAuth, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50)
    const cursor = req.query.cursor ? new Date(String(req.query.cursor)) : null
    const result = await query(
      `SELECT wu.id, wu.body, wu.created_at, wu.updated_at, c.slug AS campaign_slug, c.name AS campaign_name,
        u.id AS author_id, u.name AS author_name, u.handle AS author_handle,
        (SELECT COUNT(*)::int FROM work_update_reactions r WHERE r.work_update_id = wu.id) AS likes,
        (SELECT COUNT(*)::int FROM work_update_comments wc WHERE wc.work_update_id = wu.id) AS comments,
        EXISTS(SELECT 1 FROM work_update_reactions r WHERE r.work_update_id = wu.id AND r.user_id = $1) AS liked_by_me
       FROM work_updates wu JOIN campaigns c ON c.id = wu.campaign_id JOIN users u ON u.id = wu.author_id
       WHERE ($2::timestamptz IS NULL OR wu.created_at < $2)
       ORDER BY wu.created_at DESC LIMIT $3`,
      [req.auth?.sub || null, cursor && !Number.isNaN(cursor.valueOf()) ? cursor.toISOString() : null, limit],
    )
    return res.json({ updates: result.rows, nextCursor: result.rows.length === limit ? result.rows.at(-1).created_at : null })
  } catch (error) { return next(error) }
})

router.patch('/updates/:id', requireAuth, async (req, res, next) => {
  try {
    const { body } = bodySchema.parse(req.body)
    const result = await query('UPDATE work_updates SET body = $1, updated_at = NOW() WHERE id = $2 AND author_id = $3 RETURNING id, body, updated_at', [body, req.params.id, req.auth.sub])
    if (!result.rowCount) return res.status(403).json({ error: 'UPDATE_FORBIDDEN', message: 'Solo puedes editar tus propias actualizaciones.' })
    return res.json({ update: result.rows[0] })
  } catch (error) { return next(error) }
})

router.delete('/updates/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM work_updates WHERE id = $1 AND author_id = $2 RETURNING id', [req.params.id, req.auth.sub])
    if (!result.rowCount) return res.status(403).json({ error: 'UPDATE_FORBIDDEN', message: 'Solo puedes eliminar tus propias actualizaciones.' })
    return res.status(204).end()
  } catch (error) { return next(error) }
})

router.post('/updates/:id/reaction', requireAuth, async (req, res, next) => {
  try {
    const exists = await query('SELECT id FROM work_updates WHERE id = $1', [req.params.id])
    if (!exists.rowCount) return res.status(404).json({ error: 'UPDATE_NOT_FOUND', message: 'No encontramos esa actualización.' })
    const inserted = await query('INSERT INTO work_update_reactions (work_update_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING work_update_id', [req.params.id, req.auth.sub])
    if (!inserted.rowCount) await query('DELETE FROM work_update_reactions WHERE work_update_id = $1 AND user_id = $2', [req.params.id, req.auth.sub])
    const count = await query('SELECT COUNT(*)::int AS likes FROM work_update_reactions WHERE work_update_id = $1', [req.params.id])
    return res.json({ liked: Boolean(inserted.rowCount), likes: count.rows[0].likes })
  } catch (error) { return next(error) }
})

router.get('/updates/:id/comments', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT wc.id, wc.body, wc.created_at, wc.updated_at, u.id AS author_id, u.name AS author_name, u.handle AS author_handle
       FROM work_update_comments wc JOIN users u ON u.id = wc.author_id WHERE wc.work_update_id = $1 ORDER BY wc.created_at ASC`, [req.params.id],
    )
    return res.json({ comments: result.rows })
  } catch (error) { return next(error) }
})

router.post('/updates/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const { body } = bodySchema.parse(req.body)
    const update = await query('SELECT id FROM work_updates WHERE id = $1', [req.params.id])
    if (!update.rowCount) return res.status(404).json({ error: 'UPDATE_NOT_FOUND', message: 'No encontramos esa actualización.' })
    const result = await query('INSERT INTO work_update_comments (work_update_id, author_id, body) VALUES ($1, $2, $3) RETURNING id, body, created_at, updated_at', [req.params.id, req.auth.sub, body])
    return res.status(201).json({ comment: result.rows[0] })
  } catch (error) { return next(error) }
})

router.patch('/comments/:id', requireAuth, async (req, res, next) => {
  try {
    const { body } = bodySchema.parse(req.body)
    const result = await query('UPDATE work_update_comments SET body = $1, updated_at = NOW() WHERE id = $2 AND author_id = $3 RETURNING id, body, updated_at', [body, req.params.id, req.auth.sub])
    if (!result.rowCount) return res.status(403).json({ error: 'COMMENT_FORBIDDEN', message: 'Solo puedes editar tus propios comentarios.' })
    return res.json({ comment: result.rows[0] })
  } catch (error) { return next(error) }
})

router.delete('/comments/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM work_update_comments WHERE id = $1 AND author_id = $2 RETURNING id', [req.params.id, req.auth.sub])
    if (!result.rowCount) return res.status(403).json({ error: 'COMMENT_FORBIDDEN', message: 'Solo puedes eliminar tus propios comentarios.' })
    return res.status(204).end()
  } catch (error) { return next(error) }
})

export default router
