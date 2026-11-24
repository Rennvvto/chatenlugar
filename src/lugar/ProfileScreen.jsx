import { useState } from 'react'
import LugarShell, { Anchor, HitButton, Scene, SearchBar } from './LugarShell'
import usuario from './assets/usuario.svg'

const TEXTS = [
  [104.44, 279.84, 18.87, 'C'],
  [87.01, 299.11, 9.74, 'X :'],
  [87.01, 310.67, 9.74, 'Y :'],
  [519.44, 305.17, 42.79, 'CONCEPTO INSTANTE'],
]
const MENU = ['CONCEPTOS INSTANTE', 'MIS COLECCIONES', 'MIS CAMPANAS', 'MIS POLERAS TEMATICAS', 'MIS PRODUCTOS', 'MIS TIENDAS', 'MIS HEXAGONOS', 'MI MONTO EN MINADO', 'MIS SALAS DE CHAT', 'MIS CITAS DE CHAT', 'ACUERDOS DE INSCRIPCION DE TEXTOS']
const MENU_BASELINE = 369.98
const MENU_STEP = 13.2
// Barra negra de la opcion elegida: las cuatro primeras estan dibujadas; las demas siguen la posicion de la cuarta.
const DRAWN_BARS = [[67.5, 357.5], [60.5, 371.5], [67.5, 383.5], [67.5, 397.5]]
const barFor = (index) => DRAWN_BARS[index] ?? [67.5, MENU_BASELINE + index * MENU_STEP - 12.08]

// Backoffice: lo que ve cada usuario que ya esta inscrito. Cada seccion se marca al estar seleccionada o con el puntero encima;
// por ahora todas muestran "MAYOR INFORMACION EN LA SEGUNDA FASE", como el diseno.
export default function ProfileScreen() {
  const [selected, setSelected] = useState(0)
  const [hovered, setHovered] = useState(null)
  const [barX, barY] = barFor(hovered ?? selected)

  return (
    <LugarShell>
      <Anchor side="center">
        <Scene src={usuario} alt="Backoffice" texts={TEXTS} />
        {/* Invierte los colores bajo la barra: letras negras sobre blanco pasan a blancas sobre negro, como en el dibujo. */}
        <i className="lg-invert" aria-hidden="true" style={{ left: barX, top: barY, width: 146, height: 16 }} />
        {MENU.map((label, index) => (
          <HitButton
            key={label}
            x={66}
            y={MENU_BASELINE + index * MENU_STEP - 10.4}
            w={210}
            h={MENU_STEP}
            label={label}
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        <SearchBar x={281.6} y={81.5} placeholder="CONCEPTO INSTANTE" alwaysOpen />
      </Anchor>
    </LugarShell>
  )
}
