import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { createNotification } from '../utils/notifications.js'

const router = Router()
const updateSchema = z.object({ body: z.string().trim().min(1).max(500) })

const campaignBySlug = async (client, slug, userId = null) => {
  const result = await client.query(
    `SELECT c.id, c.slug, c.name, c.current_letter, c.current_bid, c.next_turn, c.short_description, c.description, c.status,
      (SELECT COUNT(*)::int FROM campaign_letters cl WHERE cl.campaign_id = c.id) AS total_letters,
      (SELECT COUNT(*)::int FROM campaign_letters cl WHERE cl.campaign_id = c.id AND cl.status = 'completed') AS completed_letters,
      a.id AS assignment_id, a.target_turn, a.status AS assignment_status, a.started_at, a.completed_at
     FROM campaigns c
     LEFT JOIN campaign_assignments a ON a.campaign_id = c.id AND a.user_id = $2
     WHERE c.slug = $1 LIMIT 1`,
    [slug, userId],
  )
  return result.rows[0]
}

router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.q || '').trim()
    const result = await query(
      `SELECT id, slug, name, current_letter, current_bid, next_turn, short_description, status
       FROM campaigns WHERE status = 'active' AND ($1 = '' OR name ILIKE '%' || $1 || '%')
       ORDER BY featured_rank ASC, name ASC LIMIT 30`,
      [search],
    )
    return res.json({ campaigns: result.rows })
  } catch (error) { return next(error) }
})

router.get('/:slug/updates', optionalAuth, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50)
    const result = await query(
      `SELECT wu.id, wu.body, wu.created_at, wu.updated_at, u.id AS author_id, u.name AS author_name, u.handle AS author_handle
       FROM work_updates wu JOIN campaigns c ON c.id = wu.campaign_id JOIN users u ON u.id = wu.author_id
       WHERE c.slug = $1 ORDER BY wu.created_at DESC LIMIT $2`,
      [req.params.slug, limit],
    )
    return res.json({ updates: result.rows })
  } catch (error) { return next(error) }
})

router.post('/:slug/updates', requireAuth, async (req, res, next) => {
  try {
    const { body } = updateSchema.parse(req.body)
    const assignment = await query(
      `SELECT a.id, c.id AS campaign_id FROM campaign_assignments a JOIN campaigns c ON c.id = a.campaign_id
       WHERE c.slug = $1 AND a.user_id = $2 AND a.status = 'active'`,
      [req.params.slug, req.auth.sub],
    )
    if (!assignment.rowCount) return res.status(403).json({ error: 'ACTIVE_ASSIGNMENT_REQUIRED', message: 'Debes tener una jornada activa para publicar una actualización.' })
    const result = await query(
      `INSERT INTO work_updates (campaign_id, author_id, body) VALUES ($1, $2, $3)
       RETURNING id, body, created_at, updated_at`,
      [assignment.rows[0].campaign_id, req.auth.sub, body],
    )
    return res.status(201).json({ update: result.rows[0] })
  } catch (error) { return next(error) }
})

router.post('/:slug/assignment', requireAuth, async (req, res, next) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const campaign = await campaignBySlug(client, req.params.slug)
    if (!campaign) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'CAMPAIGN_NOT_FOUND', message: 'No encontramos esa campaña.' })
    }
    if (campaign.status !== 'active') {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'CAMPAIGN_INACTIVE', message: 'La campaña no está disponible para trabajo.' })
    }
    const existing = await client.query('SELECT id, target_turn, status FROM campaign_assignments WHERE campaign_id = $1 AND user_id = $2 FOR UPDATE', [campaign.id, req.auth.sub])
    if (existing.rowCount) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'ASSIGNMENT_EXISTS', message: 'Ya tienes un turno asignado en esta campaña.', assignment: existing.rows[0] })
    }
    const lockedCampaign = await client.query('SELECT next_turn FROM campaigns WHERE id = $1 FOR UPDATE', [campaign.id])
    const targetTurn = lockedCampaign.rows[0].next_turn
    const assignment = await client.query(
      `INSERT INTO campaign_assignments (campaign_id, user_id, target_turn) VALUES ($1, $2, $3)
       RETURNING id, target_turn, status, started_at, completed_at`,
      [campaign.id, req.auth.sub, targetTurn],
    )
    await client.query('UPDATE campaigns SET next_turn = next_turn + 1, updated_at = NOW() WHERE id = $1', [campaign.id])
    await createNotification(client, { userId: req.auth.sub, type: 'work_assigned', title: 'Turno de trabajo asignado', body: `Tu turno en ${campaign.name} es el ${targetTurn.toLocaleString('es-CL')}.`, link: `/campania/${campaign.slug}` })
    await client.query('COMMIT')
    return res.status(201).json({ assignment: assignment.rows[0] })
  } catch (error) {
    await client.query('ROLLBACK')
    return next(error)
  } finally { client.release() }
})

router.post('/:slug/assignment/start', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE campaign_assignments a SET status = 'active', started_at = NOW() FROM campaigns c
       WHERE a.campaign_id = c.id AND c.slug = $1 AND a.user_id = $2 AND a.status = 'queued'
       RETURNING a.id, a.target_turn, a.status, a.started_at, a.completed_at, c.name`,
      [req.params.slug, req.auth.sub],
    )
    if (!result.rowCount) return res.status(409).json({ error: 'INVALID_ASSIGNMENT_TRANSITION', message: 'No existe un turno pendiente que puedas iniciar.' })
    await query('INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1, $2, $3, $4, $5)', [req.auth.sub, 'work_started', 'Jornada iniciada', `Tu jornada en ${result.rows[0].name} está activa.`, `/campania/${req.params.slug}`])
    return res.json({ assignment: result.rows[0] })
  } catch (error) { return next(error) }
})

router.post('/:slug/assignment/complete', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE campaign_assignments a SET status = 'completed', completed_at = NOW() FROM campaigns c
       WHERE a.campaign_id = c.id AND c.slug = $1 AND a.user_id = $2 AND a.status = 'active'
       RETURNING a.id, a.target_turn, a.status, a.started_at, a.completed_at, c.name`,
      [req.params.slug, req.auth.sub],
    )
    if (!result.rowCount) return res.status(409).json({ error: 'INVALID_ASSIGNMENT_TRANSITION', message: 'Solo una jornada activa puede finalizarse.' })
    await query('INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1, $2, $3, $4, $5)', [req.auth.sub, 'work_completed', 'Jornada finalizada', `Registramos el cierre de tu jornada en ${result.rows[0].name}.`, `/campania/${req.params.slug}`])
    return res.json({ assignment: result.rows[0] })
  } catch (error) { return next(error) }
})

router.get('/:slug', optionalAuth, async (req, res, next) => {
  try {
    const campaign = await campaignBySlug({ query }, req.params.slug, req.auth?.sub || null)
    if (!campaign) return res.status(404).json({ error: 'CAMPAIGN_NOT_FOUND', message: 'No encontramos esa campaña.' })
    const letters = await query('SELECT position, letter, status FROM campaign_letters WHERE campaign_id = $1 ORDER BY position ASC', [campaign.id])
    const assignment = campaign.assignment_id ? { id: campaign.assignment_id, targetTurn: campaign.target_turn, status: campaign.assignment_status, startedAt: campaign.started_at, completedAt: campaign.completed_at } : null
    return res.json({ campaign: { ...campaign, letters: letters.rows, assignment } })
  } catch (error) { return next(error) }
})

export default router
