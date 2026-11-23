import { useEffect, useMemo, useRef, useState } from 'react'
import { LOGO_PATH } from './graphics'
import ingresarArt from './assets/ingresar.svg'
import lugarArt from './assets/lugar.svg'
import './lugar.css'

// Medidas del marco dibujado en el PDF. Todas las coordenadas de estas pantallas estan en esa escala.
const FRAME_WIDTH = 1132.5
const FRAME_HEIGHT = 695
const DICTIONARY_LINE = 'DICCIONARIO FARDO ABECEDARIO'
const PT_SANS_ASCENT = 1.018
// Menu de CAMPANAS en el orden del diseno; la ultima fila va en blanco, como esta dibujada.
const CAMPAIGNS = [
  { slug: 'pixel', label: 'PIXEL' },
  { slug: 'sushi', label: 'SUSHI' },
  { slug: 'pizza', label: 'PIZZA' },
  { slug: 'hamburguesas', label: 'HAMBURGUESA' },
]

export const conceptUrl = (term) => `/concepto/${encodeURIComponent(term.trim().toLocaleUpperCase('es-CL'))}`
export const searchUrl = (term) => `/buscar/${encodeURIComponent(term.trim().toLocaleUpperCase('es-CL'))}`

const useFrameScale = () => {
  const measure = () => Math.min(window.innerWidth / FRAME_WIDTH, window.innerHeight / FRAME_HEIGHT)
  const [scale, setScale] = useState(measure)
  useEffect(() => {
    const onResize = () => setScale(measure())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return scale
}

export function Logo({ color = 'currentColor', x, y, scale = 1 }) {
  return (
    <svg className="lg-logo" style={{ left: x, top: y, width: 25.9 * scale, height: 24.6 * scale }} viewBox="0 0 25.9 24.6" fill={color} aria-hidden="true">
      <path d={LOGO_PATH} />
    </svg>
  )
}

// x e y son el origen de la linea de texto en el PDF: y es la base de las letras.
export function Text({ x, y, size, bold, color, children }) {
  return <span className={`lg-text ${bold ? 'lg-bold' : ''}`} style={{ left: x, top: y - PT_SANS_ASCENT * size, fontSize: size, color }}>{children}</span>
}

// Texto del PDF en fuentes con licencia (Myriad Pro, Sathu): se usa el trazo de las letras como grafico.
export function Art({ src, alt = '', x, y, w, h }) {
  return <img className="lg-abs" src={src} alt={alt} style={{ left: x, top: y, width: w, height: h }} />
}

// Capa fija de una pantalla, generada desde el PDF: un SVG del tamano del marco con los dibujos y el texto en fuentes con licencia.
// Encima van las imagenes [src, x, y, w, h] y el texto PT Sans [x, y, tamano, texto, { bold, color }].
export function Scene({ src, alt = '', images = [], texts = [] }) {
  return (
    <>
      <img className="lg-abs lg-art" src={src} alt={alt} style={{ left: 0, top: 0, width: FRAME_WIDTH, height: FRAME_HEIGHT }} />
      {images.map(([image, x, y, w, h]) => <img key={image} className="lg-abs lg-art" src={image} alt="" style={{ left: x, top: y, width: w, height: h }} />)}
      {texts.map(([x, y, size, text, style]) => <Text key={`${x}-${y}-${text}`} x={x} y={y} size={size} {...style}>{text}</Text>)}
    </>
  )
}

// Boton transparente sobre algo dibujado en la capa del PDF (una flecha, GUARDAR...).
export function HitButton({ x, y, w, h, label, ...props }) {
  return <button className="lg-hit" type="button" aria-label={label} style={{ left: x, top: y, width: w, height: h }} {...props} />
}

// Flecha < o > dibujada en el PDF; x e y son el origen de la letra.
export function ArrowButton({ x, y, label, onClick }) {
  return <HitButton x={x - 5} y={y - 17} w={21} h={21} label={label} onClick={onClick} />
}

// Palabra en negrita dibujada como boton (GUARDAR); x e y son el origen de la palabra y w su ancho.
export function WordButton({ x, y, w, label, onClick }) {
  return <HitButton x={x - 4} y={y - 13} w={w + 8} h={17} label={label} onClick={onClick} />
}

export function Box({ x, y, w, h, fill, stroke = 0, radius, className = '', children }) {
  const style = { left: x, top: y, width: w, height: h, background: fill, borderRadius: radius }
  if (stroke) { style.outlineWidth = stroke; style.outlineOffset = -stroke / 2 }
  return <div className={`lg-box ${stroke ? 'lg-stroked' : ''} ${className}`} style={style}>{children}</div>
}

export function Dot({ x, y, size = 26, onClick, label }) {
  const style = { left: x, top: y, width: size, height: size }
  if (onClick) return <button className="lg-dot" type="button" style={style} aria-label={label} onClick={onClick} />
  return <span className="lg-dot" style={style} aria-hidden="true" />
}

export function Anchor({ side, className = '', children }) {
  return <div className={`lg-anchor lg-anchor-${side} ${className}`}>{children}</div>
}

const goSearch = (term) => window.location.assign(searchUrl(term))

// examples: filas de ejemplo que muestra el desplegable mientras la persona no escribe { box: [x, y, w, h], rows: [[texto, x, y]] }.
// scrollbar: barra de desplazamiento dibujada al costado del desplegable de tres filas.
export function SearchBar({ x, y, placeholder = '', initialValue = '', alwaysOpen = false, examples, scrollbar = false, onSearch = goSearch }) {
  const [value, setValue] = useState(initialValue)
  const [focused, setFocused] = useState(false)
  const typed = value.trim().toLocaleUpperCase('es-CL')

  const suggestions = useMemo(() => {
    const words = typed.split(/\s+/).filter(Boolean)
    const prefixes = words.map((_, index) => words.slice(0, index + 1).join(' ')).filter((term) => term !== DICTIONARY_LINE)
    return [...new Set([...prefixes, DICTIONARY_LINE])]
  }, [typed])
  const matches = typed ? CAMPAIGNS.filter((campaign) => campaign.label.includes(typed)) : []
  const rows = matches.length + suggestions.length
  const showExamples = examples && !typed

  return (
    <div className="lg-search" style={{ left: x, top: y }}>
      <Logo color="#fff" x={15.8} y={9} />
      <form className="lg-search-field" onSubmit={(event) => { event.preventDefault(); if (typed) onSearch(typed) }}>
        <input
          value={value}
          placeholder={placeholder}
          aria-label="Buscar en el diccionario"
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 150)}
          onChange={(event) => setValue(event.target.value.toLocaleUpperCase('es-CL'))}
        />
      </form>
      {(alwaysOpen || focused) && showExamples && (
        <Box x={examples.box[0]} y={examples.box[1]} w={examples.box[2]} h={examples.box[3]} fill="#fff" stroke={3}>
          {examples.rows.map(([text, rowX, rowY]) => <Text key={text} x={rowX} y={rowY} size={14}>{text}</Text>)}
        </Box>
      )}
      {(alwaysOpen || focused) && !showExamples && (
        <ul className={`lg-suggest ${rows === 1 ? 'is-single' : ''}`}>
          {matches.map((campaign) => <li key={campaign.slug}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onSearch(campaign.label)}>{campaign.label}</button></li>)}
          {suggestions.map((term) => <li key={term}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onSearch(term)}>{term}</button></li>)}
        </ul>
      )}
      {(alwaysOpen || focused) && !showExamples && scrollbar && rows === 3 && (
        <>
          <i className="lg-suggest-track" aria-hidden="true" />
          <i className="lg-suggest-thumb" aria-hidden="true" />
        </>
      )}
    </div>
  )
}

// Deslizador celeste del menu: se mueve de arriba a abajo por el riel. Parte donde esta dibujado; desde ahi hacia abajo
// recorre la lista, para mostrar las campanas afines y sugerencias por diccionario que vayan quedando bajo las filas visibles.
const THUMB_TOP = 6
const THUMB_REST = 75
const THUMB_BOTTOM = 150

function CampaignMenu() {
  const [selected, setSelected] = useState(CAMPAIGNS[0].slug)
  const [thumbTop, setThumbTop] = useState(THUMB_REST)
  const listRef = useRef(null)
  const dragRef = useRef(null)

  const startDrag = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    // Con zoom, el puntero se mide en pixeles de pantalla: el alto real del deslizador da la escala.
    dragRef.current = { startY: event.clientY, startTop: thumbTop, scale: event.currentTarget.getBoundingClientRect().height / 12 }
  }

  const drag = (event) => {
    if (!dragRef.current) return
    const { startY, startTop, scale } = dragRef.current
    const top = Math.min(Math.max(startTop + (event.clientY - startY) / scale, THUMB_TOP), THUMB_BOTTOM)
    setThumbTop(top)
    const list = listRef.current
    list.scrollTop = Math.max(0, (top - THUMB_REST) / (THUMB_BOTTOM - THUMB_REST)) * (list.scrollHeight - list.clientHeight)
  }

  return (
    <div className="lg-campaigns">
      <div className="lg-campaign-list" ref={listRef}>
        {CAMPAIGNS.map((campaign) => (
          <button key={campaign.slug} type="button" className={campaign.slug === selected ? 'is-selected' : ''} aria-pressed={campaign.slug === selected} onClick={() => setSelected(campaign.slug)}><Text x={23.77} y={18.29} size={12.13} bold>{campaign.label}</Text></button>
        ))}
        <i aria-hidden="true" />
      </div>
      <i className="lg-track" aria-hidden="true" />
      <i className="lg-thumb" role="slider" aria-label="Deslizador de campañas" aria-valuemin={THUMB_TOP} aria-valuemax={THUMB_BOTTOM} aria-valuenow={Math.round(thumbTop)} style={{ top: thumbTop }} onPointerDown={startDrag} onPointerMove={drag} onPointerUp={() => { dragRef.current = null }} onPointerCancel={() => { dragRef.current = null }} />
    </div>
  )
}

export default function LugarShell({ campaignsOpen = false, children }) {
  const scale = useFrameScale()
  const [menuOpen, setMenuOpen] = useState(campaignsOpen)

  return (
    <main className="lg" style={{ '--s': scale }}>
      <div className="lg-frame" aria-hidden="true" />
      {children}
      <Anchor side="left">
        {menuOpen && <CampaignMenu />}
        <button className="lg-brand" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          <Logo color="#000a11" x={24.3} y={8} />
          <Text x={65.77} y={27.29} size={12.13} bold>CAMPANAS</Text>
        </button>
      </Anchor>
      <Anchor side="right">
        <a className="lg-enter" href="/ingresar"><Art src={ingresarArt} alt="INGRESAR" x={0} y={0} w={56.9} h={18.9} /></a>
        <span className="lg-place"><Art src={lugarArt} alt="LUGAR" x={11.2} y={8.5} w={39} h={18.9} /></span>
      </Anchor>
    </main>
  )
}
