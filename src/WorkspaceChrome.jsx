import { useEffect, useState } from 'react'
import { getCachedSession, restoreSession } from './platform-api'
import logoMark from './assets/chatenlugar-logo.png'
import NotificationCenter from './NotificationCenter'
import './campaign-workspace.css'
import './unified-workspace.css'

export function WorkspaceIcon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    campaign: <><path d="M5 20V5" /><path d="M5 6h12l-2 4 2 4H5" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.2a4.5 4.5 0 0 1 4.5-4.5h2A4.5 4.5 0 0 1 14.5 18.8V20" /><path d="M16 7.3a2.8 2.8 0 0 1 0 5.4M20.5 20v-1.2a4.5 4.5 0 0 0-2.7-4.1" /></>,
    compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2.3 4.7-4.7 2.3 2.3-4.7 4.7-2.3Z" /></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20v-1a7 7 0 0 1 14 0v1" /></>,
    moon: <path d="M20.4 15.3A8.8 8.8 0 0 1 8.7 3.6 8.9 8.9 0 1 0 20.4 15.3Z" />,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    pencil: <><path d="m14.5 5.5 4 4M4 20l4.2-1 10.5-10.5a2.8 2.8 0 0 0-4-4L4.2 15 4 20Z" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    exit: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-7" /></>,
  }
  return <svg {...common}>{paths[name] || paths.arrow}</svg>
}

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
const navItems = [['campaign', 'Campañas', '/campanias', 'campaigns'], ['team', 'Equipo', '/comunidad', 'team'], ['compass', 'Explorar', '/explorar', 'explore'], ['bag', 'Tienda', '/tienda', 'store'], ['user', 'Mi perfil', '/perfil', 'profile']]

export default function WorkspaceChrome({ active, children }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('chatenlugar-theme') || 'day')
  const [user, setUser] = useState(() => getCachedSession()?.user || null)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('chatenlugar-theme', theme)
  }, [theme])
  useEffect(() => { restoreSession().then((session) => setUser(session?.user || null)).catch(() => setUser(null)) }, [])

  return <main className="workspace-shell unified-shell">
    <section className="workspace-frame unified-frame">
      <header className="workspace-topbar"><a href="/" className="workspace-brand" aria-label="chatenlugar, inicio"><img src={logoMark} alt="" /><span>chatenlugar</span></a><div className="workspace-top-actions"><button className="workspace-icon-button workspace-theme" type="button" onClick={() => setTheme((current) => current === 'day' ? 'night' : 'day')} aria-label={theme === 'day' ? 'Activar modo noche' : 'Activar modo día'}><WorkspaceIcon name={theme === 'day' ? 'moon' : 'sun'} size={19} /></button><NotificationCenter /><a className="profile-button" href="/perfil" aria-label="Abrir mi perfil"><span>{initials(user?.name)}</span><WorkspaceIcon name="arrow" size={15} /></a><button className="workspace-mobile-menu" type="button" aria-label="Abrir navegación" onClick={() => setMenuOpen((open) => !open)}><WorkspaceIcon name={menuOpen ? 'close' : 'menu'} /></button></div></header>
      <aside className={menuOpen ? 'workspace-sidebar open' : 'workspace-sidebar'}><nav>{navItems.map(([icon, label, href, key]) => <a key={key} className={active === key ? 'sidebar-link active' : 'sidebar-link'} href={href} onClick={() => setMenuOpen(false)}><WorkspaceIcon name={icon} size={21} /><span>{label}</span></a>)}</nav><div className="sidebar-footer"><span className="sidebar-live-dot" />Plataforma activa</div></aside>
      <section className="unified-main">{children}</section>
    </section>
  </main>
}
