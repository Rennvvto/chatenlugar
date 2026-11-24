import { useEffect, useRef, useState } from 'react'
import LugarShell, { Anchor, ArrowButton, Box, HitButton, Scene, SearchBar, Text, WordButton } from './LugarShell'
import pasoLugar from './assets/paso-lugar.svg'
import lugarTalca from './assets/lugar-talca.svg'
import pasoDiccionario from './assets/paso-diccionario.svg'
import pasoUniversos from './assets/paso-universos.svg'
import pasoFardo from './assets/paso-fardo.svg'
import pasoTienda from './assets/paso-tienda.svg'
import pasoCampana from './assets/paso-campana.svg'
import pasoBillete from './assets/paso-billete.svg'
import pasoEsquirla from './assets/paso-esquirla.svg'
import pasoHexagono from './assets/paso-hexagono.svg'
import tarjetaUno from './assets/tarjeta-coleccionable-1.png'
import tarjetaDos from './assets/tarjeta-coleccionable-2.png'
import tarjetaTres from './assets/tarjeta-coleccionable-3.png'
import tarjetaCuatro from './assets/tarjeta-coleccionable-4.png'
import tarjetaCinco from './assets/tarjeta-coleccionable-5.png'
import poleraTiendaUno from './assets/polera-tienda-1.jpg'
import poleraTiendaDos from './assets/polera-tienda-2.jpg'
import poleraTiendaTres from './assets/polera-tienda-3.jpg'

const SELECTED_CARDS = [521.09, 303.74, 13.46, '=3  |  =4  |  =5']
const cardColumns = (y) => [[298.09, y, 13.46, '=3'], [561.09, y, 13.46, '=4'], [823.09, y, 13.46, '=5']]
const noteLines = (x, y, lines) => lines.map((line, index) => [x, y + index * 16.15, 13.46, line])
const PRODUCTS_NOTE = ['ACA PONER TODOS', 'LOS PRODUCTOS QUE', 'SON POLERAS TEMATICAS', 'COLECCIONABLES', 'DE AMAROESTUDIO.CL']
const ARROWS = { back: [186.8, 577.65], next: [935.8, 577.65] }
const BLACK_BARS = ['#000', '#000', '#000', '#000', '#000']
const CAMPAIGN_BARS = ['#000', '#000', '#afafaf', '#000', '#000']
// Textos escritos dentro de las barras de UNIVERSOS DE INFORMACION, en la posicion dibujada: [x, y de la base, texto, color].
const UNIVERSE_LABELS = [
  [21.11, 18.81, 'TE POSICIONAS ARRIBA Y MUESTR', '#fff'],
  [220.87, 18.81, 'A', '#000'],
  [21.11, 34.96, 'TEXTO\\', '#000'],
  [21.11, 51.12, 'CADA CONJUNTO DE TEXTOS', '#fff'],
  [21.11, 83.42, 'CADA RECTANGULO ES UNA CAMPA', '#fff'],
  [21.11, 131.88, 'TEXTO O CONCEPTO INSTANTE', '#fff'],
]
const ALSO_LABELS = [18.81, 50.81, 86.81, 126.82, 162.82].map((y) => [16.11, y, 'TAMBIEN', '#fff'])

// Un paso por pagina del PDF, en el orden de la lista tabulada (>SELECCIONAR LUGAR ... >CREAR HEXAGONO).
// save es la palabra GUARDAR dibujada en el panel: [x, y, ancho].
const STEPS = [
  { art: pasoLugar, alt: 'Seleccionar lugar o inscribir lugar', places: true, next: [943.8, 611.65] },
  {
    art: pasoDiccionario,
    alt: 'Selecciona la tarjeta coleccionable que sea de interés del mazo temático',
    images: [[tarjetaUno, 277.5, 373.5, 97.74, 131.35], [tarjetaDos, 382.5, 373.54, 98.28, 132.07], [tarjetaTres, 485.22, 373.99, 98.28, 132.07], [tarjetaCuatro, 589.5, 373.5, 98.22, 132], [tarjetaCinco, 693.06, 373.5, 98.22, 132]],
    back: [194.8, 576.65],
    next: [943.8, 576.65],
    save: [820.05, 583.35, 56.2],
  },
  {
    art: pasoUniversos,
    alt: 'Universos de información',
    texts: [SELECTED_CARDS, ...cardColumns(502.74)],
    bars: [[197.5, 318.5, BLACK_BARS, UNIVERSE_LABELS], [460.5, 318.5, BLACK_BARS, ALSO_LABELS], [722.5, 318.5, BLACK_BARS]],
    back: [169.8, 581.65],
    next: [918.8, 581.65],
    save: [795.05, 581.35, 56.2],
  },
  { art: pasoFardo, alt: 'Ticket de fardo abecedario', texts: [SELECTED_CARDS, ...cardColumns(555.74)], back: [186.8, 586.65], next: [935.8, 586.65], save: [795.05, 580.35, 56.2] },
  {
    art: pasoTienda,
    alt: 'Crear tienda',
    images: [[poleraTiendaTres, 404.34, 367.09, 108.45, 142.76], [poleraTiendaDos, 513.66, 367.54, 108.45, 142.76], [poleraTiendaUno, 622.63, 366.5, 109.4, 144]],
    texts: [SELECTED_CARDS, ...noteLines(743.8, 429.64, PRODUCTS_NOTE), [457.8, 537.65, 13.46, 'ADHERIR PRODUCTOS A TIENDA'], [430.8, 566.65, 13.46, 'DRAG AND DROP DE PRODUCTOS A TIENDA']],
    openSearch: true,
    save: [795.05, 576.35, 56.2],
    ...ARROWS,
  },
  {
    art: pasoCampana,
    alt: 'Adherir a campaña',
    texts: [SELECTED_CARDS, ...noteLines(244.8, 535.64, ['SCROLL INFINITO CON', 'CAMPANAS CREADAS']), ...noteLines(801.8, 394.65, PRODUCTS_NOTE), [486.3, 360.15, 13.46, 'DRAG AND DROP']],
    bars: [[197.5, 348.5, CAMPAIGN_BARS]],
    save: [795.05, 569.35, 42.91],
    ...ARROWS,
  },
  {
    art: pasoBillete,
    alt: 'Crear esquirla: billete y mercado',
    texts: [SELECTED_CARDS, [204.4, 367.61, 15.36, '=X']],
    openSearch: true,
    save: [795.05, 576.35, 42.91],
    ...ARROWS,
  },
  {
    art: pasoEsquirla,
    alt: 'Crear esquirla',
    texts: [
      SELECTED_CARDS,
      [344.34, 396.82, 8.14, 'ESQUIRLAS POR MONTO  :  ESQUIRLAS MINADAS DESDE URL  :  MONTO POR LOTES DE USUARIO A HEXÁGONOS EN RUTAS'],
      [368.21, 447.01, 32.44, '$', { bold: true }],
      [420.77, 474.35, 9, 'MONTO A ALEATORIO DE LOTES DE USUARIO  |  MERCADO EN LOTES DE USUARIO'],
      [270.01, 422.25, 9.85, 'X :'],
      [270.01, 434.07, 9.85, 'Y :'],
      [809.58, 385.01, 8.66, 'ESQUIRLA'],
      [783.8, 501.64, 13.46, 'GUARDAR MONTO'],
      [244.8, 508.64, 13.46, 'DEFINIR UN MONTO PARA MINADO A TRAVES DE ESQUIRLA'],
    ],
    amount: true,
    openSearch: true,
    save: [795.05, 576.35, 42.91],
    ...ARROWS,
  },
  {
    art: pasoHexagono,
    alt: 'Crear hexágono',
    texts: [SELECTED_CARDS, [208.13, 340.61, 26.37, 'C'], [612.85, 360.84, 27.16, 'CONCEPTO INSTANTE'], [188.01, 489.25, 9.85, 'X :'], [188.01, 501.07, 9.85, 'Y :']],
    save: [795.05, 577.35, 42.91],
    ...ARROWS,
  },
]

const FLOW_KEY = 'chatenlugar-creacion'
const DEFAULT_PLACE = 'TALCA'
const MAX_PLACES = 10
const AMOUNT_DIGITS = 12

const stepFromPath = () => Math.min(Math.max(Number(window.location.pathname.split('/')[2]) || 1, 1), STEPS.length)

// Lo elegido en los pasos se guarda en la sesion del navegador: la API todavia no tiene donde guardarlo.
const readFlow = () => {
  try { return JSON.parse(window.sessionStorage.getItem(FLOW_KEY)) || {} } catch { return {} }
}
const saveFlow = (changes) => {
  try { window.sessionStorage.setItem(FLOW_KEY, JSON.stringify({ ...readFlow(), ...changes })) } catch { /* sin almacenamiento, lo elegido dura mientras la pantalla siga abierta */ }
}
const formatAmount = (value) => value.replace(/\D/g, '').slice(0, AMOUNT_DIGITS).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

// Seleccionar lugar o inscribir lugar: el desplegable de la nota del PDF (LISTADO DE LUGARES / INSCRIBIR LUGAR), hasta 10 lugares.
function PlacePicker() {
  const [places, setPlaces] = useState(() => readFlow().places ?? [DEFAULT_PLACE])
  const [selected, setSelected] = useState(() => readFlow().place ?? DEFAULT_PLACE)
  const [mode, setMode] = useState(null)

  const choose = (place) => {
    setSelected(place)
    setMode(null)
    saveFlow({ place })
  }

  const inscribe = (event) => {
    event.preventDefault()
    const place = new FormData(event.currentTarget).get('lugar').trim().toLocaleUpperCase('es-CL')
    if (!place) return setMode(null)
    const next = places.includes(place) ? places : [...places, place]
    setPlaces(next)
    saveFlow({ places: next })
    choose(place)
  }

  const rows = mode === 'menu'
    ? [['LISTADO DE LUGARES', () => setMode('list')], ['INSCRIBIR LUGAR', () => setMode('new'), places.length >= MAX_PLACES]]
    : mode === 'list' ? places.map((place) => [place, () => choose(place)]) : []

  return (
    <>
      {selected === DEFAULT_PLACE && mode !== 'new' && <Scene src={lugarTalca} alt={DEFAULT_PLACE} />}
      <div className="lg-places">
        {mode === 'new'
          ? <form onSubmit={inscribe}><input name="lugar" autoFocus maxLength={40} aria-label="Inscribir lugar" onKeyDown={(event) => { if (event.key === 'Escape') setMode(null) }} /></form>
          : (
            <>
              {selected !== DEFAULT_PLACE && <Text x={7.3} y={21.15} size={17}>{selected}</Text>}
              <HitButton x={0} y={0} w={427} h={29.5} label={`Lugar: ${selected}`} onClick={() => setMode(mode ? null : 'menu')} />
            </>
          )}
        {rows.map(([label, onClick, disabled], index) => (
          <Box key={label} x={0} y={28 + index * 26} w={427} h={29} fill="#fff" stroke={3}>
            <Text x={19.89} y={17.92} size={12.13} bold>{label}</Text>
            <HitButton x={0} y={0} w={427} h={29} label={label} onClick={onClick} disabled={disabled} />
          </Box>
        ))}
      </div>
    </>
  )
}

// Cada conjunto de textos o de campanas es una columna con scroll infinito; cada barra es un texto con su informacion oculta.
// Parte con dos tandas para que haya algo que desplazar; se ven las mismas cinco del diseno. labels se desplaza junto a las barras.
function Bars({ x, y, colors, labels = [] }) {
  const [count, setCount] = useState(colors.length * 2)
  const listRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setCount((current) => current + colors.length)
    }, { root: listRef.current, rootMargin: '0px 0px 40px 0px' })
    observer.observe(endRef.current)
    return () => observer.disconnect()
  }, [colors.length])

  return (
    <div className="lg-bars" ref={listRef} style={{ left: x, top: y }}>
      {Array.from({ length: count }, (_, index) => <i key={index} style={{ background: colors[index % colors.length] }} />)}
      {labels.map(([labelX, labelY, text, color]) => <Text key={`${labelX}-${labelY}`} x={labelX} y={labelY} size={13.46} color={color}>{text}</Text>)}
      <div ref={endRef} className="lg-feed-end" />
    </div>
  )
}

// INGRESAR > CREAR USUARIO: creacion paso a paso. Las flechas < y > avanzan y retroceden, GUARDAR guarda lo elegido
// y sigue al paso siguiente; al terminar el ultimo se llega al backoffice del usuario (/usuario).
export default function IngresarScreen() {
  const [step, setStep] = useState(stepFromPath)
  const [amount, setAmount] = useState(() => readFlow().amount ?? '')

  useEffect(() => {
    const onPop = () => setStep(stepFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goTo = (next) => {
    if (next > STEPS.length) return window.location.assign('/usuario')
    window.history.pushState(null, '', next === 1 ? '/crear-usuario' : `/crear-usuario/${next}`)
    setStep(next)
  }

  const saveAndContinue = () => {
    saveFlow({ amount })
    goTo(step + 1)
  }

  const current = STEPS[step - 1]
  return (
    <LugarShell>
      <Anchor side="center">
        <Scene key={step} src={current.art} alt={current.alt} images={current.images} texts={current.texts} />
        {current.places && <PlacePicker />}
        {current.bars?.map(([x, y, colors, labels]) => <Bars key={`${step}-${x}`} x={x} y={y} colors={colors} labels={labels} />)}
        {current.amount && (
          <>
            <input className="lg-amount" inputMode="numeric" placeholder="999.666.666.666" aria-label="Monto para minado" value={amount} onChange={(event) => setAmount(formatAmount(event.target.value))} />
            <HitButton x={779.5} y={482} w={156} h={27} label="Guardar monto" onClick={() => saveFlow({ amount })} />
          </>
        )}
        {current.save && <WordButton x={current.save[0]} y={current.save[1]} w={current.save[2]} label="Guardar" onClick={saveAndContinue} />}
        {current.back && <ArrowButton x={current.back[0]} y={current.back[1]} label="Paso anterior" onClick={() => goTo(step - 1)} />}
        <ArrowButton x={current.next[0]} y={current.next[1]} label="Paso siguiente" onClick={() => goTo(step + 1)} />
        <SearchBar key={`buscar-${step}`} x={281.6} y={81.5} placeholder="CONCEPTO INSTANTE" alwaysOpen={Boolean(current.openSearch)} />
      </Anchor>
    </LugarShell>
  )
}
