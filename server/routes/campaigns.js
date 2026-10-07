import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.q || '').trim()
    const result = await query(
      `SELECT id, slug, name, current_letter, current_bid, next_turn, short_description, status
       FROM campaigns
       WHERE status = 'active' AND ($1 = '' OR name ILIKE '%' || $1 || '%')
       ORDER BY featured_rank ASC, name ASC
       LIMIT 30`,
      [search],
    )
    return res.json({ campaigns: result.rows })
  } catch (error) { return next(error) }
})

router.get('/:slug', async (req, res, next) => {
  try {
    const campaign = await query(
      `SELECT id, slug, name, current_letter, current_bid, next_turn, short_description, description, status
       FROM campaigns WHERE slug = $1 LIMIT 1`,
      [req.params.slug],
    )
    if (!campaign.rowCount) return res.status(404).json({ error: 'CAMPAIGN_NOT_FOUND', message: 'No encontramos esa campaña.' })
    const letters = await query(
      'SELECT position, letter, status FROM campaign_letters WHERE campaign_id = $1 ORDER BY position ASC',
      [campaign.rows[0].id],
    )
    return res.json({ campaign: { ...campaign.rows[0], letters: letters.rows } })
  } catch (error) { return next(error) }
})

export default router
