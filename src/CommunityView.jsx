import { useEffect, useState } from 'react'
import { apiRequest, getCachedSession } from './platform-api'
import './community.css'

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
  return <main className="community-shell"><header className="community-header"><a href="/">chatenlugar</a><nav><a href="/campanias">Campañas</a><a className="active" href="/comunidad">Equipo</a><a href="/explorar">Explorar</a><a href="/perfil">Mi perfil</a></nav></header><section className="community-hero"><p>COMUNIDAD DE TRABAJO</p><h1>Actualizaciones del equipo.</h1><span>Revisa avances publicados por trabajadores activos en las campañas.</span></section><section className="community-feed">{error && <p className="community-state error">{error}</p>}{loading && !updates.length && <p className="community-state">Cargando actualizaciones.</p>}{!loading && !updates.length && <p className="community-state">Aún no hay actualizaciones de trabajo publicadas.</p>}{updates.map((update) => <article className="community-post" key={update.id}><header><div><strong>{update.author_name}</strong><span>@{update.author_handle} · {update.campaign_name}</span></div><time>{formatDate(update.created_at)}</time></header><p>{update.body}</p><footer><button className={update.liked_by_me ? 'active' : ''} type="button" onClick={() => react(update.id)}>Me interesa {update.likes}</button><button type="button" onClick={() => showComments(update.id)}>Comentarios {update.comments}</button><a href={`/campania/${update.campaign_slug}`}>Ver campaña</a></footer>{comments[update.id] && <section className="community-comments">{comments[update.id].map((comment) => <div key={comment.id}><strong>{comment.author_name}</strong><span>{comment.body}</span></div>)}<form onSubmit={(event) => publishComment(event, update.id)}><input value={commentText[update.id] || ''} onChange={(event) => setCommentText((current) => ({ ...current, [update.id]: event.target.value }))} placeholder="Escribe un comentario" aria-label="Escribe un comentario" /><button type="submit">Publicar</button></form></section>}</article>)}{nextCursor && <button className="community-more" disabled={loading} type="button" onClick={() => load(nextCursor)}>{loading ? 'Cargando' : 'Cargar más'}</button>}</section></main>
}
