import { useEffect, useMemo, useState } from 'react'
import { apiRequest, listCampaigns } from '../platform-api'
import LugarShell, { Anchor, Art, Box, ChipSquares, Dot, SearchBar, Text, Triangle, conceptUrl } from './LugarShell'
import valorTres from './assets/valor-3.svg'
import valorCuatro from './assets/valor-4.svg'
import valorCinco from './assets/valor-5.svg'
import verBursatil from './assets/ver-bursatil.svg'

// Lista y orden que muestra el diseno. Las campanas nuevas de la API se agregan despues de estas.
const DESIGN_CAMPAIGNS = [
  { slug: 'hola', label: 'HOLA' },
  { slug: 'sushi', label: 'SUSHI' },
  { slug: 'pizza', label: 'PIZZA' },
  { slug: 'hamburguesas', label: 'HAMBURGUESA' },
  { slug: 'pixel', label: 'PIXEL' },
]
const SUGGESTED_OPTIONS = ['=3', '=4', '=5']
const VALUE_ART = { '=3': valorTres, '=4': valorCuatro, '=5': valorCinco }
const CARDS = [{ x: 27, valueX: 97.9 }, { x: 294.5, valueX: 90.4 }, { x: 562.1, valueX: 90.3 }]
const PLACE_NODES = [[257.5, 351.5], [323.5, 252.5], [821.5, 347.5], [497.5, 225.5], [536.5, 185.5], [484.5, 308.5], [523.5, 268.5], [742.5, 183.5], [690.5, 306.5], [729.5, 266.5]]
const LIST_HEIGHT = 156
const THUMB_START = 14
const THUMB_TRAVEL = 136

const optionResult = (label) => {
  const index = label.lastIndexOf('=')
  return index === -1 ? label : `=${label.slice(index + 1).trim()}`
}

function BlankCard({ x, valueX, option }) {
  return (
    <Box x={x} y={38.1} w={223.9} h={264.2} fill="#fff" stroke={3} radius={11.56}>
      <Box x={28.3} y={7.3} w={168.2} h={16.4} stroke={3} />
      <Triangle x={106.5} y={10.9} />
      {VALUE_ART[option]
        ? <Art src={VALUE_ART[option]} alt={option} x={valueX} y={74.8} w={32.8} h={35.5} />
        : <Text x={valueX} y={102.9} size={29.6}>{option}</Text>}
      <Box x={68.5} y={247.8} w={85.7} h={16.1} fill="#63b3ed" stroke={1} />
      <Art src={verBursatil} alt="VER BURSÁTIL" x={81.4} y={250.3} w={56.3} h={11.7} />
      <ChipSquares x={145.3} y={250.3} />
    </Box>
  )
}

export default function HomeScreen() {
  const [apiCampaigns, setApiCampaigns] = useState([])
  const [selected, setSelected] = useState('hola')
  const [options, setOptions] = useState(SUGGESTED_OPTIONS)
  const [thumb, setThumb] = useState(0)

  useEffect(() => {
    let active = true
    listCampaigns().then(({ campaigns }) => { if (active) setApiCampaigns(campaigns) }).catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    apiRequest(`/campaigns/${selected}/letter-chat`).then(({ letterChat }) => {
      if (!active) return
      const labels = letterChat.texts.map((text) => optionResult(text.option_label))
      setOptions(labels.length ? labels.slice(0, CARDS.length) : SUGGESTED_OPTIONS)
    }).catch(() => { if (active) setOptions(SUGGESTED_OPTIONS) })
    return () => { active = false }
  }, [selected])

  const campaigns = useMemo(() => {
    const known = new Set(DESIGN_CAMPAIGNS.map((campaign) => campaign.slug))
    const extra = apiCampaigns.filter((campaign) => !known.has(campaign.slug)).map((campaign) => ({ slug: campaign.slug, label: campaign.name.toLocaleUpperCase('es-CL') }))
    return [...DESIGN_CAMPAIGNS, ...extra]
  }, [apiCampaigns])

  const onListScroll = (event) => {
    const { scrollTop, scrollHeight } = event.currentTarget
    const range = scrollHeight - LIST_HEIGHT
    setThumb(range > 0 ? scrollTop / range : 0)
  }

  const openConcept = (term = 'CONCEPTO INSTANTE') => window.location.assign(conceptUrl(term))

  return (
    <LugarShell>
      <Anchor side="center">
        <div className="lg-nodes">
          {PLACE_NODES.map(([x, y], index) => <Dot key={`${x}-${y}`} x={x} y={y} label={`Lugar ${index + 1}`} onClick={() => openConcept()} />)}
        </div>
        <SearchBar x={281.6} y={81.5} placeholder="DICCIONARIO" alwaysOpen campaigns={campaigns} onPickCampaign={setSelected} onSearch={openConcept} />
      </Anchor>
      <Anchor side="left">
        <div className="lg-campaigns">
          <div className="lg-campaign-list" onScroll={onListScroll}>
            {campaigns.map((campaign) => (
              <button key={campaign.slug} type="button" className={campaign.slug === selected ? 'is-selected' : ''} aria-pressed={campaign.slug === selected} onClick={() => setSelected(campaign.slug)}><Text x={23.77} y={18.29} size={12.13} bold>{campaign.label}</Text></button>
            ))}
          </div>
          <i className="lg-track" aria-hidden="true" />
          <i className="lg-thumb" aria-hidden="true" style={{ top: THUMB_START + thumb * THUMB_TRAVEL }} />
        </div>
      </Anchor>
      <Anchor side="bottom">
        <section className="lg-deck" aria-label="Tarjetas coleccionables en blanco">
          {options.map((option, index) => <BlankCard key={CARDS[index].x} x={CARDS[index].x} valueX={CARDS[index].valueX} option={option} />)}
        </section>
      </Anchor>
    </LugarShell>
  )
}
