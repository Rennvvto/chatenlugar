import { useEffect, useRef, useState } from 'react'
import LugarShell, { Anchor, Box, Dot, SearchBar, Text, searchUrl } from './LugarShell'
import poleraUno from './assets/polera-1.jpg'
import poleraDos from './assets/polera-2.jpg'

const PANELS_PER_PAGE = 6
const INFO_X = 48.64
const WEB_X = 258.64
const MARKET_X = 411.64
const TABS = 'POLERAS TEMÁTICAS  |  TARJETA COLECCIONABLE  |  BRANDING TEMÁTICO'

const INFO_LINES = [
  [85.96, 'TICKET DE BRANDING  :'],
  [95.56, 'LOTE DE USUARIO  :'],
  [105.16, 'COLECCIÓN  :  GALERÍA  : POLERA TEMÁTICA'],
  [114.76, 'DOMINIO EN LUGAR  : DOMINIOS SUGERIDOS  :'],
  [124.36, 'TICKET CONCEPTO INSTANTE EN MONTO  :'],
  [133.96, 'ESQUIRLAS POR AÑADIR A HEXÁGONOS  :'],
]
const WEB_LINES = [
  [96.32, 'URL  :'],
  [105.38, 'LANDING  :'],
  [114.44, 'PIXEL  :'],
  [123.5, 'HEXADECIMAL  :'],
  [141.61, 'DOMINIO  :'],
  [150.67, 'CORREO :'],
  [159.73, 'COMPRA : VENTA : COMPRA VENTA'],
  [168.79, 'RUTAS SUGERIDAS'],
  [186.91, 'ESTADÍA'],
  [205.02, 'RANGO GRIS A NEGRO'],
]
const OWNED_INFO = [
  [146.9, 'CAMPAÑAS'],
  [156.5, 'CONCEPTOS INSTANTE'],
  [166.1, 'CARTESIANOS'],
  [175.7, 'HEXÁGONOS'],
  [185.3, 'CONTENIDO DE CONCEPTO INSTANTE A CAMPANA EN MERCADO'],
]
const OWNED_KEYS = [[200.88, 'LLAVERO CIFRADOS'], [211.68, 'DICCIONARIO ABIERTO']]
const OWNED_MARKET = [
  [87.95, 'BILLETE  :'],
  [97.55, 'DIVISA  :'],
  [107.15, 'ESQUIRLA :'],
  [116.75, 'MERCADO :'],
  [138.95, 'ORIGEN  :'],
  [148.55, 'DESTINO :'],
  [158.15, 'TOUR : URL : URL : URL : URL : URL :'],
  [167.75, 'ESQUIRLA TEMATICA EN MERCADO  :'],
  [190.87, 'SOLICITUD DE USUARIO :'],
  [200.47, 'PUBLICA EN CONCEPTO INSTANTE DE USUARIO :'],
]
const LOCKED_INFO = [
  [154.89, 'CAMPAÑAS'],
  [164.49, 'CONCEPTOS INSTANTE'],
  [174.09, 'CARTESIANOS'],
  [183.69, 'HEXÁGONOS'],
  [200.88, 'LLAVERO CIFRADOS'],
  [210.48, 'DICCIONARIO ABIERTO'],
]
const LOCKED_MARKET = [
  [87.95, 'BILLETE  :'],
  [98.84, 'DIVISA  :'],
  [109.73, 'ESQUIRLA :'],
  [120.62, 'MERCADO :'],
  [138.95, 'ORIGEN  :'],
  [149.84, 'DESTINO :'],
  [160.72, 'TOUR : URL : URL : URL : URL : URL :'],
  [190.87, 'SOLICITUD DE USUARIO :'],
  [201.76, 'PUBLICA EN CONCEPTO INSTANTE DE USUARIO :'],
]
const REDACTIONS = [[455, 81.8, 157], [447, 92.2, 165], [457, 102.8, 155], [457, 113.8, 155], [452, 131.8, 160], [455, 142.8, 157], [552, 153.8, 60]]

const lines = (rows, x, size) => rows.map(([y, text]) => <Text key={text} x={x} y={y} size={size}>{text}</Text>)

function PanelBase({ color, term }) {
  return (
    <>
      <Box x={31} y={25} w={602} h={210} fill="#fff" stroke={1} />
      <Box x={0} y={0} w={31} h={235} fill={color} />
      <Box x={11} y={12} w={9.5} h={9.5} fill="#fff" stroke={1} />
      <Text x={INFO_X} y={18.28} size={8}>{TABS}</Text>
      <Text x={INFO_X} y={60.28} size={17.86}>{term}</Text>
      {lines(INFO_LINES, INFO_X, 8)}
    </>
  )
}

// Ficha de quien compro la polera o el fardo: primera opcion del ejemplo en el diseno.
function OwnedPanel({ term }) {
  return (
    <article className="lg-panel">
      <PanelBase color="#ff0303" term={term} />
      <i className="lg-rule" style={{ top: 36.5 }} />
      <i className="lg-rule" style={{ top: 68.5 }} />
      {lines(OWNED_INFO, INFO_X, 8)}
      {lines(OWNED_KEYS, INFO_X, 9)}
      <Box x={247} y={72} w={139} h={162.5} fill="#fff" stroke={1} />
      <Box x={272} y={81} w={87} h={4} fill="#000" />
      <Box x={247.5} y={217.5} w={138} h={17} fill="#000" />
      {lines(WEB_LINES, WEB_X, 7.55)}
      <Text x={411.41} y={37.9} size={8.23}>COMPRAR  /  PERÍODO DE ESTADÍA</Text>
      <Box x={385.5} y={41} w={226.5} h={30} fill="#ff0303" />
      <Text x={411.41} y={62.9} size={8.23} color="#fff">TRANSACCIONES  :  TRASPASOS  :  TRANSFERENCIAS</Text>
      {lines(OWNED_MARKET, MARKET_X, 8)}
      <img className="lg-shirt" src={poleraUno} alt="" style={{ left: 666, top: 14.8, width: 160.1, height: 210.8 }} />
    </article>
  )
}

// Ficha sin compra: la informacion queda oculta, segunda opcion del ejemplo en el diseno.
function LockedPanel({ term, image }) {
  return (
    <article className="lg-panel">
      <PanelBase color="#ff9700" term={term} />
      {lines(LOCKED_INFO, INFO_X, 8)}
      <Box x={247} y={72} w={139} h={139} fill="#fff" stroke={1} />
      <Box x={272} y={81} w={87} h={4} fill="#000" />
      {lines(WEB_LINES, WEB_X, 7.55)}
      <Text x={326.64} y={61.28} size={17.86}>COMPRAR  /  PERÍODO DE ESTADÍA</Text>
      {lines(LOCKED_MARKET, MARKET_X, 9.07)}
      {REDACTIONS.map(([x, y, w]) => <Box key={y} x={x} y={y} w={w} h={8.6} fill="#000" />)}
      <img className="lg-shirt" src={image} alt="" style={{ left: 662, top: 11.8, width: 164, height: 215.9 }} />
    </article>
  )
}

export default function ConceptScreen({ term }) {
  const [count, setCount] = useState(2)
  const feedRef = useRef(null)
  const endRef = useRef(null)

  // Scroll infinito indicado en el diseno: al llegar al final se agregan mas fichas.
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) setCount((current) => current + PANELS_PER_PAGE)
    }, { root: feedRef.current })
    observer.observe(endRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <LugarShell>
      <Anchor side="center">
        <div className="lg-feed" ref={feedRef}>
          <Dot x={6.5} y={0} size={20} />
          <div className="lg-feed-list">
            {Array.from({ length: count }, (_, index) => index === 0
              ? <OwnedPanel key={index} term={term} />
              : <LockedPanel key={index} term={term} image={index % 2 ? poleraDos : poleraUno} />)}
          </div>
          <div ref={endRef} className="lg-feed-end" />
        </div>
        <SearchBar x={281.6} y={88.5} initialValue={term} alwaysOpen onSearch={(next) => window.location.assign(searchUrl(next))} />
      </Anchor>
    </LugarShell>
  )
}
