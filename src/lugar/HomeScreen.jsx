import LugarShell, { Anchor, Dot, Scene, SearchBar, conceptUrl } from './LugarShell'
import inicio from './assets/inicio.svg'
import mapa from './assets/mapa.svg'

const PLACE_NODES = [[257.5, 351.5], [323.5, 252.5], [782.5, 387.5], [814.5, 478.5], [821.5, 347.5], [497.5, 225.5], [484.5, 308.5], [523.5, 268.5], [690.5, 306.5], [773.5, 278.5]]
// Desplegable del mapa: "SIEMPRE MUESTRA EJEMPLOS GUIADOS POR DICCIONARIO", con las filas de ejemplo del diseno.
const DICTIONARY_EXAMPLES = {
  box: [81.18, 42.73, 455.19, 80.79],
  rows: [['ejemplo de texto', 21.11, 16.14], ['Ejemplo de Texto', 21.11, 32.14], ['EJEMPLO DE TEXTO', 21.11, 47.14], ['SIEMPRE MUESTRA EJEMPLOS GUIADOS POR DICCIONARIO', 21.11, 63.94]],
}

// Sin termino es la portada del visitante (solo el buscador). Al buscar o elegir una campana
// en el buscador se despliegan sobre el mapa los nodos relacionados con el concepto buscado.
export default function HomeScreen({ term }) {
  if (!term) {
    return (
      <LugarShell>
        <Anchor side="bottom">
          <Scene src={inicio} alt="By/AMAROESTUDIO" />
        </Anchor>
        <Anchor side="center">
          <SearchBar x={281.6} y={308.5} />
        </Anchor>
      </LugarShell>
    )
  }

  return (
    <LugarShell campaignsOpen>
      <Anchor side="center">
        <Scene src={mapa} alt="Mapamundi" />
        <div className="lg-nodes">
          {PLACE_NODES.map(([x, y], index) => <Dot key={`${x}-${y}`} x={x} y={y} label={`Lugar ${index + 1}`} onClick={() => window.location.assign(conceptUrl(term))} />)}
        </div>
        <SearchBar x={281.6} y={81.5} placeholder={term} alwaysOpen examples={DICTIONARY_EXAMPLES} />
      </Anchor>
    </LugarShell>
  )
}
