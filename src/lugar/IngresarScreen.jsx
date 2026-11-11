import { useEffect, useRef, useState } from 'react'
import LugarShell, { Anchor, ArrowButton, Scene, SearchBar, searchUrl } from './LugarShell'
import pasoLugar from './assets/paso-lugar.svg'
import pasoDiccionario from './assets/paso-diccionario.svg'
import pasoUniversos from './assets/paso-universos.svg'
import pasoFardo from './assets/paso-fardo.svg'
import pasoTienda from './assets/paso-tienda.svg'
import pasoCampana from './assets/paso-campana.svg'
import pasoChat from './assets/paso-chat.svg'
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
const CARD_COLUMNS = [[298.09, 583.74, 13.46, '=3'], [561.09, 583.74, 13.46, '=4'], [823.09, 583.74, 13.46, '=5']]
const SCROLL_NOTE = [[244.8, 570.64, 13.46, 'SCROLL INFINITO CON'], [244.8, 586.79, 13.46, 'CAMPANAS CREADAS']]
const PRODUCTS_NOTE = ['ACA PONER TODOS', 'LOS PRODUCTOS QUE ', 'SON POLERAS TEMATICAS', 'COLECCIONABLES', 'DE AMAROESTUDIO.CL']
const noteLines = (x, lines) => lines.map((line, index) => [x, [429.64, 445.8, 461.95, 478.1, 494.25][index], 13.46, line])
const ARROWS = { back: [186.8, 577.65], next: [935.8, 577.65] }

// Un paso por pagina del PDF, en el orden de la lista tabulada (>SELECCIONAR LUGAR ... >CREAR HEXAGONO).
const STEPS = [
  { art: pasoLugar, alt: 'Seleccionar lugar o inscribir lugar', next: [943.8, 611.65] },
  {
    art: pasoDiccionario,
    alt: 'Diccionario y tarjeta coleccionable',
    images: [[tarjetaUno, 325.5, 401.5, 97.74, 131.35], [tarjetaDos, 430.5, 401.54, 98.28, 132.07], [tarjetaTres, 533.22, 401.99, 98.28, 132.07], [tarjetaCuatro, 637.5, 401.5, 98.22, 132], [tarjetaCinco, 741.06, 401.5, 98.22, 132]],
    back: [194.8, 576.65],
    next: [943.8, 576.65],
  },
  { art: pasoUniversos, alt: 'Universos de información', texts: [SELECTED_CARDS, ...CARD_COLUMNS], back: [169.8, 581.65], next: [918.8, 581.65] },
  { art: pasoFardo, alt: 'Ticket de fardo abecedario', texts: [SELECTED_CARDS, ...CARD_COLUMNS], back: [186.8, 586.65], next: [935.8, 586.65] },
  {
    art: pasoTienda,
    alt: 'Crear tienda',
    images: [[poleraTiendaTres, 404.34, 367.09, 108.45, 142.76], [poleraTiendaDos, 513.66, 367.54, 108.45, 142.76], [poleraTiendaUno, 622.63, 366.5, 109.4, 144]],
    texts: [SELECTED_CARDS, ...noteLines(743.8, PRODUCTS_NOTE), [457.8, 537.65, 13.46, 'ADHERIR PRODUCTOS A TIENDA'], [430.8, 566.65, 13.46, 'DRAG AND DROP DE PRODUCTOS A TIENDA']],
    ...ARROWS,
  },
  { art: pasoCampana, alt: 'Adherir a campaña', bars: true, texts: [SELECTED_CARDS, ...SCROLL_NOTE, ...noteLines(801.8, PRODUCTS_NOTE), [486.3, 395.15, 13.46, 'DRAG AND DROP']], ...ARROWS },
  { art: pasoChat, alt: 'Ticket de chat letra a letra', bars: true, texts: [SELECTED_CARDS, ...SCROLL_NOTE, ...noteLines(801.8, ['ACA PONER TODAS', 'LAS CAMPANAS']), [486.3, 395.15, 13.46, 'TICKET DE CHAT LETRA A LETRA']], ...ARROWS },
  {
    art: pasoEsquirla,
    alt: 'Crear esquirla',
    texts: [
      SELECTED_CARDS,
      [344.34, 396.82, 8.14, 'ESQUIRLAS POR MONTO  :  ESQUIRLAS MINADAS DESDE URL  :  MONTO POR LOTES DE USUARIO A HEXÁGONOS EN RUTAS'],
      [368.21, 447.01, 32.44, '$', { bold: true }],
      [386.6, 447.01, 51.36, '999.666.666.666', { bold: true }],
      [420.77, 474.35, 9, 'MONTO A ALEATORIO DE LOTES DE USUARIO  |  MERCADO EN LOTES DE USUARIO'],
      [270.01, 422.25, 9.85, 'X :'],
      [270.01, 434.07, 9.85, 'Y :'],
      [809.58, 385.01, 8.66, 'ESQUIRLA'],
      [783.8, 501.64, 13.46, 'GUARDAR MONTO'],
      [244.8, 508.64, 13.46, 'DEFINIR UN MONTO PARA MINADO A TRAVES DE ESQUIRLA'],
    ],
    ...ARROWS,
  },
  {
    art: pasoHexagono,
    alt: 'Crear hexágono',
    texts: [SELECTED_CARDS, [208.13, 340.61, 26.37, 'C'], [612.85, 360.84, 27.16, 'CONCEPTO INSTANTE'], [270.01, 455.25, 9.85, 'X :'], [270.01, 467.07, 9.85, 'Y :']],
    ...ARROWS,
  },
]
const BAR_COLORS = ['#000', '#000', '#afafaf', '#000', '#000']

const stepFromPath = () => Math.min(Math.max(Number(window.location.pathname.split('/')[2]) || 1, 1), STEPS.length)

// Scroll infinito con las campanas creadas: cada barra es una campana con su informacion oculta.
// Parte con dos tandas para que haya algo que desplazar; se ven las mismas cinco del diseno.
function CampaignBars() {
  const [count, setCount] = useState(BAR_COLORS.length * 2)
  const listRef = useRef(null)
  const endRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setCount((current) => current + BAR_COLORS.length)
    }, { root: listRef.current, rootMargin: '0px 0px 40px 0px' })
    observer.observe(endRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="lg-bars" ref={listRef}>
      {Array.from({ length: count }, (_, index) => <i key={index} style={{ background: BAR_COLORS[index % BAR_COLORS.length] }} />)}
      <div ref={endRef} className="lg-feed-end" />
    </div>
  )
}

// INGRESAR: creacion de usuario paso a paso. Las flechas < y > del panel avanzan y retroceden;
// al terminar el ultimo paso se llega a la pagina del usuario, /by/usuario.
export default function IngresarScreen() {
  const [step, setStep] = useState(stepFromPath)

  useEffect(() => {
    const onPop = () => setStep(stepFromPath())
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  const goTo = (next) => {
    if (next > STEPS.length) return window.location.assign('/by/usuario')
    window.history.pushState(null, '', next === 1 ? '/crear-usuario' : `/crear-usuario/${next}`)
    setStep(next)
  }

  const current = STEPS[step - 1]
  return (
    <LugarShell>
      <Anchor side="center">
        <Scene key={step} src={current.art} alt={current.alt} images={current.images} texts={current.texts} />
        {current.bars && <CampaignBars key={`barras-${step}`} />}
        {current.back && <ArrowButton x={current.back[0]} y={current.back[1]} label="Paso anterior" onClick={() => goTo(step - 1)} />}
        <ArrowButton x={current.next[0]} y={current.next[1]} label="Paso siguiente" onClick={() => goTo(step + 1)} />
        <SearchBar x={281.6} y={81.5} placeholder="CONCEPTO INSTANTE" alwaysOpen onSearch={(term) => window.location.assign(searchUrl(term))} />
      </Anchor>
    </LugarShell>
  )
}
