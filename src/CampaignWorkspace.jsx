import { useEffect, useState } from 'react'
import './campaign-workspace.css'
import { getCachedSession } from './platform-api'
import logoMark from './assets/chatenlugar-logo.png'

const sequence = ['S', 'U', 'S', 'H', 'I']

const initialPosts = [
  { id: 1, author: 'Valentina R.', initials: 'VR', time: 'hace 2 horas', text: 'Se me ocurre “Sakura” para la S; mantiene la idea de sushi y además quedaría muy bien en la polera. ¿Qué opinan?', likes: 12, liked: false, tone: 'coral' },
  { id: 2, author: 'Matías L.', initials: 'ML', time: 'hace 3 horas', text: 'También podría ser “Sake”. Es corto, directo y tiene mucha identidad con la temática.', likes: 8, liked: false, tone: 'sky' },
  { id: 3, author: 'Camila F.', initials: 'CF', time: 'hace 5 horas', text: 'Me gusta “Sushi Club” como propuesta. Suena bien y se puede graficar increíble en la prenda.', likes: 6, liked: false, tone: 'gold' },
]

const products = [
  { id: 'ola', title: 'Ola', subtitle: 'Edición SUSHI · 01/04', accent: 'coral', mark: '寿', word: 'SUSHI' },
  { id: 'noche', title: 'Noche', subtitle: 'Edición SUSHI · 02/04', accent: 'ink', mark: '月', word: 'SUSHI' },
  { id: 'tinta', title: 'Tinta', subtitle: 'Edición SUSHI · 03/04', accent: 'blue', mark: '魚', word: 'SUSHI' },
  { id: 'linea', title: 'Línea', subtitle: 'Edición SUSHI · 04/04', accent: 'sand', mark: 'S', word: 'SUSHI' },
]

function Icon({ name, size = 20 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }
  const paths = {
    campaign: <><path d="M5 20V5" /><path d="M5 6h12l-2 4 2 4H5" /></>,
    community: <><circle cx="9" cy="8" r="3" /><path d="M3.5 20v-1.2a4.5 4.5 0 0 1 4.5-4.5h2A4.5 4.5 0 0 1 14.5 18.8V20" /><path d="M16 7.3a2.8 2.8 0 0 1 0 5.4M20.5 20v-1.2a4.5 4.5 0 0 0-2.7-4.1" /></>,
    compass: <><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2.3 4.7-4.7 2.3 2.3-4.7 4.7-2.3Z" /></>,
    bag: <><path d="M5 8h14l-1 12H6L5 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    user: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20v-1a7 7 0 0 1 14 0v1" /></>,
    search: <><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4" /></>,
    chevron: <path d="m9 18 6-6-6-6" />,
    heart: <path d="M20.8 8.7c0 5-8.8 10.3-8.8 10.3S3.2 13.7 3.2 8.7A4.7 4.7 0 0 1 12 6.4a4.7 4.7 0 0 1 8.8 2.3Z" />,
    more: <><circle cx="5" cy="12" r=".8" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r=".8" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r=".8" fill="currentColor" stroke="none" /></>,
    image: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-4.5-4.5L7 20" /></>,
    smile: <><circle cx="12" cy="12" r="9" /><path d="M8 14s1.3 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
    link: <><path d="M10 13.8a4.1 4.1 0 0 0 5.8.1l2-2a4.1 4.1 0 1 0-5.8-5.8l-1.2 1.2" /><path d="M14 10.2a4.1 4.1 0 0 0-5.8-.1l-2 2A4.1 4.1 0 1 0 12 18l1.2-1.2" /></>,
    moon: <path d="M20.4 15.3A8.8 8.8 0 0 1 8.7 3.6 8.9 8.9 0 1 0 20.4 15.3Z" />,
    sun: <><circle cx="12" cy="12" r="3.5" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  }

  return <svg {...common}>{paths[name] || paths.campaign}</svg>
}

function Shirt({ product, compact = false }) {
  return (
    <div className={`shirt-stage ${product.accent} ${compact ? 'compact' : ''}`} aria-label={`Polera temática ${product.title}`}>
      <div className="shirt-shape">
        <div className="shirt-print"><span>{product.mark}</span><strong>{product.word}</strong></div>
      </div>
    </div>
  )
}

export default function CampaignWorkspace() {
  const [posts, setPosts] = useState(initialPosts)
  const [message, setMessage] = useState('')
  const [productIndex, setProductIndex] = useState(0)
  const [carouselPaused, setCarouselPaused] = useState(false)
  const [working, setWorking] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => window.localStorage.getItem('chatenlugar-theme') || 'day')
  const user = getCachedSession()?.user
  const userInitial = user?.name?.trim()?.[0]?.toUpperCase() || 'R'

  const product = products[productIndex]

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem('chatenlugar-theme', theme)
  }, [theme])

  useEffect(() => {
    if (carouselPaused) return undefined
    const carouselTimer = window.setInterval(() => setProductIndex((current) => (current + 1) % products.length), 5500)
    return () => window.clearInterval(carouselTimer)
  }, [carouselPaused])

  const moveProduct = (direction) => {
    setProductIndex((current) => (current + direction + products.length) % products.length)
  }

  const toggleLike = (id) => {
    setPosts((currentPosts) => currentPosts.map((post) => post.id === id ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) } : post))
  }

  const publishMessage = (event) => {
    event.preventDefault()
    const cleanMessage = message.trim()
    if (!cleanMessage) return
    setPosts((currentPosts) => [{ id: Date.now(), author: 'Renato', initials: 'R', time: 'ahora', text: cleanMessage, likes: 0, liked: false, tone: 'own' }, ...currentPosts])
    setMessage('')
  }

  return (
    <main className="workspace-shell">
      <section className="workspace-frame" aria-label="Espacio de campaña SUSHI">
        <header className="workspace-topbar">
          <a href="/" className="workspace-brand" aria-label="chatenlugar, inicio"><img src={logoMark} alt="" /><span>chatenlugar</span></a>
          <div className="workspace-top-actions">
            <button className="workspace-icon-button workspace-theme" type="button" onClick={() => setTheme((current) => current === 'day' ? 'night' : 'day')} aria-label={theme === 'day' ? 'Activar modo noche' : 'Activar modo día'}><Icon name={theme === 'day' ? 'moon' : 'sun'} size={19} /></button>
            <button className="workspace-icon-button" type="button" aria-label="Buscar"><Icon name="search" size={21} /></button>
            <button className="workspace-icon-button notification-button" type="button" aria-label="Notificaciones"><Icon name="bell" size={21} /><i /></button>
            <a className="profile-button" href="/perfil" aria-label="Abrir mi perfil"><span>{userInitial}</span><Icon name="chevron" size={15} /></a>
            <button className="workspace-mobile-menu" type="button" aria-label="Abrir navegación" onClick={() => setMobileMenuOpen((open) => !open)}>{mobileMenuOpen ? <Icon name="close" /> : <Icon name="menu" />}</button>
          </div>
        </header>

        <aside className={mobileMenuOpen ? 'workspace-sidebar open' : 'workspace-sidebar'} aria-label="Navegación de usuario">
          <nav>
            {[
              ['campaign', 'Campañas'], ['community', 'Equipo'], ['compass', 'Explorar'], ['bag', 'Tienda'], ['user', 'Mi perfil'],
            ].map(([icon, label], index) => index === 4 ? <a key={label} className="sidebar-link" href="/perfil"><Icon name={icon} size={21} /><span>{label}</span></a> : <button key={label} className={index === 0 ? 'sidebar-link active' : 'sidebar-link'} type="button" onClick={() => setMobileMenuOpen(false)}><Icon name={icon} size={21} /><span>{label}</span></button>)}
          </nav>
          <div className="sidebar-footer"><span className="sidebar-live-dot" />Campaña activa</div>
        </aside>

        <section className="workspace-main">
          <header className="campaign-summary">
            <div className="campaign-title"><span>CAMPAÑA</span><h1>SUSHI</h1><p>Letra actual: <strong>S</strong></p></div>
            <div className="campaign-progress">
              <div className="progress-status"><span><i /> EN VIVO</span><strong>Tu turno se acerca</strong></div>
              <ol aria-label="Secuencia de letras de SUSHI">{sequence.map((letter, index) => <li className={index === 0 ? 'active' : ''} key={`${letter}-${index}`}>{letter}</li>)}</ol>
            </div>
            <div className="campaign-next"><span>Siguiente letra</span><strong>U <Icon name="chevron" size={18} /></strong></div>
            <button className={working ? 'participate-button is-participating' : 'participate-button'} type="button" onClick={() => setWorking((current) => !current)}>{working ? 'En jornada' : 'Trabajar ahora'} <Icon name="chevron" size={20} /></button>
          </header>

          <section className="conversation-panel" aria-labelledby="conversation-title">
            <div className="conversation-heading"><h2 id="conversation-title">Actualizaciones de trabajo</h2><button type="button">Más recientes <Icon name="chevron" size={15} /></button></div>
            <div className="post-list" aria-live="polite">
              {posts.map((post) => (
                <article className="conversation-post" key={post.id}>
                  <div className={`post-avatar ${post.tone}`}>{post.initials}</div>
                  <div className="post-content"><div><strong>{post.author}</strong><time>{post.time}</time></div><p>{post.text}</p><button type="button" className="reply-button">Responder</button></div>
                  <div className="post-actions"><button className={post.liked ? 'like-button liked' : 'like-button'} type="button" aria-pressed={post.liked} onClick={() => toggleLike(post.id)}><Icon name="heart" size={18} /> {post.likes}</button><button className="more-button" type="button" aria-label={`Más opciones para la actualización de ${post.author}`}><Icon name="more" size={20} /></button></div>
                </article>
              ))}
            </div>
            <form className="message-composer" onSubmit={publishMessage}>
              <div className="post-avatar own">R</div>
              <div className="composer-box"><textarea value={message} maxLength={500} onChange={(event) => setMessage(event.target.value)} placeholder="Registra tu actualización…" aria-label="Registra tu actualización" /><div><span><button type="button" aria-label="Adjuntar imagen"><Icon name="image" size={20} /></button><button type="button" aria-label="Agregar reacción"><Icon name="smile" size={20} /></button><button type="button" aria-label="Agregar enlace"><Icon name="link" size={20} /></button></span><small>{message.length}/500</small><button className="publish-button" type="submit">Enviar actualización</button></div></div>
            </form>
          </section>

          <aside className="product-panel" aria-label="Polera temática de la campaña">
            <div className="product-heading"><h2>Polera Temática</h2><div><button type="button" aria-label="Producto anterior" onClick={() => moveProduct(-1)}><Icon name="chevron" size={19} /></button><button type="button" aria-label="Producto siguiente" onClick={() => moveProduct(1)}><Icon name="chevron" size={19} /></button></div></div>
            <div className="product-carousel" onMouseEnter={() => setCarouselPaused(true)} onMouseLeave={() => setCarouselPaused(false)} onFocus={() => setCarouselPaused(true)} onBlur={() => setCarouselPaused(false)}>
              <span className="edition-badge">Edición limitada</span><Shirt product={product} /><button className="carousel-arrow previous" type="button" aria-label="Producto anterior" onClick={() => moveProduct(-1)}><Icon name="chevron" size={20} /></button><button className="carousel-arrow next" type="button" aria-label="Producto siguiente" onClick={() => moveProduct(1)}><Icon name="chevron" size={20} /></button><span className="carousel-count">{productIndex + 1} / {products.length}</span>
            </div>
            <div className="product-thumbnails" aria-label="Productos de la colección">{products.map((item, index) => <button key={item.id} className={index === productIndex ? 'active' : ''} type="button" aria-label={`Ver polera ${item.title}`} onClick={() => setProductIndex(index)}><Shirt product={item} compact /></button>)}</div>
            <div className="product-copy"><strong>{product.title}</strong><span>{product.subtitle}</span></div>
            <button className="product-button" type="button">Ver prenda <Icon name="chevron" size={19} /></button>
          </aside>
        </section>
      </section>
    </main>
  )
}
