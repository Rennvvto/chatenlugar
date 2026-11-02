import { useEffect, useMemo, useState } from 'react'
import { LOGO_PATH, TRIANGLE_PATH } from './graphics'
import ingresarArt from './assets/ingresar.svg'
import lugarArt from './assets/lugar.svg'
import './lugar.css'

// Medidas del marco dibujado en el PDF. Todas las coordenadas de estas pantallas estan en esa escala.
const FRAME_WIDTH = 1132.5
const FRAME_HEIGHT = 695
const DICTIONARY_LINE = 'DICCIONARIO FARDO ABECEDARIO'
const PT_SANS_ASCENT = 1.018

export const conceptUrl = (term) => `/concepto/${encodeURIComponent(term.trim().toLocaleUpperCase('es-CL'))}`

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

export function Triangle({ x, y, scale = 1 }) {
  return (
    <svg className="lg-abs" style={{ left: x, top: y, width: 12 * scale, height: 10.2 * scale }} viewBox="0 0 12 10.2" aria-hidden="true">
      <path d={TRIANGLE_PATH} />
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

export function ChipSquares({ x, y, size = 2.3, gap = 0.4, rowGap = 0.7 }) {
  const step = size + gap
  const rowStep = size + rowGap
  return [[0, 0], [step, 0], [0, rowStep], [step, rowStep]].map(([dx, dy]) => (
    <i className="lg-chip" key={`${dx}-${dy}`} style={{ left: x + dx, top: y + dy, width: size, height: size }} />
  ))
}

export function Anchor({ side, className = '', children }) {
  return <div className={`lg-anchor lg-anchor-${side} ${className}`}>{children}</div>
}

export function SearchBar({ x, y, placeholder = '', initialValue = '', alwaysOpen = false, campaigns = [], onPickCampaign, onSearch }) {
  const [value, setValue] = useState(initialValue)
  const [focused, setFocused] = useState(false)
  const typed = value.trim().toLocaleUpperCase('es-CL')

  const suggestions = useMemo(() => {
    const words = typed.split(/\s+/).filter(Boolean)
    const prefixes = words.map((_, index) => words.slice(0, index + 1).join(' ')).filter((term) => term !== DICTIONARY_LINE)
    return [...new Set([...prefixes, DICTIONARY_LINE])]
  }, [typed])
  const matches = typed ? campaigns.filter((campaign) => campaign.label.includes(typed)) : []
  const rows = matches.length + suggestions.length

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
      {(alwaysOpen || focused) && (
        <ul className={`lg-suggest ${rows === 1 ? 'is-single' : ''}`}>
          {matches.map((campaign) => <li key={campaign.slug}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setValue(''); onPickCampaign?.(campaign.slug) }}>{campaign.label}</button></li>)}
          {suggestions.map((term) => <li key={term}><button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => onSearch(term)}>{term}</button></li>)}
        </ul>
      )}
    </div>
  )
}

export default function LugarShell({ children }) {
  const scale = useFrameScale()

  return (
    <main className="lg" style={{ '--s': scale }}>
      <div className="lg-frame" aria-hidden="true" />
      {children}
      <Anchor side="left">
        <a className="lg-brand" href="/">
          <Logo color="#000a11" x={24.3} y={8} />
          <Text x={65.77} y={27.29} size={12.13} bold>CAMPANAS</Text>
        </a>
      </Anchor>
      <Anchor side="right">
        <a className="lg-enter" href="/crear-usuario"><Art src={ingresarArt} alt="INGRESAR" x={0} y={0} w={56.9} h={18.9} /></a>
        <span className="lg-place"><Art src={lugarArt} alt="LUGAR" x={11.2} y={8.5} w={39} h={18.9} /></span>
      </Anchor>
    </main>
  )
}
