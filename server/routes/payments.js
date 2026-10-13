import { Router } from 'express'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { createNotification } from '../utils/notifications.js'
import { createFlowPayment, getFlowPayment } from '../utils/flow.js'

const router = Router()
const checkoutUrl = (payment) => `${payment.url}${payment.url.includes('?') ? '&' : '?'}token=${encodeURIComponent(payment.token)}`
const updateFromFlow = async (token) => {
  const payment = await getFlowPayment(token)
  const order = await query('SELECT id, user_id, total_cents, status FROM orders WHERE flow_token = $1', [token])
  if (!order.rowCount) { const error = new Error('No existe un pedido asociado al pago de Flow.'); error.code = 'FLOW_ORDER_NOT_FOUND'; throw error }
  const current = order.rows[0]
  if (payment.commerceOrder !== `chatenlugar-${current.id}` || Number(payment.amount) !== current.total_cents / 100) { const error = new Error('La confirmación de Flow no coincide con el pedido.'); error.code = 'FLOW_PAYMENT_MISMATCH'; throw error }
  if (Number(payment.status) === 2 && current.status === 'pending_payment') {
    await query("UPDATE orders SET status = 'paid', paid_at = NOW(), updated_at = NOW() WHERE id = $1", [current.id])
    await createNotification({ query }, { userId: current.user_id, type: 'payment_confirmed', title: 'Pago confirmado', body: 'Tu pago fue confirmado por Flow. Ya puedes solicitar la impresión.', link: '/tienda' })
  }
  return { payment, orderId: current.id }
}
router.post('/orders/:id/flow', requireAuth, async (req, res, next) => {
  try {
    const result = await query('SELECT o.id, o.total_cents, o.status, o.flow_token, u.email FROM orders o JOIN users u ON u.id=o.user_id WHERE o.id=$1 AND o.user_id=$2', [req.params.id, req.auth.sub])
    if (!result.rowCount) return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'No encontramos ese pedido.' })
    const order = result.rows[0]
    if (order.status !== 'pending_payment') return res.status(409).json({ error: 'ORDER_NOT_PAYABLE', message: 'Este pedido no está pendiente de pago.' })
    if (order.flow_token) return res.status(409).json({ error: 'PAYMENT_ALREADY_CREATED', message: 'Este pedido ya tiene una sesión de pago creada. Revisa su estado antes de intentar nuevamente.' })
    const payment = await createFlowPayment({ commerceOrder: `chatenlugar-${order.id}`, subject: `Pedido chatenlugar ${order.id.slice(0, 8)}`, amount: order.total_cents / 100, email: order.email })
    await query('UPDATE orders SET flow_token=$1, flow_order=$2, updated_at=NOW() WHERE id=$3', [payment.token, payment.flowOrder || null, order.id])
    return res.json({ paymentUrl: checkoutUrl(payment) })
  } catch (error) { return next(error) }
})
router.post('/flow/confirmation', async (req, res) => { try { if (req.body?.token) await updateFromFlow(req.body.token); return res.status(200).end() } catch (error) { console.error('Confirmación Flow rechazada.', error); return res.status(400).end() } })
router.get('/flow/return', async (req, res) => { try { const result = await updateFromFlow(req.query.token); const state = Number(result.payment.status) === 2 ? 'paid' : Number(result.payment.status) === 1 ? 'pending' : 'failed'; return res.redirect(`/tienda?flow=${state}`) } catch { return res.redirect('/tienda?flow=failed') } })
export default router
