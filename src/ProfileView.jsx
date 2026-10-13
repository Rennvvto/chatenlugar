import { useEffect, useState } from 'react'
import { changePassword, clearSession, getCachedSession, restoreSession, updateProfile } from './platform-api'
import WorkspaceChrome, { WorkspaceIcon } from './WorkspaceChrome'
import './profile-view.css'

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U'
const formatDate = (value) => new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(new Date(value))

export default function ProfileView() {
  const [session, setSession] = useState(() => getCachedSession())
  const [loadingSession, setLoadingSession] = useState(() => Boolean(getCachedSession()?.token))
  const [tab, setTab] = useState('summary')
  const [notice, setNotice] = useState(null)
  const user = session?.user
  const [profileForm, setProfileForm] = useState(() => user ? { name: user.name, email: user.email, bio: user.bio || '', location: user.location || '' } : null)
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(() => {
    let active = true
    restoreSession().then((nextSession) => active && setSession(nextSession)).catch(() => active && setSession(null)).finally(() => active && setLoadingSession(false))
    return () => { active = false }
  }, [])
  useEffect(() => { if (user) setProfileForm({ name: user.name, email: user.email, bio: user.bio || '', location: user.location || '' }) }, [user?.id])

  const saveProfile = async (event) => {
    event.preventDefault()
    try { const nextUser = await updateProfile(profileForm); setSession((current) => ({ ...current, user: nextUser })); setNotice({ type: 'success', text: 'Tu perfil se actualizó correctamente.' }) } catch (error) { setNotice({ type: 'error', text: error.message }) }
  }
  const savePassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return setNotice({ type: 'error', text: 'La confirmación no coincide con la nueva contraseña.' })
    try { await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }); setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); setNotice({ type: 'success', text: 'Tu contraseña se actualizó correctamente.' }) } catch (error) { setNotice({ type: 'error', text: error.message }) }
  }
  const signOut = () => { clearSession(); window.location.assign('/') }

  if (loadingSession) return <main className="profile-access"><section><h1>Cargando tu perfil.</h1><p>Estamos comprobando tu sesión de forma segura.</p></section></main>
  if (!user) return <main className="profile-access"><section><h1>Inicia sesión para ver tu perfil.</h1><p>Tu perfil se crea al registrarte y queda disponible desde cualquier vista de la plataforma.</p><a className="profile-primary-link" href="/?acceso=login">Ingresar <WorkspaceIcon name="arrow" size={18} /></a></section></main>

  return <WorkspaceChrome active="profile">
    <header className="route-heading profile-route-heading"><div><p>MI PERFIL</p><h1>Tu espacio de trabajo.</h1><span>Administra cómo apareces y protege el acceso a tu cuenta.</span></div><button className="route-outline-action" type="button" onClick={signOut}>Cerrar sesión <WorkspaceIcon name="exit" size={17} /></button></header>
    <div className="profile-workspace">
      <section className="profile-workspace-main">
        <article className="profile-identity-card"><div className="profile-avatar-modern">{initials(user.name)}</div><div><small>MI PERFIL</small><h2>{user.name}</h2><span>@{user.handle}</span></div><button className="profile-edit-modern" type="button" onClick={() => setTab('edit')}><WorkspaceIcon name="pencil" size={17} />Editar perfil</button></article>
        <nav className="profile-tabs-modern" aria-label="Secciones de perfil"><button className={tab === 'summary' ? 'active' : ''} type="button" onClick={() => setTab('summary')}>Resumen</button><button className={tab === 'edit' ? 'active' : ''} type="button" onClick={() => setTab('edit')}>Editar perfil</button><button className={tab === 'security' ? 'active' : ''} type="button" onClick={() => setTab('security')}>Seguridad</button></nav>
        {notice && <div className={`profile-notice ${notice.type}`} role="status">{notice.text}<button type="button" aria-label="Cerrar aviso" onClick={() => setNotice(null)}>×</button></div>}
        {tab === 'summary' && <section className="profile-summary-modern"><div className="route-section-title"><h2>Información de cuenta</h2><span>Datos personales</span></div><div className="profile-details"><div><WorkspaceIcon name="mail" size={19} /><span><small>Correo</small><strong>{user.email}</strong></span></div><div><WorkspaceIcon name="pin" size={19} /><span><small>Ubicación</small><strong>{user.location || 'Sin ubicación'}</strong></span></div><div><WorkspaceIcon name="calendar" size={19} /><span><small>Miembro desde</small><strong>{formatDate(user.joinedAt)}</strong></span></div></div><article className="profile-bio-card"><small>SOBRE TI</small><p>{user.bio || 'Todavía no has agregado una descripción. Completa tu perfil para que tu equipo pueda conocerte.'}</p><button type="button" onClick={() => setTab('edit')}>Completar perfil <WorkspaceIcon name="arrow" size={17} /></button></article></section>}
        {tab === 'edit' && <section className="profile-form-modern"><div className="route-section-title"><h2>Edita tu perfil</h2><span>Los cambios se guardan en tu cuenta</span></div><form onSubmit={saveProfile}><label>Nombre completo<input value={profileForm.name} onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })} required /></label><label>Correo electrónico<input type="email" value={profileForm.email} onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })} required /></label><label>Ubicación<input value={profileForm.location} onChange={(event) => setProfileForm({ ...profileForm, location: event.target.value })} placeholder="Ej.: Santiago, Chile" /></label><label className="profile-form-wide">Descripción<textarea maxLength={220} value={profileForm.bio} onChange={(event) => setProfileForm({ ...profileForm, bio: event.target.value })} placeholder="Describe brevemente tu trabajo en la plataforma." /><small>{profileForm.bio.length}/220</small></label><button className="route-action" type="submit">Guardar cambios <WorkspaceIcon name="arrow" /></button></form></section>}
        {tab === 'security' && <section className="profile-form-modern"><div className="route-section-title"><h2>Seguridad</h2><span>Actualiza tu contraseña</span></div><div className="profile-security-note"><WorkspaceIcon name="shield" size={20} />Tu sesión y contraseña se validan mediante la API protegida de chatenlugar.</div><form onSubmit={savePassword}><label>Contraseña actual<input type="password" value={passwordForm.currentPassword} onChange={(event) => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })} required /></label><label>Nueva contraseña<input type="password" value={passwordForm.newPassword} onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })} minLength="8" required /></label><label className="profile-form-wide">Confirma la nueva contraseña<input type="password" value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })} minLength="8" required /></label><button className="route-action" type="submit">Actualizar contraseña <WorkspaceIcon name="shield" /></button></form></section>}
      </section>
      <aside className="route-aside profile-aside"><h2>Cuenta activa</h2><div className="route-info"><h3>Perfil personal</h3><p>Tu nombre, usuario y descripción se usan al mostrar tu actividad dentro de las campañas.</p></div><div className="route-info"><h3>Acceso seguro</h3><p>Cambia tu contraseña cuando lo necesites. Nunca mostramos datos privados a otros usuarios.</p></div><a className="route-action" href="/campanias">Ir a campañas <WorkspaceIcon name="arrow" /></a></aside>
    </div>
  </WorkspaceChrome>
}
