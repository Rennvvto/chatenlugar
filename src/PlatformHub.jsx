import { useEffect, useMemo, useState } from 'react'
import { apiRequest } from './platform-api'
import './platform-hub.css'
import './explore.css'

const sections = {
  campanias: { label: 'Campañas', eyebrow: 'ESPACIOS DE TRABAJO', title: 'Encuentra una campaña para trabajar.', copy: 'Revisa las campañas activas, su letra actual y el próximo turno disponible.', showCampaigns: true },
  explorar: { label: 'Explorar', eyebrow: 'BÚSQUEDA', title: 'Explora el diccionario de campañas.', copy: 'Busca una palabra o revisa los espacios de trabajo disponibles.', showCampaigns: true },
  comunidad: { label: 'Equipo', eyebrow: 'COMUNIDAD DE TRABAJO', title: 'Actualizaciones del equipo.', copy: 'Aquí se reunirán las actualizaciones públicas de trabajo. Aún no hay contenido publicado.', empty: 'Cuando existan actualizaciones publicadas, aparecerán en este espacio.' },
  tienda: { label: 'Tienda', eyebrow: 'PRODUCTOS OFICIALES', title: 'Poleras Temáticas y fardos.', copy: 'El catálogo oficial se habilitará aquí cuando los productos estén publicados.', empty: 'Todavía no hay productos disponibles para comprar.' },
  colecciones: { label: 'Colecciones', eyebrow: 'PIEZAS DE USUARIOS', title: 'Colecciones registradas.', copy: 'Las colecciones públicas aparecerán aquí cuando sus propietarios las publiquen.', empty: 'Todavía no hay colecciones públicas disponibles.' },
}

const Icon = ({ name }) => {
  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    campaign: <><path d="M5 20V5" /><path d="M5 6h12l-2 4 2 4H5" /></>,
  }
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.arrow}</svg>
}

const currentSection = () => window.location.pathname.split('/').filter(Boolean)[0] || 'campanias'

export default function PlatformHub() {
  const [section, setSection] = useState(currentSection)
  const [query, setQuery] = useState(() => new URLSearchParams(window.location.search).get('q') || '')
  const [campaigns, setCampaigns] = useState([])
  const [explore, setExplore] = useState({ people: [], collections: [] })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const config = sections[section] || sections.campanias

  useEffect(() => {
    const syncRoute = () => setSection(currentSection())
    window.addEventListener('popstate', syncRoute)
    return () => window.removeEventListener('popstate', syncRoute)
  }, [])

  useEffect(() => {
    if (!config.showCampaigns) return
    let active = true
    setLoading(true)
    setError('')
    const endpoint = section === 'explorar' ? `/explore?q=${encodeURIComponent(query.trim())}` : `/campaigns?q=${encodeURIComponent(query.trim())}`
    apiRequest(endpoint).then((data) => {
      if (!active) return
      setCampaigns(data.campaigns)
      setExplore({ people: data.people || [], collections: data.collections || [] })
    }).catch((requestError) => {
      if (active) setError(requestError.message)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [config.showCampaigns, query, section])

  const resultLabel = useMemo(() => query.trim() ? `Resultados para “${query.trim()}”` : 'Campañas activas', [query])
  const navigate = (target) => {
    window.history.pushState({}, '', target)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }

  return <main className="hub-shell">
    <header className="hub-header"><a href="/" className="hub-brand">chatenlugar</a><nav aria-label="Navegación principal">{Object.entries(sections).map(([key, item]) => <a key={key} className={section === key ? 'active' : ''} href={`/${key}`}>{item.label}</a>)}<a href="/perfil">Mi perfil</a></nav></header>
    <section className="hub-hero"><p>{config.eyebrow}</p><h1>{config.title}</h1><span>{config.copy}</span></section>
    <section className="hub-content">
      {config.showCampaigns ? <>
        <form className="hub-search" onSubmit={(event) => { event.preventDefault(); navigate(`/explorar?q=${encodeURIComponent(query.trim())}`) }}><Icon name="search" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca una campaña" aria-label="Busca una campaña" /><button type="submit" aria-label="Buscar"><Icon name="arrow" /></button></form>
        <div className="hub-result-heading"><h2>{resultLabel}</h2><span>{loading ? 'Buscando' : `${campaigns.length} disponibles`}</span></div>
        {error && <p className="hub-state error">{error}</p>}
        {!error && loading && <p className="hub-state">Consultando campañas disponibles.</p>}
        {!error && !loading && !campaigns.length && <p className="hub-state">No encontramos campañas con ese nombre.</p>}
        {!error && !loading && campaigns.length > 0 && <div className="hub-grid">{campaigns.map((campaign) => <article key={campaign.id || campaign.slug} className="hub-campaign"><div><span>CAMPAÑA</span><h3>{campaign.name}</h3></div><p>{campaign.short_description || campaign.description}</p><dl><div><dt>Letra actual</dt><dd>{campaign.current_letter || 'Disponible'}</dd></div><div><dt>Próximo turno</dt><dd>{campaign.next_turn?.toLocaleString('es-CL') || 'Consulta campaña'}</dd></div></dl><a href={`/campania/${campaign.slug}`}>Abrir campaña <Icon name="arrow" /></a></article>)}</div>}
        {!error && !loading && section === 'explorar' && <div className="hub-explore-groups"><section><h2>Personas</h2>{explore.people.length ? <div className="hub-mini-grid">{explore.people.map((person) => <article key={person.handle}><strong>{person.name}</strong><span>@{person.handle}</span><p>{person.bio || 'Sin descripción pública.'}</p></article>)}</div> : <p className="hub-state">No encontramos personas con ese criterio.</p>}</section><section><h2>Colecciones</h2>{explore.collections.length ? <div className="hub-mini-grid">{explore.collections.map((collection) => <article key={collection.id}><strong>{collection.name}</strong><span>por @{collection.owner_handle}</span><p>{collection.description || 'Sin descripción pública.'}</p></article>)}</div> : <p className="hub-state">No hay colecciones públicas que mostrar.</p>}</section></div>}
      </> : <div className="hub-empty"><Icon name="campaign" /><h2>{config.empty}</h2><p>Mientras habilitamos este módulo, puedes revisar las campañas que ya están disponibles.</p><a href="/campanias">Ver campañas <Icon name="arrow" /></a></div>}
    </section>
  </main>
}
