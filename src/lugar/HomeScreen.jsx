import { useEffect, useMemo, useState } from 'react'
import { listCampaigns } from '../platform-api'
import LugarShell, { Anchor, Dot, Scene, SearchBar, Text, conceptUrl, searchUrl } from './LugarShell'
import inicio from './assets/inicio.svg'
import mapa from './assets/mapa.svg'

// Lista y orden que muestra el diseno. Las campanas nuevas de la API se agregan despues de estas.
const DESIGN_CAMPAIGNS = [
  { slug: 'hola', label: 'HOLA' },
  { slug: 'sushi', label: 'SUSHI' },
  { slug: 'pizza', label: 'PIZZA' },
  { slug: 'hamburguesas', label: 'HAMBURGUESA' },
  { slug: 'pixel', label: 'PIXEL' },
]
const PLACE_NODES = [[257.5, 351.5], [323.5, 252.5], [782.5, 387.5], [814.5, 478.5], [821.5, 347.5], [497.5, 225.5], [536.5, 185.5], [484.5, 308.5], [523.5, 268.5], [742.5, 183.5], [690.5, 306.5], [773.5, 278.5]]
const LIST_HEIGHT = 156
const THUMB_START = 14
const THUMB_TRAVEL = 136

const search = (term) => window.location.assign(searchUrl(term))

// Sin termino es la portada del visitante (solo el buscador). Al buscar o elegir una campana
// en el buscador se despliegan sobre el mapa los nodos de lugares del concepto instante.
export default function HomeScreen({ term }) {
  const [apiCampaigns, setApiCampaigns] = useState([])
  const [selected, setSelected] = useState(() => DESIGN_CAMPAIGNS.find((campaign) => campaign.label === term)?.slug ?? 'hola')
  const [thumb, setThumb] = useState(0)

  useEffect(() => {
    let active = true
    listCampaigns().then(({ campaigns }) => { if (active) setApiCampaigns(campaigns) }).catch(() => {})
    return () => { active = false }
  }, [])

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

  const pickCampaign = (campaign) => search(campaign.label)

  if (!term) {
    return (
      <LugarShell>
        <Anchor side="bottom">
          <Scene src={inicio} alt="By/AMAROESTUDIO" />
        </Anchor>
        <Anchor side="center">
          <SearchBar x={281.6} y={308.5} campaigns={campaigns} onPickCampaign={pickCampaign} onSearch={search} />
        </Anchor>
      </LugarShell>
    )
  }

  return (
    <LugarShell>
      <Anchor side="center">
        <Scene src={mapa} alt="Mapamundi" />
        <div className="lg-nodes">
          {PLACE_NODES.map(([x, y], index) => <Dot key={`${x}-${y}`} x={x} y={y} label={`Lugar ${index + 1}`} onClick={() => window.location.assign(conceptUrl(term))} />)}
        </div>
        <SearchBar x={281.6} y={81.5} placeholder={term} alwaysOpen campaigns={campaigns} onPickCampaign={pickCampaign} onSearch={search} />
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
    </LugarShell>
  )
}
