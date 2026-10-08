import { Router } from 'express'
import { query } from '../db.js'

const router = Router()

router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.q || '').trim()
    const pattern = `%${search}%`
    const [campaigns, people, collections] = await Promise.all([
      query('SELECT slug, name, short_description AS description FROM campaigns WHERE status = \'active\' AND ($1 = \'\' OR name ILIKE $2) ORDER BY featured_rank, name LIMIT 20', [search, pattern]),
      query('SELECT handle, name, bio, location FROM users WHERE ($1 = \'\' OR name ILIKE $2 OR handle ILIKE $2) ORDER BY joined_at DESC LIMIT 20', [search, pattern]),
      query('SELECT c.id, c.name, c.description, u.handle AS owner_handle, u.name AS owner_name FROM collections c JOIN users u ON u.id = c.user_id WHERE c.is_public = TRUE AND ($1 = \'\' OR c.name ILIKE $2) ORDER BY c.created_at DESC LIMIT 20', [search, pattern]),
    ])
    return res.json({ campaigns: campaigns.rows, people: people.rows, collections: collections.rows })
  } catch (error) { return next(error) }
})

export default router
