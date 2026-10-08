import { useEffect, useState } from 'react'
import { apiRequest } from './platform-api'

export default function AdminOperations() {
  const [campaigns, setCampaigns] = useState([]); const [products, setProducts] = useState([]); const [assignments, setAssignments] = useState([]); const [error, setError] = useState('')
  const load = () => Promise.all([apiRequest('/admin/campaigns'), apiRequest('/admin/products'), apiRequest('/admin/assignments')]).then(([c,p,a]) => { setCampaigns(c.campaigns); setProducts(p.products); setAssignments(a.assignments) }).catch(e => setError(e.message))
  useEffect(() => { load() }, [])
  const updateAssignment = async (id, status) => { try { await apiRequest(`/admin/assignments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); load() } catch (e) { setError(e.message) } }
  return <section className="admin-operations"><h2>Operación de campañas y turnos</h2>{error && <p>{error}</p>}<div className="admin-grid"><section><h3>Campañas</h3>{campaigns.map(x => <div key={x.id}><strong>{x.name}</strong><span>{x.status} · turno {x.next_turn}</span></div>)}</section><section><h3>Productos</h3>{products.map(x => <div key={x.id}><strong>{x.name}</strong><span>{x.is_active ? 'Publicado' : 'Oculto'} · ${x.price_cents}</span></div>)}</section><section><h3>Turnos</h3>{assignments.map(x => <div key={x.id}><strong>{x.worker_name} · {x.campaign_name}</strong><span>Turno {x.target_turn}: {x.status}</span>{x.status === 'queued' && <button onClick={() => updateAssignment(x.id, 'active')}>Iniciar</button>}{x.status === 'active' && <button onClick={() => updateAssignment(x.id, 'completed')}>Completar</button>}</div>)}</section></div></section>
}
