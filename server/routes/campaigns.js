import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'
import { createNotification } from '../utils/notifications.js'

const router = Router()
const updateSchema = z.object({ body: z.string().trim().min(1).max(500) })
const bidSchema = z.object({ textId: z.string().uuid() })
const textMessageSchema = z.object({ textId: z.string().uuid(), body: z.string().trim().min(1).max(800) })

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

const letterChatBySlug = async (client, slug, userId = null) => {
  const letterResult = await client.query(
    `SELECT cl.id, cl.letter, cl.position, cl.bid_limit, cl.status, cl.tie_pending, cl.winning_text_id,
      (SELECT COUNT(*)::int FROM campaign_letter_bids b WHERE b.campaign_letter_id = cl.id) AS bid_count
     FROM campaigns c JOIN campaign_letters cl ON cl.campaign_id = c.id
     WHERE c.slug = $1 AND cl.status = 'active' ORDER BY cl.position ASC LIMIT 1`,
    [slug],
  )
  if (!letterResult.rowCount) return { letter: null, texts: [], userBidTextId: null }
  const letter = letterResult.rows[0]
  const texts = await client.query(
    `SELECT t.id, t.option_label, t.dictionary_term, t.is_revealed,
      CASE WHEN t.is_revealed OR EXISTS (SELECT 1 FROM campaign_letter_bids own WHERE own.campaign_letter_text_id = t.id AND own.user_id = $2)
        THEN t.text_content ELSE NULL END AS text_content,
      (SELECT COUNT(*)::int FROM campaign_letter_bids b WHERE b.campaign_letter_text_id = t.id) AS bid_count,
      (SELECT COUNT(*)::int FROM campaign_text_messages m WHERE m.campaign_letter_text_id = t.id) AS message_count,
      EXISTS (SELECT 1 FROM campaign_letter_bids own WHERE own.campaign_letter_text_id = t.id AND own.user_id = $2) AS selected_by_me
     FROM campaign_letter_texts t WHERE t.campaign_letter_id = $1 ORDER BY t.created_at ASC`,
    [letter.id, userId],
  )
  const mine = texts.rows.find((text) => text.selected_by_me)
  return { letter, texts: texts.rows, userBidTextId: mine?.id || null }
}

const accessTextThread = async (client, slug, textId, userId) => {
  const result = await client.query(
    `SELECT t.id, t.option_label, t.is_revealed,
      EXISTS (SELECT 1 FROM campaign_letter_bids b WHERE b.campaign_letter_text_id = t.id AND b.user_id = $3) AS selected_by_me
     FROM campaign_letter_texts t
     JOIN campaign_letters cl ON cl.id = t.campaign_letter_id
     JOIN campaigns c ON c.id = cl.campaign_id
     WHERE c.slug = $1 AND t.id = $2`,
    [slug, textId, userId],
  )
  return result.rows[0] || null
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

router.get('/:slug/letter-chat', optionalAuth, async (req, res, next) => {
  try {
    return res.json({ letterChat: await letterChatBySlug({ query }, req.params.slug, req.auth?.sub || null) })
  } catch (error) { return next(error) }
})

router.get('/:slug/letter-chat/messages', requireAuth, async (req, res, next) => {
  try {
    const textId = z.string().uuid().parse(req.query.textId)
    const thread = await accessTextThread({ query }, req.params.slug, textId, req.auth.sub)
    if (!thread) return res.status(404).json({ error: 'TEXT_OPTION_NOT_FOUND', message: 'No encontramos ese texto de campaña.' })
    if (!thread.selected_by_me) return res.status(403).json({ error: 'TEXT_THREAD_LOCKED', message: 'Debes pujar por este texto para acceder a su chat personalizado.' })
    const messages = await query(
      `SELECT m.id, m.body, m.created_at, m.updated_at, u.id AS author_id, u.name AS author_name, u.handle AS author_handle
       FROM campaign_text_messages m JOIN users u ON u.id = m.author_id
       WHERE m.campaign_letter_text_id = $1 ORDER BY m.created_at ASC LIMIT 100`,
      [textId],
    )
    return res.json({ thread, messages: messages.rows })
  } catch (error) { return next(error) }
})

router.post('/:slug/letter-chat/messages', requireAuth, async (req, res, next) => {
  try {
    const { textId, body } = textMessageSchema.parse(req.body)
    const thread = await accessTextThread({ query }, req.params.slug, textId, req.auth.sub)
    if (!thread) return res.status(404).json({ error: 'TEXT_OPTION_NOT_FOUND', message: 'No encontramos ese texto de campaña.' })
    if (!thread.selected_by_me) return res.status(403).json({ error: 'TEXT_THREAD_LOCKED', message: 'Debes pujar por este texto para escribir en su chat personalizado.' })
    const result = await query(
      `INSERT INTO campaign_text_messages (campaign_letter_text_id, author_id, body)
       VALUES ($1, $2, $3) RETURNING id, body, created_at, updated_at`,
      [textId, req.auth.sub, body],
    )
    await query(
      `INSERT INTO shard_interactions (user_id, interaction_type, campaign_letter_text_id, metadata)
       VALUES ($1, 'text_chat_message', $2, $3::jsonb)`,
      [req.auth.sub, textId, JSON.stringify({ source: 'letter_chat' })],
    )
    return res.status(201).json({ message: result.rows[0] })
  } catch (error) { return next(error) }
})

router.post('/:slug/letter-chat/bids', requireAuth, async (req, res, next) => {
  const client = await pool.connect()
  try {
    const { textId } = bidSchema.parse(req.body)
    await client.query('BEGIN')
    const active = await client.query(
      `SELECT c.id AS campaign_id, c.slug, c.name, cl.id AS letter_id, cl.letter, cl.position, cl.bid_limit, cl.tie_pending
       FROM campaigns c JOIN campaign_letters cl ON cl.campaign_id = c.id
       WHERE c.slug = $1 AND cl.status = 'active' ORDER BY cl.position ASC LIMIT 1 FOR UPDATE OF c, cl`,
      [req.params.slug],
    )
    if (!active.rowCount) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'NO_ACTIVE_LETTER', message: 'Esta campaña no tiene una letra disponible para pujar.' })
    }
    const letter = active.rows[0]
    if (letter.tie_pending) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'TIE_REQUIRES_RESOLUTION', message: 'Esta letra requiere una resolución administrativa antes de continuar.' })
    }
    const option = await client.query('SELECT id, option_label FROM campaign_letter_texts WHERE id = $1 AND campaign_letter_id = $2', [textId, letter.letter_id])
    if (!option.rowCount) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'TEXT_OPTION_NOT_FOUND', message: 'El texto elegido no pertenece a la letra activa.' })
    }
    const existing = await client.query('SELECT id FROM campaign_letter_bids WHERE campaign_letter_id = $1 AND user_id = $2', [letter.letter_id, req.auth.sub])
    if (existing.rowCount) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'LETTER_BID_EXISTS', message: 'Ya registraste una puja en esta letra.' })
    }
    const count = await client.query('SELECT COUNT(*)::int AS count FROM campaign_letter_bids WHERE campaign_letter_id = $1', [letter.letter_id])
    if (count.rows[0].count >= letter.bid_limit) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'LETTER_BID_LIMIT_REACHED', message: 'Esta letra ya alcanzó su límite de pujas.' })
    }
    await client.query('INSERT INTO campaign_letter_bids (campaign_letter_id, campaign_letter_text_id, user_id) VALUES ($1, $2, $3)', [letter.letter_id, textId, req.auth.sub])
    await client.query(
      `INSERT INTO shard_interactions (user_id, interaction_type, campaign_id, campaign_letter_id, campaign_letter_text_id, metadata)
       VALUES ($1, 'letter_bid', $2, $3, $4, $5::jsonb)`,
      [req.auth.sub, letter.campaign_id, letter.letter_id, textId, JSON.stringify({ option: option.rows[0].option_label })],
    )

    const nextCount = count.rows[0].count + 1
    let resolution = 'pending'
    if (nextCount === letter.bid_limit) {
      const ranking = await client.query(
        `SELECT campaign_letter_text_id, COUNT(*)::int AS count
         FROM campaign_letter_bids WHERE campaign_letter_id = $1
         GROUP BY campaign_letter_text_id ORDER BY count DESC, MIN(created_at) ASC`,
        [letter.letter_id],
      )
      const isTie = ranking.rowCount > 1 && ranking.rows[0].count === ranking.rows[1].count
      if (isTie) {
        await client.query('UPDATE campaign_letters SET tie_pending = TRUE WHERE id = $1', [letter.letter_id])
        resolution = 'tie_pending'
      } else {
        const winnerId = ranking.rows[0].campaign_letter_text_id
        await client.query('UPDATE campaign_letter_texts SET is_revealed = TRUE WHERE id = $1', [winnerId])
        await client.query(`UPDATE campaign_letters SET status = 'completed', winning_text_id = $1, resolved_at = NOW(), tie_pending = FALSE WHERE id = $2`, [winnerId, letter.letter_id])
        const next = await client.query(`UPDATE campaign_letters SET status = 'active' WHERE campaign_id = $1 AND position = $2 AND status = 'pending' RETURNING letter`, [letter.campaign_id, letter.position + 1])
        await client.query('UPDATE campaigns SET current_letter = $1, updated_at = NOW() WHERE id = $2', [next.rows[0]?.letter || null, letter.campaign_id])
        resolution = 'resolved'
      }
    }
    await createNotification(client, { userId: req.auth.sub, type: 'letter_bid_registered', title: 'Puja registrada', body: `Tu puja por la letra ${letter.letter} quedó registrada.`, link: `/campania/${letter.slug}` })
    await client.query('COMMIT')
    return res.status(201).json({ result: { bidCount: nextCount, bidLimit: letter.bid_limit, resolution }, letterChat: await letterChatBySlug({ query }, req.params.slug, req.auth.sub) })
  } catch (error) {
    await client.query('ROLLBACK')
    return next(error)
  } finally { client.release() }
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
