import { Router } from 'express'
import { z } from 'zod'
import { pool, query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { createNotification } from '../utils/notifications.js'

const router = Router()
const orderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(20) })).min(1).max(20),
})

const statusLabels = {
  pending_payment: 'Pendiente de pago',
  paid: 'Pagado',
  print_requested: 'Impresión solicitada',
  in_production: 'En producción',
  shipped: 'Despachado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const serializeOrder = (row) => ({
  ...row,
  status_label: statusLabels[row.status] || row.status,
  dispatch_deadline: row.print_requested_at ? new Date(new Date(row.print_requested_at).getTime() + 15 * 24 * 60 * 60 * 1000).toISOString() : null,
})

router.get('/products', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT p.id, p.slug, p.name, p.product_type, p.description, p.price_cents, p.stock, p.created_at,
        c.slug AS campaign_slug, c.name AS campaign_name
       FROM products p LEFT JOIN campaigns c ON c.id = p.campaign_id
       WHERE p.is_active = TRUE ORDER BY p.created_at DESC, p.name ASC`,
    )
    return res.json({ products: result.rows })
  } catch (error) { return next(error) }
})

router.get('/orders/me', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `SELECT o.id, o.status, o.total_cents, o.print_requested_at, o.shipped_at, o.created_at, o.updated_at,
        COALESCE(json_agg(json_build_object('id', oi.id, 'product_id', p.id, 'name', p.name, 'quantity', oi.quantity, 'unit_price_cents', oi.unit_price_cents)) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
       FROM orders o LEFT JOIN order_items oi ON oi.order_id = o.id LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = $1 GROUP BY o.id ORDER BY o.created_at DESC`,
      [req.auth.sub],
    )
    return res.json({ orders: result.rows.map(serializeOrder) })
  } catch (error) { return next(error) }
})

router.post('/orders', requireAuth, async (req, res, next) => {
  const client = await pool.connect()
  try {
    const { items } = orderSchema.parse(req.body)
    const quantities = new Map()
    for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity)
    await client.query('BEGIN')
    const ids = [...quantities.keys()]
    const products = await client.query(
      `SELECT id, name, price_cents, stock FROM products WHERE id = ANY($1::uuid[]) AND is_active = TRUE FOR UPDATE`,
      [ids],
    )
    if (products.rowCount !== ids.length) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'PRODUCT_UNAVAILABLE', message: 'Uno o más productos ya no están disponibles.' })
    }
    let total = 0
    for (const product of products.rows) {
      const quantity = quantities.get(product.id)
      if (product.stock !== null && product.stock < quantity) {
        await client.query('ROLLBACK')
        return res.status(409).json({ error: 'INSUFFICIENT_STOCK', message: `${product.name} no tiene disponibilidad suficiente.` })
      }
      total += product.price_cents * quantity
    }
    const order = await client.query(
      `INSERT INTO orders (user_id, status, total_cents) VALUES ($1, 'pending_payment', $2)
       RETURNING id, status, total_cents, created_at, updated_at, print_requested_at, shipped_at`,
      [req.auth.sub, total],
    )
    for (const product of products.rows) {
      const quantity = quantities.get(product.id)
      await client.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price_cents) VALUES ($1, $2, $3, $4)', [order.rows[0].id, product.id, quantity, product.price_cents])
    }
    await createNotification(client, { userId: req.auth.sub, type: 'order_created', title: 'Pedido registrado', body: 'Tu pedido está pendiente de pago. No se procesará hasta confirmar el pago.', link: '/tienda' })
    await client.query('COMMIT')
    return res.status(201).json({ order: serializeOrder(order.rows[0]), payment_required: true })
  } catch (error) {
    await client.query('ROLLBACK')
    return next(error)
  } finally { client.release() }
})

router.post('/orders/:id/print-request', requireAuth, async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE orders SET status = 'print_requested', print_requested_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'paid'
       RETURNING id, status, total_cents, print_requested_at, shipped_at, created_at, updated_at`,
      [req.params.id, req.auth.sub],
    )
    if (!result.rowCount) return res.status(409).json({ error: 'PRINT_REQUEST_UNAVAILABLE', message: 'La impresión solo se puede solicitar después de confirmar el pago.' })
    await query('INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1, $2, $3, $4, $5)', [req.auth.sub, 'print_requested', 'Impresión solicitada', 'Tu solicitud de impresión fue registrada. El despacho será dentro de 15 días.', '/tienda'])
    return res.json({ order: serializeOrder(result.rows[0]) })
  } catch (error) { return next(error) }
})

export default router
