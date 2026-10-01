import { useEffect, useMemo, useState } from 'react'
import CampaignWorkspace from './CampaignWorkspace'
import ProfileView from './ProfileView'
import { clearLocalSession, getLocalSession, loginLocalUser, registerLocalUser } from './local-auth'

const campaigns = [
  {
    id: 'hola',
    name: 'HOLA',
    letter: 'H',
    description: 'Campaña activa en el diccionario.',
    current: '4.982',
    turn: '5.000',
    accent: 'coral',
  },
  {
    id: 'sushi',
    name: 'Sushi',
    letter: 'S',
    description: 'Campaña gastronómica en curso.',
    current: '3.016',
    turn: '3.180',
    accent: 'sky',
  },
  {
    id: 'pizza',
    name: 'Pizza',
    letter: 'P',
    description: 'Campaña gastronómica en curso.',
    current: '2.765',
    turn: '2.980',
    accent: 'gold',
  },
  {
    id: 'hamburguesas',
    name: 'Hamburguesas',
    letter: 'H',
    description: 'Campaña gastronómica en curso.',
    current: '1.807',
    turn: '2.050',
    accent: 'mint',
  },
]

const steps = [
  {
    number: '01',
    icon: 'search',
    title: 'Elige una campaña',
    text: 'Explora el diccionario y encuentra una palabra que te mueva.',
  },
  {
    number: '02',
    icon: 'letters',
    title: 'Participa por letras',
    text: 'Conversa y aporta para avanzar junto a la comunidad.',
  },
  {
    number: '03',
    icon: 'ticket',
    title: 'Llega a tu turno',
    text: 'Sigue el orden de turnos de forma clara y transparente.',
  },
  {
    number: '04',
    icon: 'cards',
    title: 'Suma a tu colección',
    text: 'Cada campaña deja piezas únicas para tu colección.',
  },
]

function Icon({ name, size = 20, stroke = 1.8 }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: stroke,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  const paths = {
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    users: <><path d="M16 20v-1.4a4.1 4.1 0 0 0-4.1-4.1H7.1A4.1 4.1 0 0 0 3 18.6V20" /><circle cx="9.5" cy="7.5" r="3.2" /><path d="M17 10.4a3.2 3.2 0 0 0 0-6.1M21 20v-1.4a4.1 4.1 0 0 0-2.8-3.9" /></>,
    chat: <><path d="M20 11.4a7.3 7.3 0 0 1-7.5 7.1 8.4 8.4 0 0 1-3.2-.6L4 20l1.6-4.1A6.7 6.7 0 0 1 5 13.2a7.3 7.3 0 0 1 7.5-7.1 7.3 7.3 0 0 1 7.5 5.3Z" /></>,
    cards: <><rect x="5" y="4" width="12" height="16" rx="2" /><path d="M8 4V3a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-1" /><path d="M8 9h6M8 13h4" /></>,
    ticket: <><path d="M4 8a2 2 0 0 0 0 4v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4a2 2 0 0 0 0-4V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2Z" /><path d="M13 2v16" /></>,
    letters: <><rect x="3" y="5" width="8" height="8" rx="1.5" /><path d="M5.5 10 7 7.6 8.5 10M6 9h2" /><rect x="13" y="11" width="8" height="8" rx="1.5" /><path d="M15.5 14h3M15.5 16.5h3" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
    sparkle: <><path d="m12 3 1.25 5.75L19 10l-5.75 1.25L12 17l-1.25-5.75L5 10l5.75-1.25Z" /><path d="m19 16 .55 2.45L22 19l-2.45.55L19 22l-.55-2.45L16 19l2.45-.55Z" /></>,
    print: <><path d="M6 9V3h12v6" /><rect x="5" y="14" width="14" height="7" rx="1" /><path d="M5 11H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1M19 11h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1M8 17h8" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></>,
    moon: <path d="M20.4 15.3A8.8 8.8 0 0 1 8.7 3.6 8.9 8.9 0 1 0 20.4 15.3Z" />,
  }

  return <svg {...common}>{paths[name] || paths.sparkle}</svg>
}

function CampaignMark({ campaign, small = false }) {
  return (
    <div className={`campaign-mark ${campaign.accent} ${small ? 'small' : ''}`} aria-hidden="true">
      <span>{campaign.letter}</span>
      <i />
    </div>
  )
}

function Modal({ mode, campaign, onClose, onAuthenticated }) {
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setAuthError('')
    setIsSubmitting(false)
  }, [mode])

  if (!mode) return null

  const isPrint = mode === 'print'
  const isLogin = mode === 'login'
  const handleAuth = async (event) => {
    event.preventDefault()
    const inputs = event.currentTarget.querySelectorAll('input')
    const credentials = isLogin ? { email: inputs[0].value, password: inputs[1].value } : { name: inputs[0].value, email: inputs[1].value, password: inputs[2].value }
    setAuthError('')
    setIsSubmitting(true)
    try {
      const session = isLogin ? await loginLocalUser(credentials) : await registerLocalUser(credentials)
      onAuthenticated(session)
      window.location.assign('/perfil')
    } catch (error) {
      setAuthError(error.message)
      setIsSubmitting(false)
    }
  }
  const title = isPrint ? 'Solicitar impresión' : isLogin ? 'Bienvenido a chatenlugar' : 'Crea tu cuenta'

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <button className="icon-button modal-close" type="button" aria-label="Cerrar" onClick={onClose}>
          <Icon name="close" />
        </button>
        <div className="modal-badge"><Icon name={isPrint ? 'print' : 'sparkle'} size={18} /></div>
        <h2 id="modal-title">{title}</h2>
        {isPrint ? (
          <>
            <p>Tu pieza de <strong>{campaign.name}</strong> entrará a preparación cuando confirmes la solicitud.</p>
            <div className="modal-info"><span>Despacho estimado</span><strong>Hasta 15 días</strong></div>
            <button className="button button-primary modal-action" type="button" onClick={onClose}>Confirmar solicitud <Icon name="arrow" size={18} /></button>
          </>
        ) : (
          <form onSubmit={handleAuth}>
            {authError && <p className="modal-error" role="alert">{authError}</p>}
            {!isLogin && <label>Nombre<input required placeholder="¿Cómo te llamas?" /></label>}
            <label>Correo electrónico<input required type="email" placeholder="tu@correo.cl" /></label>
            <label>Contraseña<input required type="password" placeholder="••••••••" /></label>
            <button className="button button-primary modal-action" disabled={isSubmitting} type="submit">{isSubmitting ? 'Comprobando…' : isLogin ? 'Ingresar a chatenlugar' : 'Crear mi cuenta'} <Icon name="arrow" size={18} /></button>
          </form>
        )}
      </section>
    </div>
  )
}

export default function App() {
  if (window.location.pathname.startsWith('/campania')) return <CampaignWorkspace />
  if (window.location.pathname.startsWith('/perfil')) return <ProfileView />

  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('hola')
  const [modal, setModal] = useState(null)
  const [session, setSession] = useState(() => getLocalSession())
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchFocused, setSearchFocused] = useState(false)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('chatenlugar-theme') || 'day')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('chatenlugar-theme', theme)
  }, [theme])

  useEffect(() => {
    const access = new URLSearchParams(window.location.search).get('acceso')
    if (access === 'login' || access === 'signup') {
      setModal(access)
      window.history.replaceState({}, '', '/')
    }
  }, [])

  const filteredCampaigns = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('es-CL')
    if (!normalized) return campaigns
    return campaigns.filter((campaign) => campaign.name.toLocaleLowerCase('es-CL').includes(normalized))
  }, [query])

  const selected = campaigns.find((campaign) => campaign.id === selectedId) || campaigns[0]

  const selectCampaign = (campaign) => {
    setSelectedId(campaign.id)
    setQuery('')
    document.getElementById('actividad')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const useSuggestion = (campaign) => {
    setQuery(campaign.name)
    setSelectedId(campaign.id)
    setSearchFocused(false)
  }

  return (
    <main className="site-shell">
      <header className="site-header container">
        <a className="brand" href="#inicio" aria-label="chatenlugar, inicio">chatenlugar</a>
        <button className="mobile-toggle" type="button" aria-label="Abrir menú" onClick={() => setMobileOpen((open) => !open)}><Icon name="menu" /></button>
        <nav className={mobileOpen ? 'primary-nav open' : 'primary-nav'} aria-label="Navegación principal">
          <a href="#diccionario" onClick={() => setMobileOpen(false)}>Diccionario</a>
          <a href="#campanas" onClick={() => setMobileOpen(false)}>Campañas</a>
          <a href="#coleccion" onClick={() => setMobileOpen(false)}>Colecciones</a>
          <a href="#como-funciona" onClick={() => setMobileOpen(false)}>Cómo funciona</a>
        </nav>
        <div className="header-actions">
          <button className="theme-toggle" type="button" onClick={() => setTheme((current) => current === 'day' ? 'night' : 'day')} aria-label={theme === 'day' ? 'Activar modo noche' : 'Activar modo día'} title={theme === 'day' ? 'Modo noche' : 'Modo día'}>
            <Icon name={theme === 'day' ? 'moon' : 'sun'} size={19} />
            <span>{theme === 'day' ? 'Noche' : 'Día'}</span>
          </button>
          {session ? <><a className="button button-quiet" href="/perfil">Mi perfil</a><button className="button button-coral" type="button" onClick={() => { clearLocalSession(); setSession(null) }}>Cerrar sesión</button></> : <><button className="button button-quiet" type="button" onClick={() => setModal('login')}>Ingresar</button><button className="button button-coral" type="button" onClick={() => setModal('signup')}>Crear cuenta</button></>}
        </div>
      </header>

      <section id="inicio" className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">DICCIONARIO DE CAMPAÑAS</p>
          <h1>Participa en campañas<br />por turnos.</h1>
          <p className="hero-description">Encuentra una campaña y recorre sus letras a tu ritmo, desde el diccionario.</p>
          <div className={`search-experience ${searchFocused ? 'is-active' : ''}`} id="diccionario">
            <p className="search-kicker"><Icon name="sparkle" size={15} /> Explora el diccionario</p>
            <form className="search-bar" onSubmit={(event) => { event.preventDefault(); setSearchFocused(false); document.getElementById('campanas')?.scrollIntoView({ behavior: 'smooth' }) }}>
              <span className="search-symbol"><Icon name="search" size={21} /></span>
              <input value={query} onFocus={() => setSearchFocused(true)} onBlur={() => window.setTimeout(() => setSearchFocused(false), 140)} onChange={(event) => setQuery(event.target.value)} placeholder="Busca una campaña" aria-label="Busca una campaña" />
              {query && <button className="search-clear" type="button" aria-label="Limpiar búsqueda" onMouseDown={(event) => event.preventDefault()} onClick={() => setQuery('')}><Icon name="close" size={16} /></button>}
              <button className="search-submit" type="submit" aria-label="Ver campañas"><span>Ver campañas</span><i><Icon name="arrow" size={20} /></i></button>
            </form>
            <div className="search-suggestions" aria-label="Campañas sugeridas">
              {filteredCampaigns.length ? <><span>{query ? 'Resultados disponibles' : 'Campañas sugeridas'}</span><div>{filteredCampaigns.map((campaign) => <button key={campaign.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => useSuggestion(campaign)}>{campaign.name}</button>)}</div></> : <span>No encontramos esa campaña. Prueba con HOLA, Sushi, Pizza o Hamburguesas.</span>}
            </div>
          </div>
        </div>
        <div className="hero-route" aria-label="Recorrido de letras de una campaña">
          <p>PARTICIPA<br />POR LETRAS</p>
          <div className="route-line" />
          {['H', 'O', 'L', 'A'].map((letter, index) => <div className={`letter-tile tile-${index}`} key={letter}>{letter}</div>)}
          <div className="hero-ticket"><span>TURNO</span><strong>5.000</strong></div>
        </div>
      </section>

      <section id="campanas" className="content-panel container campaigns-panel reveal reveal-one">
        <div className="section-heading">
          <div><p className="eyebrow eyebrow-dark">DICCIONARIO</p><h2>Campañas destacadas</h2></div>
          <button type="button" className="text-button" onClick={() => setQuery('')}>Ver todas <Icon name="arrow" size={17} /></button>
        </div>
        <div className="campaign-grid">
          {filteredCampaigns.map((campaign) => (
            <article className={`campaign-card ${selected.id === campaign.id ? 'selected' : ''}`} key={campaign.id}>
              <CampaignMark campaign={campaign} />
              <div className="campaign-card-copy">
                <h3>{campaign.name}</h3>
                <p>{campaign.description}</p>
              </div>
              <div className="current-letter">Letra actual: <strong>{campaign.letter}</strong></div>
              <div className="campaign-meta"><span><small>Puja actual</small><strong>{campaign.current}</strong></span><span><small>Próximo turno</small><strong>{campaign.turn}</strong></span></div>
              <button className="campaign-link" type="button" onClick={() => selectCampaign(campaign)}>Ver campaña <Icon name="arrow" size={17} /></button>
            </article>
          ))}
        </div>
        {!filteredCampaigns.length && <p className="empty-state">No encontramos una campaña con ese nombre. Prueba con HOLA, Sushi, Pizza o Hamburguesas.</p>}
      </section>

      <section id="como-funciona" className="content-panel container steps-panel reveal reveal-two">
        <div className="section-heading compact"><div><p className="eyebrow eyebrow-dark">RECORRIDO</p><h2>Cómo funciona</h2></div></div>
        <div className="steps-grid">
          {steps.map((step, index) => (
            <div className="step" key={step.number}>
              <div className="step-number">{step.number}</div>
              <div className="step-icon"><Icon name={step.icon} size={25} /></div>
              <div><h3>{step.title}</h3><p>{step.text}</p></div>
              {index < steps.length - 1 && <Icon name="arrow" size={22} />}
            </div>
          ))}
        </div>
      </section>

      <section id="actividad" className="content-panel container activity-panel reveal reveal-three">
        <div className="section-heading"><div><p className="eyebrow eyebrow-dark">EN VIVO</p><h2>Ahora en chatenlugar</h2></div><button className="text-button" type="button" onClick={() => selectCampaign(selected)}>Actualizar vista <Icon name="arrow" size={17} /></button></div>
        <div className="activity-grid">
          <article className="turn-card">
            <div className="turn-campaign"><CampaignMark campaign={selected} small /><div><span>CAMPAÑA</span><strong>{selected.name}</strong></div></div>
            <div className="turn-count"><span>Puja actual</span><strong>{selected.current}</strong></div>
            <div className="turn-ticket"><span>Tu turno</span><strong>{selected.turn}</strong></div>
          </article>
          <article className="conversation-card">
            <div className="conversation-title"><Icon name="chat" size={19} /><span>Actividad de la sala</span><time>Actualizado</time></div>
            <p>Revisa los aportes y comentarios recientes de la campaña antes de participar.</p>
            <button type="button" className="mini-action" onClick={() => setModal('signup')}>Participar</button>
          </article>
          <article className="ad-card">
            <span>PUBLICIDAD</span>
            <strong>Espacio para publicidad de la campaña.</strong>
            <button type="button" className="mini-action">Conoce más <Icon name="arrow" size={15} /></button>
          </article>
        </div>
      </section>

      <section id="coleccion" className="collection-strip container reveal reveal-four">
        <div className="collection-copy"><div className="collection-icon"><Icon name="cards" size={28} /></div><div><p className="eyebrow eyebrow-dark">TU COLECCIÓN</p><h2>Solicita impresión cuando corresponda.</h2><p>La disponibilidad de impresión depende del estado de tu colección.</p></div></div>
        <button type="button" className="button button-outline" onClick={() => setModal('print')}>Solicitar impresión <Icon name="arrow" size={18} /></button>
        <span className="dispatch-note">Despacho: hasta 15 días</span>
      </section>

      <footer className="site-footer container"><strong>chatenlugar</strong><span>Campañas, conversaciones y colecciones.</span><div><a href="#inicio">Centro de ayuda</a><a href="#inicio">Términos</a><a href="#inicio">Privacidad</a></div></footer>

      <Modal mode={modal} campaign={selected} onClose={() => setModal(null)} onAuthenticated={setSession} />
    </main>
  )
}
