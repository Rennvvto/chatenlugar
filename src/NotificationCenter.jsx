import { useEffect, useState } from 'react'
import { getCachedSession, getNotifications, markAllNotificationsRead, markNotificationRead } from './platform-api'
import './notifications.css'

const Bell = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" /></svg>
const formatDate = (value) => new Intl.DateTimeFormat('es-CL', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value))

export default function NotificationCenter({ className = '' }) {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const authenticated = Boolean(getCachedSession()?.token)

  const load = async () => {
    if (!authenticated) return
    setLoading(true)
    setError('')
    try {
      const data = await getNotifications()
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [authenticated])
  useEffect(() => { if (open) load() }, [open])

  const openNotification = async (notification) => {
    try {
      if (!notification.read_at) {
        await markNotificationRead(notification.id)
        setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
        setUnreadCount((count) => Math.max(0, count - 1))
      }
      if (notification.link) window.location.assign(notification.link)
    } catch (requestError) { setError(requestError.message) }
  }

  const markAll = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })))
      setUnreadCount(0)
    } catch (requestError) { setError(requestError.message) }
  }

  if (!authenticated) return null
  return <div className={`notification-center ${className}`}><button className="notification-trigger" type="button" aria-label="Notificaciones" aria-expanded={open} onClick={() => setOpen((current) => !current)}><Bell />{unreadCount > 0 && <i>{unreadCount > 9 ? '9+' : unreadCount}</i>}</button>{open && <section className="notification-popover" aria-label="Notificaciones"><header><div><span>NOTIFICACIONES</span><h2>Tu actividad</h2></div>{unreadCount > 0 && <button type="button" onClick={markAll}>Marcar todas leídas</button>}</header>{loading && <p className="notification-state">Cargando avisos.</p>}{error && <p className="notification-state error">{error}</p>}{!loading && !error && !notifications.length && <p className="notification-state">Aún no tienes notificaciones.</p>}{!loading && !error && notifications.map((notification) => <button key={notification.id} className={notification.read_at ? 'notification-item' : 'notification-item unread'} type="button" onClick={() => openNotification(notification)}><strong>{notification.title}</strong><span>{notification.body}</span><time>{formatDate(notification.created_at)}</time></button>)}</section>}</div>
}
