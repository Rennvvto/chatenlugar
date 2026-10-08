import { useEffect, useMemo, useState } from 'react'
import { apiRequest, getCachedSession } from './platform-api'
import './store.css'

const money = (cents) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(cents / 100)
const date = (value) => value ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium' }).format(new Date(value)) : null

export default function StoreView() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
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
      setError('')
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price_cents * item.quantity, 0), [cart])
  const add = (product) => setCart((current) => {
    const present = current.find((item) => item.id === product.id)
    return present ? current.map((item) => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { ...product, quantity: 1 }]
  })
  const checkout = async () => {
    if (!user) return window.location.assign('/?acceso=login')
    if (!cart.length) return
    try {
      const { order } = await apiRequest('/store/orders', { method: 'POST', body: JSON.stringify({ items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })) }) })
      setOrders((current) => [order, ...current])
      setCart([])
      setMessage('Pedido registrado como pendiente de pago. La confirmación real de pago todavía no está configurada.')
    } catch (requestError) { setError(requestError.message) }
  }
  const requestPrint = async (id) => {
    try {
      const { order } = await apiRequest(`/store/orders/${id}/print-request`, { method: 'POST' })
      setOrders((current) => current.map((item) => item.id === id ? { ...item, ...order } : item))
      setMessage('Solicitud de impresión registrada. El plazo de despacho es de hasta 15 días desde hoy.')
    } catch (requestError) { setError(requestError.message) }
  }

  return <main className="store-shell">
    <header className="store-header"><a href="/">chatenlugar</a><nav><a href="/campanias">Campañas</a><a href="/explorar">Explorar</a><a className="active" href="/tienda">Tienda</a><a href="/perfil">Mi perfil</a></nav></header>
    <section className="store-hero"><p>PRODUCTOS OFICIALES</p><h1>Productos para tu trabajo y colección.</h1><span>Las compras se registran primero como pendientes de pago. La impresión se solicita solo después de confirmar el pago.</span></section>
    <section className="store-content">
      {error && <p className="store-state error">{error}</p>}{message && <p className="store-state success">{message}</p>}
      <div className="store-layout"><section><h2>Catálogo</h2>{loading ? <p className="store-state">Cargando catálogo.</p> : products.length ? <div className="product-grid">{products.map((product) => <article className="product-card" key={product.id}><span>{product.product_type === 'shirt_bundle' ? 'Fardo de poleras' : product.product_type === 'themed_shirt' ? 'Polera temática' : 'Tarjeta coleccionable'}</span><h3>{product.name}</h3><p>{product.description || 'Producto oficial de chatenlugar.'}</p>{product.campaign_name && <small>Campaña: {product.campaign_name}</small>}<strong>{money(product.price_cents)}</strong><button type="button" disabled={product.stock === 0} onClick={() => add(product)}>{product.stock === 0 ? 'Sin disponibilidad' : 'Agregar al pedido'}</button></article>)}</div> : <p className="store-state">Todavía no hay productos oficiales publicados. El catálogo aparecerá aquí cuando administración los habilite.</p>}</section>
      <aside className="cart-card"><h2>Tu pedido</h2>{cart.length ? <><ul>{cart.map((item) => <li key={item.id}><span>{item.name} × {item.quantity}</span><strong>{money(item.price_cents * item.quantity)}</strong></li>)}</ul><div><span>Total</span><strong>{money(total)}</strong></div><button type="button" onClick={checkout}>Registrar pedido</button></> : <p>Agrega productos publicados para preparar un pedido.</p>}</aside></div>
      {user && <section className="orders-section"><h2>Mis pedidos</h2>{orders.length ? <div className="orders-grid">{orders.map((order) => <article key={order.id}><header><strong>{order.status_label}</strong><time>{date(order.created_at)}</time></header><p>{order.items?.map((item) => `${item.name} × ${item.quantity}`).join(', ') || 'Detalle de productos pendiente.'}</p><b>{money(order.total_cents)}</b>{order.status === 'pending_payment' && <span className="order-note">Pendiente de pago: la integración de pago aún no está configurada.</span>}{order.status === 'paid' && <button type="button" onClick={() => requestPrint(order.id)}>Solicitar impresión</button>}{order.print_requested_at && <span className="order-note">Despacho estimado hasta el {date(order.dispatch_deadline)}.</span>}</article>)}</div> : <p className="store-state">Aún no registras pedidos.</p>}</section>}
    </section>
  </main>
}
