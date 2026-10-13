import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from './platform-api'
import WorkspaceChrome, { WorkspaceIcon } from './WorkspaceChrome'

const route = () => window.location.pathname.split('/').filter(Boolean)[0] || 'campanias'
const copy = {
  campanias: { eyebrow: 'CAMPAÑAS', title: 'Encuentra trabajo por turnos.', text: 'Revisa las campañas publicadas, su letra actual y los turnos disponibles.' },
  explorar: { eyebrow: 'EXPLORAR', title: 'Explora campañas.', text: 'Busca una palabra, revisa campañas y encuentra el espacio de trabajo adecuado.' },
}

export default function PlatformHub() {
  const [section, setSection] = useState(route)
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '')
  const [campaigns, setCampaigns] = useState([])
  const [explore, setExplore] = useState({ people: [], collections: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const config = copy[section] || copy.campanias

  useEffect(() => { const sync = () => setSection(route()); window.addEventListener('popstate', sync); return () => window.removeEventListener('popstate', sync) }, [])
  useEffect(() => {
    let current = true
    setLoading(true); setError('')
    const endpoint = section === 'explorar' ? `/explore?q=${encodeURIComponent(query.trim())}` : `/campaigns?q=${encodeURIComponent(query.trim())}`
    apiRequest(endpoint).then((data) => {
      if (!current) return
      setCampaigns(data.campaigns || [])
      setExplore({ people: data.people || [], collections: data.collections || [] })
    }).catch((requestError) => current && setError(requestError.message)).finally(() => current && setLoading(false))
    return () => { current = false }
  }, [section, query])

  const resultLabel = useMemo(() => query.trim() ? `Resultados para “${query.trim()}”` : 'Campañas disponibles', [query])
  const submit = (event) => { event.preventDefault(); const target = `/explorar?q=${encodeURIComponent(query.trim())}`; window.history.pushState({}, '', target); setSection('explorar') }

  return <WorkspaceChrome active={section === 'explorar' ? 'explore' : 'campaigns'}>
    <header className="route-heading"><div><p>{config.eyebrow}</p><h1>{config.title}</h1><span>{config.text}</span></div><div className="route-heading-aside">DICCIONARIO DE CAMPAÑAS<strong>{loading ? 'Actualizando' : `${campaigns.length} disponibles`}</strong></div></header>
    <div className="route-layout"><section className="route-content">
      <form className="route-topbar" onSubmit={submit}><label className="route-search"><WorkspaceIcon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca una campaña por nombre o palabra clave" aria-label="Busca una campaña" /><button type="submit" aria-label="Buscar"><WorkspaceIcon name="arrow" /></button></label></form>
      <div className="route-section-title"><h2>{resultLabel}</h2><span>{loading ? 'Buscando' : `${campaigns.length} resultados`}</span></div>
      {error && <p className="route-state error">{error}</p>}
      {!error && loading && <p className="route-state">Consultando campañas disponibles.</p>}
      {!error && !loading && !campaigns.length && <p className="route-state">No encontramos campañas con ese criterio.</p>}
      {!error && !loading && Boolean(campaigns.length) && <div className="route-campaign-grid">{campaigns.map((campaign) => <article className="route-campaign route-card" key={campaign.id || campaign.slug}><div><small>CAMPAÑA</small><h3>{campaign.name}</h3><p>{campaign.short_description || campaign.description || 'Campaña disponible para trabajar por turnos.'}</p><div className="route-campaign-meta"><span>LETRA ACTUAL<strong>{campaign.current_letter || 'Pendiente'}</strong></span><span>PRÓXIMO TURNO<strong>{campaign.next_turn?.toLocaleString('es-CL') || 'Consultar'}</strong></span></div></div><a href={`/campania/${campaign.slug}`} aria-label={`Abrir campaña ${campaign.name}`}><WorkspaceIcon name="arrow" /></a></article>)}</div>}
      {section === 'explorar' && !loading && <div className="route-explore"><div className="route-section-title"><h2>Personas y colecciones</h2></div>{(explore.people.length || explore.collections.length) ? <div className="route-campaign-grid">{explore.people.map((person) => <article className="route-campaign route-card" key={person.handle}><div><small>PERSONA</small><h3>{person.name}</h3><p>@{person.handle}{person.bio ? ` · ${person.bio}` : ''}</p></div></article>)}{explore.collections.map((collection) => <article className="route-campaign route-card" key={collection.id}><div><small>COLECCIÓN</small><h3>{collection.name}</h3><p>{collection.description || `por @${collection.owner_handle}`}</p></div></article>)}</div> : <p className="route-state">No hay personas ni colecciones públicas para ese criterio.</p>}</div>}
    </section><aside className="route-aside"><h2>Tu próxima jornada</h2><div className="route-info"><h3>Revisa tu campaña</h3><p>Al ingresar a una campaña podrás solicitar, iniciar y finalizar tu turno según el estado asignado.</p></div><a className="route-action" href="/campanias">Ver campañas <WorkspaceIcon name="arrow" /></a></aside></div>
  </WorkspaceChrome>
}
