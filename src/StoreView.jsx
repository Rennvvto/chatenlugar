import { useEffect, useMemo, useState } from 'react'
import { apiRequest, getCachedSession } from './platform-api'
import WorkspaceChrome, { WorkspaceIcon } from './WorkspaceChrome'

const money = (cents) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(cents / 100)
const date = (value) => value ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(new Date(value)) : null
const productType = (type) => ({ shirt_bundle: 'Fardo de poleras', themed_shirt: 'Polera temática', collectible_card: 'Tarjeta coleccionable' }[type] || 'Producto oficial')

export default function StoreView() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingOrderId, setPayingOrderId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const user = getCachedSession()?.user

  const load = async () => {
    setLoading(true)
    try {
      const catalog = await apiRequest('/store/products')
      setProducts(catalog.products)
      if (user) {
        const mine = await apiRequest('/store/orders/me')
        setOrders(mine.orders)
      }
      const flowState = new URLSearchParams(window.location.search).get('flow')
      if (flowState === 'paid') setMessage('Pago confirmado. Ya puedes solicitar la impresión de tu pedido.')
      if (flowState === 'pending') setMessage('Tu pago sigue pendiente de confirmación. Actualizaremos el pedido cuando Flow lo confirme.')
      if (flowState === 'failed') setError('Flow no pudo confirmar el pago. Revisa el estado de tu pedido antes de intentarlo nuevamente.')
      if (flowState !== 'failed') setError('')
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price_cents * item.quantity, 0), [cart])
  const add = (product) => setCart((current) => {
    const present = current.find((item) => item.id === product.id)
    return present ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]
  })
  const remove = (id) => setCart((current) => current.flatMap((item) => item.id !== id ? [item] : item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : []))

  const beginPayment = async (orderId) => {
    setError(''); setPayingOrderId(orderId)
    try { const payment = await apiRequest(`/payments/orders/${orderId}/flow`, { method: 'POST' }); window.location.assign(payment.paymentUrl) } catch (requestError) { setError(requestError.message); setPayingOrderId('') }
  }
  const checkout = async () => {
    if (!user) return window.location.assign('/?acceso=login')
    if (!cart.length) return
    setError('')
    try {
      const { order } = await apiRequest('/store/orders', { method: 'POST', body: JSON.stringify({ items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) }) })
      setOrders((current) => [order, ...current]); setCart([]); await beginPayment(order.id)
    } catch (requestError) { setError(requestError.message) }
  }
  const requestPrint = async (id) => {
    try {
      const { order } = await apiRequest(`/store/orders/${id}/print-request`, { method: 'POST' })
      setOrders((current) => current.map((item) => item.id === id ? { ...item, ...order } : item))
      setMessage('Solicitud de impresión registrada. El plazo de despacho es de hasta 15 días desde hoy.')
    } catch (requestError) { setError(requestError.message) }
  }

  return <WorkspaceChrome active="store">
    <header className="route-heading"><div><p>TIENDA</p><h1>Productos oficiales.</h1><span>Arma tu pedido y completa el pago seguro antes de solicitar impresión.</span></div><div className="route-heading-aside">IMPRESIÓN Y DESPACHO<strong>Hasta 15 días</strong></div></header>
    <div className="route-layout"><section className="route-content">
      {(error || message) && <p className={`route-state ${error ? 'error' : 'success'}`}>{error || message}</p>}
      <div className="route-section-title"><h2>Catálogo</h2><span>{loading ? 'Actualizando' : `${products.length} productos publicados`}</span></div>
      {loading && <p className="route-state">Cargando catálogo.</p>}
      {!loading && !products.length && <p className="route-state">Todavía no hay productos oficiales publicados. El catálogo aparecerá aquí cuando administración los habilite.</p>}
      <div className="store-product-list">{products.map((product) => <article className="store-product" key={product.id}><div className="store-product-mark"><span>{productType(product.product_type).slice(0, 1)}</span></div><div className="store-product-copy"><small>{productType(product.product_type).toUpperCase()}</small><h3>{product.name}</h3><p>{product.description || 'Producto oficial de chatenlugar.'}</p>{product.campaign_name && <a href={`/campania/${product.campaign_slug}`}>Campaña: {product.campaign_name}</a>}</div><div className="store-product-buy"><strong>{money(product.price_cents)}</strong><span>{product.stock === 0 ? 'Sin disponibilidad' : product.stock === null ? 'Disponible' : `${product.stock} disponibles`}</span><button type="button" disabled={product.stock === 0} onClick={() => add(product)}>{product.stock === 0 ? 'Sin disponibilidad' : 'Agregar'} <WorkspaceIcon name="arrow" size={16} /></button></div></article>)}</div>
      {user && <section className="store-orders"><div className="route-section-title"><h2>Mis pedidos</h2><span>{orders.length ? `${orders.length} registrados` : 'Sin pedidos'}</span></div>{orders.length ? <div className="store-orders-list">{orders.map((order) => <article key={order.id}><header><strong>{order.status_label}</strong><time>{date(order.created_at)}</time></header><p>{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ') || 'Detalle de productos pendiente.'}</p><footer><b>{money(order.total_cents)}</b><div>{order.status === 'pending_payment' && <button type="button" disabled={payingOrderId === order.id} onClick={() => beginPayment(order.id)}>{payingOrderId === order.id ? 'Abriendo Flow' : 'Pagar de forma segura'}</button>}{order.status === 'paid' && <button type="button" onClick={() => requestPrint(order.id)}>Solicitar impresión</button>}{order.print_requested_at && <span>Despacho estimado hasta el {date(order.dispatch_deadline)}.</span>}</div></footer></article>)}</div> : <p className="route-state">Aún no registras pedidos.</p>}</section>}
    </section><aside className="route-aside store-aside"><h2>Tu pedido</h2>{cart.length ? <><ul className="store-cart-list">{cart.map((item) => <li key={item.id}><button type="button" onClick={() => remove(item.id)} aria-label={`Quitar una unidad de ${item.name}`}>−</button><span>{item.name} <small>× {item.quantity}</small></span><strong>{money(item.price_cents * item.quantity)}</strong></li>)}</ul><div className="store-total"><span>Total</span><strong>{money(total)}</strong></div><button className="route-action" type="button" onClick={checkout} disabled={Boolean(payingOrderId)}>Continuar a pago <WorkspaceIcon name="arrow" /></button></> : <p>Agrega productos publicados para preparar un pedido.</p>}<div className="route-info"><h3>Pago protegido</h3><p>El pago se confirma con Flow antes de habilitar la solicitud de impresión.</p></div><div className="route-info"><h3>Despacho</h3><p>La solicitud de impresión inicia el plazo de despacho de hasta 15 días.</p></div></aside></div>
  </WorkspaceChrome>
}
