import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { requireRole } from '../middleware/roles.js'
import { writeAudit } from '../utils/audit.js'

const router = Router()
router.use(requireAuth, requireRole('company_admin', 'platform_admin'))

const campaignSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,80}$/),
  name: z.string().trim().min(2).max(100),
  shortDescription: z.string().trim().min(2).max(220),
  description: z.string().trim().max(4000).default(''),
  status: z.enum(['draft', 'active', 'paused', 'closed']).default('draft'),
  letters: z.array(z.string().trim().toUpperCase().regex(/^[A-ZÑ]$/)).min(1).max(100),
})
const productSchema = z.object({
  campaignId: z.string().uuid().nullable().optional(), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{2,100}$/),
  name: z.string().trim().min(2).max(120), productType: z.enum(['themed_shirt', 'shirt_bundle', 'collectible_card']),
  description: z.string().trim().max(4000).default(''), priceCents: z.number().int().min(0), stock: z.number().int().min(0).nullable().optional(), isActive: z.boolean().default(true),
})
const roleSchema = z.object({ role: z.enum(['worker', 'company_admin']) })
const ruleSchema = z.object({ key: z.string().trim().regex(/^[a-z0-9_.-]{3,80}$/), value: z.record(z.string(), z.unknown()), isActive: z.literal(false).default(false) })
const orderTransitionSchema = z.object({ status: z.enum(['print_requested', 'in_production', 'shipped', 'delivered', 'cancelled']) })
const allowedTransitions = {
  paid: ['print_requested', 'cancelled'], print_requested: ['in_production', 'cancelled'], in_production: ['shipped'], shipped: ['delivered'],
  pending_payment: ['cancelled'], delivered: [], cancelled: [],
}

router.get('/overview', async (req, res, next) => {
  try {
    const [users, campaigns, products, orders, rules] = await Promise.all([
      query('SELECT COUNT(*)::int AS count FROM users'), query('SELECT COUNT(*)::int AS count FROM campaigns'),
      query('SELECT COUNT(*)::int AS count FROM products WHERE is_active = TRUE'), query('SELECT COUNT(*)::int AS count FROM orders'),
      query('SELECT COUNT(*)::int AS count FROM business_rules WHERE is_active = TRUE'),
    ])
    return res.json({ overview: { users: users.rows[0].count, campaigns: campaigns.rows[0].count, active_products: products.rows[0].count, orders: orders.rows[0].count, active_rules: rules.rows[0].count } })
  } catch (error) { return next(error) }
})

router.get('/users', async (req, res, next) => { try { const result = await query('SELECT id, name, handle, role, joined_at FROM users ORDER BY joined_at DESC LIMIT 100'); return res.json({ users: result.rows }) } catch (error) { return next(error) } })
router.patch('/users/:id/role', requireRole('platform_admin'), async (req, res, next) => {
  try {
    const { role } = roleSchema.parse(req.body)
    if (req.params.id === req.auth.sub && role !== 'platform_admin') return res.status(409).json({ error: 'SELF_ROLE_CHANGE_BLOCKED', message: 'No puedes quitar tu propio rol de plataforma.' })
    const result = await query('UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING id, name, handle, role', [role, req.params.id])
    if (!result.rowCount) return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'No encontramos ese usuario.' })
    await writeAudit({ query }, { actorId: req.auth.sub, action: 'user.role_updated', entityType: 'user', entityId: req.params.id, details: { role } })
    return res.json({ user: result.rows[0] })
  } catch (error) { return next(error) }
})

router.get('/campaigns', async (req, res, next) => { try { const result = await query('SELECT id, slug, name, status, current_letter, next_turn, created_at FROM campaigns ORDER BY created_at DESC'); return res.json({ campaigns: result.rows }) } catch (error) { return next(error) } })
router.post('/campaigns', async (req, res, next) => {
  const client = await pool.connect()
  try {
    const data = campaignSchema.parse(req.body)
    await client.query('BEGIN')
    const created = await client.query(`INSERT INTO campaigns (slug, name, short_description, description, status, current_letter)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, slug, name, status`, [data.slug, data.name, data.shortDescription, data.description, data.status, data.letters[0]])
    for (const [index, letter] of data.letters.entries()) await client.query('INSERT INTO campaign_letters (campaign_id, letter, position, status) VALUES ($1, $2, $3, $4)', [created.rows[0].id, letter, index + 1, index === 0 && data.status === 'active' ? 'active' : 'pending'])
    await writeAudit(client, { actorId: req.auth.sub, action: 'campaign.created', entityType: 'campaign', entityId: created.rows[0].id, details: { slug: data.slug, status: data.status } })
    await client.query('COMMIT')
    return res.status(201).json({ campaign: created.rows[0] })
  } catch (error) { await client.query('ROLLBACK'); return next(error) } finally { client.release() }
})
router.patch('/campaigns/:id', async (req, res, next) => {
  try {
    const data = campaignSchema.omit({ letters: true }).parse(req.body)
    const result = await query(`UPDATE campaigns SET slug=$1,name=$2,short_description=$3,description=$4,status=$5,updated_at=NOW()
      WHERE id=$6 RETURNING id,slug,name,status,current_letter,next_turn`, [data.slug, data.name, data.shortDescription, data.description, data.status, req.params.id])
    if (!result.rowCount) return res.status(404).json({ error: 'CAMPAIGN_NOT_FOUND', message: 'No encontramos esa campaña.' })
    await writeAudit({ query }, { actorId: req.auth.sub, action: 'campaign.updated', entityType: 'campaign', entityId: req.params.id, details: { status: data.status } })
    return res.json({ campaign: result.rows[0] })
  } catch (error) { return next(error) }
})
router.get('/assignments', async (req,res,next)=>{try{const r=await query(`SELECT a.id,a.target_turn,a.status,a.started_at,a.completed_at,c.name AS campaign_name,u.name AS worker_name,u.handle AS worker_handle FROM campaign_assignments a JOIN campaigns c ON c.id=a.campaign_id JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 200`);return res.json({assignments:r.rows})}catch(e){return next(e)}})
router.patch('/assignments/:id/status', async (req,res,next)=>{try{const d=z.object({status:z.enum(['queued','active','completed','cancelled'])}).parse(req.body);const r=await query('UPDATE campaign_assignments SET status=$1, started_at=CASE WHEN $1=\'active\' THEN COALESCE(started_at,NOW()) ELSE started_at END, completed_at=CASE WHEN $1=\'completed\' THEN COALESCE(completed_at,NOW()) ELSE completed_at END WHERE id=$2 RETURNING id,status,user_id',[d.status,req.params.id]);if(!r.rowCount)return res.status(404).json({error:'ASSIGNMENT_NOT_FOUND',message:'No encontramos ese turno.'});await writeAudit({query},{actorId:req.auth.sub,action:'assignment.status_updated',entityType:'assignment',entityId:req.params.id,details:{status:d.status}});return res.json({assignment:r.rows[0]})}catch(e){return next(e)}})

router.get('/products', async (req, res, next) => { try { const result = await query('SELECT id, slug, name, product_type, price_cents, stock, is_active, campaign_id, created_at FROM products ORDER BY created_at DESC'); return res.json({ products: result.rows }) } catch (error) { return next(error) } })
router.post('/products', async (req, res, next) => {
  try {
    const data = productSchema.parse(req.body)
    const result = await query(`INSERT INTO products (campaign_id, slug, name, product_type, description, price_cents, stock, is_active)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id, slug, name, product_type, price_cents, stock, is_active`, [data.campaignId || null, data.slug, data.name, data.productType, data.description, data.priceCents, data.stock ?? null, data.isActive])
    await writeAudit({ query }, { actorId: req.auth.sub, action: 'product.created', entityType: 'product', entityId: result.rows[0].id, details: { slug: data.slug, price_cents: data.priceCents } })
    return res.status(201).json({ product: result.rows[0] })
  } catch (error) { return next(error) }
})
router.patch('/products/:id', async (req,res,next)=>{try{const d=productSchema.parse(req.body);const r=await query(`UPDATE products SET campaign_id=$1,slug=$2,name=$3,product_type=$4,description=$5,price_cents=$6,stock=$7,is_active=$8 WHERE id=$9 RETURNING id,slug,name,product_type,price_cents,stock,is_active,campaign_id`,[d.campaignId||null,d.slug,d.name,d.productType,d.description,d.priceCents,d.stock??null,d.isActive,req.params.id]);if(!r.rowCount)return res.status(404).json({error:'PRODUCT_NOT_FOUND',message:'No encontramos ese producto.'});await writeAudit({query},{actorId:req.auth.sub,action:'product.updated',entityType:'product',entityId:req.params.id,details:{price_cents:d.priceCents,is_active:d.isActive}});return res.json({product:r.rows[0]})}catch(e){return next(e)}})

router.get('/orders', async (req, res, next) => { try { const result = await query(`SELECT o.id, o.status, o.total_cents, o.created_at, u.name AS customer_name, u.handle AS customer_handle FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC LIMIT 100`); return res.json({ orders: result.rows }) } catch (error) { return next(error) } })
router.patch('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = orderTransitionSchema.parse(req.body)
    const current = await query('SELECT status FROM orders WHERE id = $1 FOR UPDATE', [req.params.id])
    if (!current.rowCount) return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'No encontramos ese pedido.' })
    if (!allowedTransitions[current.rows[0].status]?.includes(status)) return res.status(409).json({ error: 'INVALID_ORDER_TRANSITION', message: 'La transición de estado no está permitida.' })
    const updateFields = status === 'shipped' ? ', shipped_at = NOW()' : ''
    const result = await query(`UPDATE orders SET status = $1, updated_at = NOW() ${updateFields} WHERE id = $2 RETURNING id, status, user_id`, [status, req.params.id])
    await query('INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)', [result.rows[0].user_id, 'order_status', 'Estado de pedido actualizado', `Tu pedido ahora está: ${status}.`, '/tienda'])
    await writeAudit({ query }, { actorId: req.auth.sub, action: 'order.status_updated', entityType: 'order', entityId: req.params.id, details: { from: current.rows[0].status, to: status } })
    return res.json({ order: result.rows[0] })
  } catch (error) { return next(error) }
})

router.get('/rules', async (req, res, next) => { try { const result = await query('SELECT key, value, is_active, updated_at FROM business_rules ORDER BY key ASC'); return res.json({ rules: result.rows }) } catch (error) { return next(error) } })
router.put('/rules/:key', async (req, res, next) => {
  try {
    const data = ruleSchema.parse({ ...req.body, key: req.params.key })
    const result = await query(`INSERT INTO business_rules (key, value, is_active, updated_by) VALUES ($1,$2::jsonb,FALSE,$3)
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, is_active = FALSE, updated_by = EXCLUDED.updated_by, updated_at = NOW()
      RETURNING key, value, is_active, updated_at`, [data.key, JSON.stringify(data.value), req.auth.sub])
    await writeAudit({ query }, { actorId: req.auth.sub, action: 'business_rule.saved', entityType: 'business_rule', entityId: data.key, details: { active: false } })
    return res.json({ rule: result.rows[0], message: 'Configuración guardada como inactiva hasta definir y aprobar la regla comercial.' })
  } catch (error) { return next(error) }
})

export default router
