import { useEffect, useState } from 'react'
import { apiRequest, getCachedSession } from './platform-api'
import './admin.css'

export default function AdminView() {
  const [overview, setOverview] = useState(null)
  const [users, setUsers] = useState([])
  const [orders, setOrders] = useState([])
  const [rules, setRules] = useState([])
  const [error, setError] = useState('')
  const user = getCachedSession()?.user
  useEffect(() => {
    if (!user) return window.location.assign('/?acceso=login')
    Promise.all([apiRequest('/admin/overview'), apiRequest('/admin/users'), apiRequest('/admin/orders'), apiRequest('/admin/rules')]).then(([overviewData, userData, orderData, ruleData]) => {
      setOverview(overviewData.overview); setUsers(userData.users); setOrders(orderData.orders); setRules(ruleData.rules)
    }).catch((requestError) => setError(requestError.message))
  }, [])
  if (error) return <main className="admin-shell"><header><a href="/">chatenlugar</a></header><section className="admin-state"><h1>Administración restringida</h1><p>{error}</p><a href="/">Volver al inicio</a></section></main>
  return <main className="admin-shell"><header><a href="/">chatenlugar</a><nav><a href="/campanias">Campañas</a><a href="/tienda">Tienda</a><a href="/perfil">Mi perfil</a></nav></header><section className="admin-hero"><p>ADMINISTRACIÓN</p><h1>Operación de la plataforma.</h1><span>Las reglas de comisiones, pujas y ganancias permanecen inactivas hasta contar con una definición comercial aprobada.</span></section><section className="admin-content">{!overview ? <p className="admin-state">Cargando información administrativa.</p> : <><div className="admin-stats">{Object.entries(overview).map(([key, value]) => <article key={key}><span>{key.replaceAll('_', ' ')}</span><strong>{value}</strong></article>)}</div><div className="admin-grid"><section><h2>Usuarios recientes</h2>{users.length ? <ul>{users.map((item) => <li key={item.id}><strong>{item.name}</strong><span>@{item.handle} · {item.role}</span></li>)}</ul> : <p>Sin usuarios registrados.</p>}</section><section><h2>Pedidos recientes</h2>{orders.length ? <ul>{orders.map((item) => <li key={item.id}><strong>{item.customer_name}</strong><span>{item.status}</span></li>)}</ul> : <p>Sin pedidos registrados.</p>}</section><section><h2>Configuración comercial</h2>{rules.length ? <ul>{rules.map((item) => <li key={item.key}><strong>{item.key}</strong><span>{item.is_active ? 'Activa' : 'Inactiva'}</span></li>)}</ul> : <p>No hay reglas configuradas. No se aplican cálculos monetarios sin una regla aprobada.</p>}</section></div></>}</section></main>
}
