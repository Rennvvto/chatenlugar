import { useEffect, useMemo, useState } from 'react'
import './campaign-workspace.css'
import { apiRequest, getCachedSession, restoreSession } from './platform-api'
import logoMark from './assets/chatenlugar-logo.png'
import NotificationCenter from './NotificationCenter'

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    campaign: <><path d="M5 20V5" /><path d="M5 6h12l-2 4 2 4H5" /></>,
    community: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.2a4.5 4.5 0 0 1 4.5-4.5h2A4.5 4.5 0 0 1 14.5 18.8V20" /><path d="M16 7.3a2.8 2.8 0 0 1 0 5.4M20.5 20v-1.2a4.5 4.5 0 0 0-2.7-4.1" /></>,
    compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2.3 4.7-4.7 2.3 2.3-4.7 4.7-2.3Z" /></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20v-1a7 7 0 0 1 14 0v1" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    send: <><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></>,
    moon: <path d="M20.4 15.3A8.8 8.8 0 0 1 8.7 3.6 8.9 8.9 0 1 0 20.4 15.3Z" />,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  }
  return <svg {...common}>{paths[name] || paths.campaign}</svg>
}

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
const formatTime = (value) => new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
const campaignSlug = () => window.location.pathname.split('/').filter(Boolean).pop() || 'sushi'

export default function CampaignWorkspace() {
  const slug = campaignSlug()
  const [campaign, setCampaign] = useState(null)
  const [updates, setUpdates] = useState([])
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('chatenlugar-theme') || 'day')
  const [user, setUser] = useState(() => getCachedSession()?.user || null)

  const loadCampaign = async () => {
    setLoading(true)
    setError('')
    try {
      const [campaignResponse, updatesResponse, session] = await Promise.all([apiRequest(`/campaigns/${slug}`), apiRequest(`/campaigns/${slug}/updates`), restoreSession().catch(() => null)])
      setCampaign(campaignResponse.campaign)
      setUpdates(updatesResponse.updates)
      setUser(session?.user || null)
    } catch (requestError) {
      setError(requestError.message)
    } finally { setLoading(false) }
  }

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('chatenlugar-theme', theme)
  }, [theme])

  useEffect(() => { loadCampaign() }, [slug])

  const assignment = campaign?.assignment
  const action = assignment?.status === 'queued' ? 'start' : assignment?.status === 'active' ? 'complete' : 'assign'
  const actionLabel = assignment?.status === 'queued' ? 'Iniciar jornada' : assignment?.status === 'active' ? 'Finalizar jornada' : assignment?.status === 'completed' ? 'Jornada registrada' : 'Solicitar turno'
  const canPublish = assignment?.status === 'active'
  const progress = useMemo(() => campaign ? `${campaign.completed_letters || 0} de ${campaign.total_letters || 0} letras completadas` : '', [campaign])

  const handleWorkAction = async () => {
    if (!user) {
      window.location.assign('/?acceso=login')
      return
    }
    if (assignment?.status === 'completed') return
    setWorking(true)
    setNotice('')
    setError('')
    try {
      const endpoint = action === 'assign' ? `/${slug}/assignment` : `/${slug}/assignment/${action}`
      const result = await apiRequest(`/campaigns${endpoint}`, { method: 'POST' })
      setCampaign((current) => ({ ...current, assignment: result.assignment }))
      setNotice(action === 'assign' ? 'Tu turno quedó asignado.' : action === 'start' ? 'Tu jornada está activa.' : 'Tu jornada quedó finalizada.')
    } catch (requestError) {
      setError(requestError.message)
    } finally { setWorking(false) }
  }

  const publishUpdate = async (event) => {
    event.preventDefault()
    const body = message.trim()
    if (!body) return
    setWorking(true)
    setError('')
    try {
      const { update } = await apiRequest(`/campaigns/${slug}/updates`, { method: 'POST', body: JSON.stringify({ body }) })
      setUpdates((current) => [{ ...update, author_name: user.name, author_handle: user.handle }, ...current])
      setMessage('')
      setNotice('Actualización publicada.')
    } catch (requestError) {
      setError(requestError.message)
    } finally { setWorking(false) }
  }

  if (loading) return <main className="workspace-shell"><section className="workspace-frame workspace-loading">Cargando campaña.</section></main>
  if (error && !campaign) return <main className="workspace-shell"><section className="workspace-frame workspace-loading">{error}<a href="/campanias">Volver a campañas</a></section></main>

  return <main className="workspace-shell">
    <section className="workspace-frame" aria-label={`Espacio de campaña ${campaign.name}`}>
      <header className="workspace-topbar"><a href="/" className="workspace-brand" aria-label="chatenlugar, inicio"><img src={logoMark} alt="" /><span>chatenlugar</span></a><div className="workspace-top-actions"><button className="workspace-icon-button workspace-theme" type="button" onClick={() => setTheme((current) => current === 'day' ? 'night' : 'day')} aria-label={theme === 'day' ? 'Activar modo noche' : 'Activar modo día'}><Icon name={theme === 'day' ? 'moon' : 'sun'} size={19} /></button><NotificationCenter /><a className="profile-button" href="/perfil" aria-label="Abrir mi perfil"><span>{initials(user?.name)}</span><Icon name="chevron" size={15} /></a><button className="workspace-mobile-menu" type="button" aria-label="Abrir navegación" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <Icon name="close" /> : <Icon name="menu" />}</button></div></header>
      <aside className={mobileMenuOpen ? 'workspace-sidebar open' : 'workspace-sidebar'} aria-label="Navegación de usuario"><nav>{[['campaign', 'Campañas', '/campanias'], ['community', 'Equipo', '/comunidad'], ['compass', 'Explorar', '/explorar'], ['bag', 'Tienda', '/tienda'], ['user', 'Mi perfil', '/perfil']].map(([icon, label, href], index) => <a key={label} className={index === 0 ? 'sidebar-link active' : 'sidebar-link'} href={href} onClick={() => setMobileMenuOpen(false)}><Icon name={icon} size={21} /><span>{label}</span></a>)}</nav><div className="sidebar-footer"><span className="sidebar-live-dot" />Campaña activa</div></aside>
      <section className="workspace-main">
        <header className="campaign-summary"><div className="campaign-title"><span>CAMPAÑA</span><h1>{campaign.name}</h1><p>Letra actual: <strong>{campaign.current_letter || 'Pendiente'}</strong></p></div><div className="campaign-progress"><div className="progress-status"><span><i /> EN VIVO</span><strong>{progress}</strong></div><ol aria-label={`Secuencia de letras de ${campaign.name}`}>{campaign.letters.map((item) => <li className={item.status === 'active' ? 'active' : item.status === 'completed' ? 'completed' : ''} key={item.position}>{item.letter}</li>)}</ol></div><div className="campaign-next"><span>Turno asignado</span><strong>{assignment?.targetTurn?.toLocaleString('es-CL') || campaign.next_turn?.toLocaleString('es-CL')} <Icon name="chevron" size={18} /></strong></div><button className={assignment?.status === 'active' ? 'participate-button is-participating' : 'participate-button'} type="button" disabled={working || assignment?.status === 'completed'} onClick={handleWorkAction}>{working ? 'Actualizando' : actionLabel} <Icon name="chevron" size={20} /></button></header>
        {notice && <p className="workspace-notice">{notice}</p>}{error && <p className="workspace-error">{error}</p>}
        <section className="conversation-panel" aria-labelledby="conversation-title"><div className="conversation-heading"><h2 id="conversation-title">Actualizaciones de trabajo</h2><span>{updates.length} publicadas</span></div><div className="post-list" aria-live="polite">{updates.length ? updates.map((update) => <article className="conversation-post" key={update.id}><div className="post-avatar own">{initials(update.author_name)}</div><div className="post-content"><div><strong>{update.author_name}</strong><time>{formatTime(update.created_at)}</time></div><p>{update.body}</p></div></article>) : <p className="workspace-empty">Aún no hay actualizaciones publicadas para esta campaña.</p>}</div>{canPublish ? <form className="message-composer" onSubmit={publishUpdate}><div className="post-avatar own">{initials(user?.name)}</div><div className="composer-box"><textarea value={message} maxLength={500} onChange={(event) => setMessage(event.target.value)} placeholder="Registra tu actualización de trabajo" aria-label="Registra tu actualización de trabajo" /><div><small>{message.length}/500</small><button className="publish-button" disabled={working} type="submit">Enviar actualización <Icon name="send" size={16} /></button></div></div></form> : <p className="workspace-empty">{user ? 'Inicia tu jornada para poder publicar actualizaciones.' : 'Inicia sesión y solicita un turno para registrar actualizaciones.'}</p>}</section>
        <aside className="product-panel" aria-label="Productos oficiales"><div className="product-heading"><h2>Productos oficiales</h2></div><div className="product-copy"><strong>Catálogo en preparación</strong><span>Las poleras y fardos oficiales se publicarán en la tienda cuando estén disponibles.</span></div><a className="product-button" href="/tienda">Ir a la tienda <Icon name="chevron" size={19} /></a></aside>
      </section>
    </section>
  </main>
}
