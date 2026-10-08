import { useEffect, useMemo, useState } from 'react'
import { changePassword, clearSession, getCachedSession, restoreSession, updateProfile } from './platform-api'
import './campaign-workspace.css'
import './profile-view.css'
import logoMark from './assets/chatenlugar-logo.png'

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    pencil: <><path d="m14.5 5.5 4 4M4 20l4.2-1 10.5-10.5a2.8 2.8 0 0 0-4-4L4.2 15 4 20Z" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.3 8.4-8 10-4.7-1.6-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.2 2.2 4.8-4.8" /></>,
    pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M7 3v4M17 3v4M3 10h18" /></>,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    moon: <path d="M20.4 15.3A8.8 8.8 0 0 1 8.7 3.6 8.9 8.9 0 1 0 20.4 15.3Z" />,
    exit: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M21 19V5a2 2 0 0 0-2-2h-7" /></>,
  }
  return <svg {...common}>{paths[name] || paths.arrow}</svg>
}

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'

const formatDate = (date) => new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date(date))

export default function ProfileView() {
  const [session, setSession] = useState(() => getCachedSession())
  const [loadingSession, setLoadingSession] = useState(() => Boolean(getCachedSession()?.token))
  const [tab, setTab] = useState('summary')
  const [notice, setNotice] = useState(null)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('chatenlugar-theme') || 'day')
  const user = session?.user
  const [profileForm, setProfileForm] = useState(() => user ? { name: user.name, email: user.email, bio: user.bio || '', location: user.location || '' } : null)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('chatenlugar-theme', theme)
  }, [theme])

  useEffect(() => {
    let active = true
    restoreSession().then((nextSession) => {
      if (active) setSession(nextSession)
    }).catch(() => {
      if (active) setSession(null)
    }).finally(() => {
      if (active) setLoadingSession(false)
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, email: user.email, bio: user.bio || '', location: user.location || '' })
  }, [user?.id])

  const stats = useMemo(() => [
    ['01', 'Campaña activa'], ['00', 'Prendas en colección'], ['00', 'Actualizaciones'],
  ], [])

  if (loadingSession) {
    return <main className="profile-access"><section><a href="/" className="workspace-brand"><img src={logoMark} alt="" /><span>chatenlugar</span></a><h1>Cargando tu perfil.</h1><p>Estamos comprobando tu sesión de forma segura.</p></section></main>
  }

  if (!user) {
    return <main className="profile-access"><section><a href="/" className="workspace-brand"><img src={logoMark} alt="" /><span>chatenlugar</span></a><h1>Inicia sesión para ver tu perfil.</h1><p>Tu perfil se crea al registrarte y queda disponible desde cualquier vista de la plataforma.</p><a className="profile-primary-link" href="/?acceso=login">Ingresar <Icon name="arrow" size={18} /></a></section></main>
  }

  const saveProfile = async (event) => {
    event.preventDefault()
    try {
      const nextUser = await updateProfile(profileForm)
      setSession((current) => ({ ...current, user: nextUser }))
      setNotice({ type: 'success', text: 'Tu perfil se actualizó correctamente.' })
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  const savePassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setNotice({ type: 'error', text: 'La confirmación no coincide con la nueva contraseña.' })
      return
    }
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setNotice({ type: 'success', text: 'Tu contraseña se actualizó correctamente.' })
    } catch (error) {
      setNotice({ type: 'error', text: error.message })
    }
  }

  const signOut = () => {
    clearSession()
    window.location.assign('/')
  }

  return (
    <main className="workspace-shell profile-shell">
      <section className="profile-frame">
        <header className="profile-topbar"><a href="/" className="workspace-brand"><img src={logoMark} alt="" /><span>chatenlugar</span></a><nav><a href="/campania/sushi">Campañas</a><a className="active" href="/perfil">Mi perfil</a></nav><div><button className="workspace-icon-button" type="button" aria-label={theme === 'day' ? 'Activar modo noche' : 'Activar modo día'} onClick={() => setTheme((current) => current === 'day' ? 'night' : 'day')}><Icon name={theme === 'day' ? 'moon' : 'sun'} size={19} /></button><button className="profile-logout" type="button" onClick={signOut}>Cerrar sesión <Icon name="exit" size={17} /></button></div></header>

        <section className="profile-hero">
          <div className="profile-avatar">{initials(user.name)}</div>
          <div><p>MI PERFIL</p><h1>{user.name}</h1><span>@{user.handle}</span></div>
          <button className="profile-edit-trigger" type="button" onClick={() => setTab('edit')}><Icon name="pencil" size={17} />Editar perfil</button>
        </section>

        <div className="profile-tabs" role="tablist" aria-label="Secciones de perfil">
          <button className={tab === 'summary' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'summary'} onClick={() => setTab('summary')}>Resumen</button>
          <button className={tab === 'edit' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'edit'} onClick={() => setTab('edit')}>Editar perfil</button>
          <button className={tab === 'security' ? 'active' : ''} type="button" role="tab" aria-selected={tab === 'security'} onClick={() => setTab('security')}>Seguridad</button>
        </div>

        {notice && <div className={`profile-notice ${notice.type}`} role="status">{notice.text}<button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)}>×</button></div>}

        {tab === 'summary' && <section className="profile-content profile-summary-view">
          <div className="profile-about"><p className="profile-eyebrow">SOBRE TI</p><h2>Tu espacio en chatenlugar.</h2><p>{user.bio || 'Todavía no has agregado una descripción.'}</p><dl><div><dt><Icon name="mail" size={18} />Correo</dt><dd>{user.email}</dd></div><div><dt><Icon name="pin" size={18} />Ubicación</dt><dd>{user.location || 'Sin ubicación'}</dd></div><div><dt><Icon name="calendar" size={18} />Miembro desde</dt><dd>{formatDate(user.joinedAt)}</dd></div></dl></div>
          <div className="profile-stats">{stats.map(([value, label]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}</div>
          <article className="profile-campaign-card"><span className="profile-live"><i />EN VIVO</span><p>CAMPAÑA ACTIVA</p><h3>SUSHI</h3><span>Letra actual: <strong>S</strong></span><a href="/campania/sushi">Ir a la campaña <Icon name="arrow" size={18} /></a></article>
        </section>}

        {tab === 'edit' && <section className="profile-content profile-form-view"><div><p className="profile-eyebrow">INFORMACIÓN PERSONAL</p><h2>Edita cómo te ven en la plataforma.</h2><p>Tu usuario se actualiza automáticamente a partir de tu nombre.</p></div><form onSubmit={saveProfile}><label>Nombre completo<input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required /></label><label>Correo electrónico<input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} required /></label><label>Ubicación<input value={profileForm.location} onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })} placeholder="Ej.: Santiago, Chile" /></label><label className="profile-textarea">Descripción<textarea maxLength={220} value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} placeholder="Describe brevemente tu trabajo en la plataforma." /><small>{profileForm.bio.length}/220</small></label><button className="profile-save" type="submit">Guardar cambios <Icon name="arrow" size={18} /></button></form></section>}

        {tab === 'security' && <section className="profile-content profile-form-view security-view"><div><p className="profile-eyebrow">SEGURIDAD</p><h2>Protege tu cuenta.</h2><p>Usa una contraseña de al menos 8 caracteres.</p><div className="profile-local-note"><Icon name="shield" size={19} />Tu sesión y contraseña se validan mediante la API protegida de chatenlugar.</div></div><form onSubmit={savePassword}><label>Contraseña actual<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required /></label><label>Nueva contraseña<input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} minLength="8" required /></label><label>Confirma la nueva contraseña<input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} minLength="8" required /></label><button className="profile-save" type="submit">Actualizar contraseña <Icon name="shield" size={18} /></button></form></section>}
      </section>
    </main>
  )
}
