import { useEffect, useState } from 'react'
import { apiRequest, getCachedSession } from './platform-api'
import WorkspaceChrome, { WorkspaceIcon } from './WorkspaceChrome'

const formatDate = (value) => new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))

export default function CommunityView() {
  const [updates, setUpdates] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [comments, setComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const user = getCachedSession()?.user

  const load = async (cursor = null) => {
    setLoading(true)
    try {
      const data = await apiRequest(`/community/updates${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''}`)
      setUpdates((current) => cursor ? [...current, ...data.updates] : data.updates)
      setNextCursor(data.nextCursor)
      setError('')
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const react = async (id) => {
    if (!user) return window.location.assign('/?acceso=login')
    try {
      const result = await apiRequest(`/community/updates/${id}/reaction`, { method: 'POST' })
      setUpdates((current) => current.map((item) => item.id === id ? { ...item, liked_by_me: result.liked, likes: result.likes } : item))
    } catch (requestError) { setError(requestError.message) }
  }

  const showComments = async (id) => {
    if (comments[id]) return setComments((current) => ({ ...current, [id]: null }))
    try {
      const data = await apiRequest(`/community/updates/${id}/comments`)
      setComments((current) => ({ ...current, [id]: data.comments }))
    } catch (requestError) { setError(requestError.message) }
  }

  const publishComment = async (event, id) => {
    event.preventDefault()
    if (!user) return window.location.assign('/?acceso=login')
    const body = (commentText[id] || '').trim()
    if (!body) return
    try {
      const { comment } = await apiRequest(`/community/updates/${id}/comments`, { method: 'POST', body: JSON.stringify({ body }) })
      setComments((current) => ({ ...current, [id]: [...(current[id] || []), { ...comment, author_name: user.name, author_handle: user.handle }] }))
      setCommentText((current) => ({ ...current, [id]: '' }))
      setUpdates((current) => current.map((item) => item.id === id ? { ...item, comments: item.comments + 1 } : item))
    } catch (requestError) { setError(requestError.message) }
  }

  const editUpdate = async (update) => {
    const body = window.prompt('Edita tu actualización', update.body)?.trim()
    if (!body || body === update.body) return
    try {
      const { update: saved } = await apiRequest(`/community/updates/${update.id}`, { method: 'PATCH', body: JSON.stringify({ body }) })
      setUpdates((current) => current.map((item) => item.id === update.id ? { ...item, ...saved } : item))
    } catch (requestError) { setError(requestError.message) }
  }

  const deleteUpdate = async (id) => {
    if (!window.confirm('¿Eliminar esta actualización? Esta acción no se puede deshacer.')) return
    try {
      await apiRequest(`/community/updates/${id}`, { method: 'DELETE' })
      setUpdates((current) => current.filter((item) => item.id !== id))
      setComments((current) => { const next = { ...current }; delete next[id]; return next })
    } catch (requestError) { setError(requestError.message) }
  }

  const editComment = async (updateId, comment) => {
    const body = window.prompt('Edita tu comentario', comment.body)?.trim()
    if (!body || body === comment.body) return
    try {
      const { comment: saved } = await apiRequest(`/community/comments/${comment.id}`, { method: 'PATCH', body: JSON.stringify({ body }) })
      setComments((current) => ({ ...current, [updateId]: (current[updateId] || []).map((item) => item.id === comment.id ? { ...item, ...saved } : item) }))
    } catch (requestError) { setError(requestError.message) }
  }

  const deleteComment = async (updateId, commentId) => {
    if (!window.confirm('¿Eliminar este comentario?')) return
    try {
      await apiRequest(`/community/comments/${commentId}`, { method: 'DELETE' })
      setComments((current) => ({ ...current, [updateId]: (current[updateId] || []).filter((item) => item.id !== commentId) }))
      setUpdates((current) => current.map((item) => item.id === updateId ? { ...item, comments: Math.max(0, item.comments - 1) } : item))
    } catch (requestError) { setError(requestError.message) }
  }

  return <WorkspaceChrome active="team">
    <header className="route-heading"><div><p>EQUIPO</p><h1>Actualizaciones de trabajo.</h1><span>Revisa los avances publicados desde las campañas activas.</span></div><div className="route-heading-aside">ESPACIO DE TRABAJO<strong>{loading ? 'Actualizando' : `${updates.length} publicaciones`}</strong></div></header>
    <div className="route-layout"><section className="route-content">
      <div className="route-section-title"><h2>Actividad reciente</h2><span>Publicaciones verificadas por campaña</span></div>
      {error && <p className="route-state error">{error}</p>}
      {loading && !updates.length && <p className="route-state">Cargando actualizaciones.</p>}
      {!loading && !updates.length && <p className="route-state">Aún no hay actualizaciones de trabajo publicadas.</p>}
      <div className="team-feed">{updates.map((update) => <article className="team-post" key={update.id}>
        <header><div className="team-author"><strong>{update.author_name}</strong><span>@{update.author_handle} · {update.campaign_name}</span></div><time>{formatDate(update.created_at)}</time></header>
        <p>{update.body}</p>
        <footer><button className={update.liked_by_me ? 'active' : ''} type="button" onClick={() => react(update.id)}>Me interesa <strong>{update.likes}</strong></button><button type="button" onClick={() => showComments(update.id)}>Comentarios <strong>{update.comments}</strong></button><a href={`/campania/${update.campaign_slug}`}>Ver campaña <WorkspaceIcon name="arrow" size={16} /></a>{user?.id === update.author_id && <span className="team-owner-actions"><button type="button" onClick={() => editUpdate(update)}>Editar</button><button type="button" onClick={() => deleteUpdate(update.id)}>Eliminar</button></span>}</footer>
        {comments[update.id] && <section className="team-comments">{comments[update.id].map((comment) => <div className="team-comment" key={comment.id}><div><strong>{comment.author_name}</strong><span>{comment.body}</span></div>{user?.id === comment.author_id && <aside><button type="button" onClick={() => editComment(update.id, comment)}>Editar</button><button type="button" onClick={() => deleteComment(update.id, comment.id)}>Eliminar</button></aside>}</div>)}<form onSubmit={(event) => publishComment(event, update.id)}><input value={commentText[update.id] || ''} onChange={(event) => setCommentText((current) => ({ ...current, [update.id]: event.target.value }))} placeholder="Escribe un comentario" aria-label="Escribe un comentario" /><button type="submit">Publicar</button></form></section>}
      </article>)}</div>
      {nextCursor && <button className="route-outline-action" disabled={loading} type="button" onClick={() => load(nextCursor)}>{loading ? 'Cargando' : 'Cargar más'} <WorkspaceIcon name="arrow" size={17} /></button>}
    </section><aside className="route-aside"><h2>Trabaja con tu equipo</h2><div className="route-info"><h3>Actualizaciones por campaña</h3><p>Las publicaciones reúnen el trabajo compartido por personas inscritas en cada campaña.</p></div><div className="route-info"><h3>Tu actividad</h3><p>Inicia una jornada para publicar una actualización desde la campaña que tienes asignada.</p></div><a className="route-action" href="/campanias">Ver campañas <WorkspaceIcon name="arrow" /></a></aside></div>
  </WorkspaceChrome>
}
