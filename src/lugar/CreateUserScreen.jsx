import LugarShell, { Anchor, Art, Box, ChipSquares, Dot, Logo, SearchBar, Text, Triangle, conceptUrl } from './LugarShell'
import arco from './assets/arco.svg'
import posteriorPreventa from './assets/posterior-preventa.svg'
import tarjeta from './assets/tarjeta.svg'
import verBursatil from './assets/ver-bursatil.svg'

const DOT_COLUMNS = [44.5, 83, 116, 151, 186, 222]
const DOT_ROWS = [90, 128, 167, 205]
const HEXAGONS = [[23.2, 357.4], [60.8, 357.1], [98.2, 357.4], [135.8, 357.1], [173.2, 357.4], [210.8, 357.1]]
const SHEET_LINES = [
  [99.21, 32.58, 'LETRA  :  CONCEPTO INSTANTE'],
  [228.2, 32.58, 'DIVISA'],
  [75.2, 63.58, 'LOTE DE'],
  [75.2, 74.38, 'USUARIO'],
  [145.21, 62.58, '=Y =X'],
  [145.21, 73.38, 'KMS/TEXTO'],
  [49.08, 158.36, 'A CADA LETRA UN ABECEDARIO Y DICCIONARIO'],
  [22.2, 257, 'APERTURA  :                                                CIERRE  :'],
]
const PROFILE_LINES = [[294, 'AFINIDAD  :'], [308.4, 'ESCALA  :'], [322.8, 'ALTURA  :  L | P | H | D | URL'], [337.2, 'ELEVACIÓN  : LOTE DE USUARIO  :  MERCADO']]
const CHOICE_LINES = [
  [317.9, 107.36, 'TIENDA DROPSHIPPING'],
  [317.9, 124.16, 'URL'],
  [317.9, 140.96, 'PRODUCTO'],
  [317.9, 173.37, 'HEXÁGONO'],
  [317.9, 190.17, 'LOTE DE USUARIO'],
  [317.9, 223.37, 'TRANSACCIONES  :  TRASPASOS  :  TRANSFERENCIAS'],
  [538.9, 107.36, 'SOLICITUDES'],
  [538.9, 124.16, 'DE DISEÑO  :'],
  [538.9, 157.76, 'PUJAS POR RANGO  :'],
]
const TABS = [
  { cell: 295.5, x: 310.21, y: 264.36, size: 11.19, label: 'LUGAR' },
  { cell: 358.7, x: 383.34, y: 264.36, size: 11.19, label: 'URL' },
  { cell: 422.6, x: 439.28, y: 264.36, size: 11.19, label: 'DIVISA' },
  { cell: 485.7, x: 494.41, y: 264.36, size: 11.19, label: 'LANDING' },
  { cell: 548.9, x: 566.55, y: 264.36, size: 11.19, label: 'PIXEL' },
  { cell: 612, x: 621.88, y: 263.65, size: 7.55, label: 'HEXADECIMAL' },
]

function Hexagon({ x, y, w, h, fill = '#fff' }) {
  return (
    <svg className="lg-abs lg-hexagon" style={{ left: x, top: y, width: w, height: h }} viewBox="0 0 100 115.5" aria-hidden="true">
      <polygon points="50,0 100,28.9 100,86.6 50,115.5 0,86.6 0,28.9" fill={fill} stroke="#000" strokeWidth={100 / w} />
    </svg>
  )
}

function Caret({ x, y }) {
  return <svg className="lg-abs" style={{ left: x, top: y, width: 5.9, height: 3.2 }} viewBox="0 0 6 3" aria-hidden="true"><path d="M0 0h6L3 3z" /></svg>
}

function UserSheet() {
  return (
    <Box x={43.2} y={213.9} w={274} h={419.7} fill="#fff" stroke={3}>
      <Logo color="#000" x={21.5} y={20.7} scale={0.862} />
      <Caret x={44.9} y={38.5} />
      <Box x={61.7} y={21.7} w={17.2} h={17.2} fill="#fff" stroke={1} radius="50%" />
      <Caret x={80.3} y={38.9} />
      <Hexagon x={22} y={55.6} w={18} h={20.8} fill="#00ff00" />
      {DOT_ROWS.flatMap((y) => DOT_COLUMNS.map((x, column) => <Dot key={`${x}-${y}`} x={x} y={column === 0 ? y - 0.5 : y} size={17} />))}
      {SHEET_LINES.map(([x, y, line]) => <Text key={line} x={x} y={y} size={9}>{line}</Text>)}
      <Box x={92} y={268} w={104} h={7} fill="#000" />
      {PROFILE_LINES.map(([y, line]) => <Text key={line} x={22.2} y={y} size={12}>{line}</Text>)}
      <Box x={12.5} y={349.5} w={256.5} h={56} fill="#fff" stroke={1} radius={3.75} />
      {HEXAGONS.map(([x, y]) => <Hexagon key={x} x={x} y={y} w={37.5} h={43.3} />)}
      <ChipSquares x={257.3} y={357.1} size={2.2} gap={0.3} />
    </Box>
  )
}

function ChoicePanel() {
  return (
    <Box x={333.5} y={211} w={729.5} h={323} fill="#f1f1f1">
      <Box x={30.8} y={18} w={236.9} h={279.5} fill="#fff" stroke={3} radius={11.56} />
      <Box x={60.7} y={25.6} w={178} h={17.4} stroke={3} />
      <Triangle x={143.4} y={29.5} scale={1.06} />
      <Art src={tarjeta} x={75} y={65.5} w={142} h={191} />
      <Text x={137.77} y={144.79} size={17.36}>URL</Text>
      <Text x={58.08} y={159.39} size={12}>&lt;</Text>
      <Text x={229.11} y={159.39} size={12}>&gt;</Text>
      <Box x={103.3} y={280.1} w={90.6} h={17} fill="#63b3ed" stroke={1} />
      <Art src={verBursatil} alt="VER BURSÁTIL" x={116.9} y={282.7} w={59.5} h={12.4} />
      <ChipSquares x={184.5} y={282.7} size={2.4} gap={0.4} rowGap={0.8} />
      <Box x={286.5} y={29.5} w={422} h={38} fill="#fff" stroke={1} />
      <Text x={326.9} y={58.25} size={24.05}>CONCEPTO INSTANTE , ELIJA C.I</Text>
      <Box x={286.5} y={84.5} w={10} h={10} fill="#fff" stroke={1} />
      {CHOICE_LINES.map(([x, y, line]) => <Text key={line} x={x} y={y} size={14}>{line}</Text>)}
      {TABS.map((tab) => <Box key={tab.label} x={tab.cell} y={244.5} w={63.5} h={31.2} fill="#fff" stroke={1} />)}
      {TABS.map((tab) => <Text key={tab.label} x={tab.x} y={tab.y} size={tab.size}>{tab.label}</Text>)}
      <Box x={295.5} y={275.6} w={380} h={21.4} stroke={1} />
      <Text x={369.64} y={291.76} size={14}>DICCIONARIO FARDO ABECEDARIO</Text>
      <Art src={arco} x={682.6} y={248.4} w={24.5} h={5.6} />
      <Box x={688.7} y={253.8} w={19.8} h={19.8} fill="#888" radius="50%" />
      <Box x={693.6} y={257.1} w={13.2} h={13.2} fill="#000" radius="50%" />
      <Box x={692} y={257.1} w={13.2} h={13.2} fill="#f00" radius="50%" />
    </Box>
  )
}

export default function CreateUserScreen() {
  return (
    <LugarShell>
      <Anchor side="center">
        <SearchBar x={273.6} y={74.5} initialValue="CONCEPTO INSTANTE" onSearch={(term) => window.location.assign(conceptUrl(term))} />
        <label className="lg-hex-picker" style={{ left: 1066.1, top: 127.2, width: 45.5, height: 19.7 }}>
          <Text x={4.89} y={12.53} size={8.79}>HEX</Text>
          <i style={{ background: '#00d200', left: 26.1, top: 3.6 }} />
          <i style={{ background: '#ff8300', left: 32.4, top: 3.6 }} />
          <i style={{ background: '#f00', left: 26.1, top: 9.9 }} />
          <i style={{ background: '#0062d2', left: 32.4, top: 9.9 }} />
          <input type="color" defaultValue="#00ff00" aria-label="Seleccionar hexadecimal" />
        </label>
        <Dot x={536.5} y={185.5} />
        <Dot x={742.5} y={183.5} />
        <ChoicePanel />
        <UserSheet />
        <Art src={posteriorPreventa} alt="POSTERIOR A PRE-VENTA" x={613.6} y={589.2} w={66.4} h={28.8} />
      </Anchor>
    </LugarShell>
  )
}
