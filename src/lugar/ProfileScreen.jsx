import LugarShell, { Anchor, Scene, SearchBar, searchUrl } from './LugarShell'
import usuario from './assets/usuario.svg'

const TEXTS = [
  [87.01, 299.11, 9.74, 'X :'],
  [87.01, 310.67, 9.74, 'Y :'],
  [284.44, 305.17, 42.79, 'CONCEPTO INSTANTE'],
]

// Lo que ve cada usuario que esta en USUARIO: su concepto instante y la lista de lo suyo (MIS CONCEPTOS INSTANTE ...).
export default function ProfileScreen() {
  return (
    <LugarShell>
      <Anchor side="center">
        <Scene src={usuario} alt="Mis conceptos instante, colecciones, campañas, poleras temáticas, productos, tiendas, hexágonos, monto en minado, salas de chat, citas de chat y acuerdos de inscripción de textos" texts={TEXTS} />
        <SearchBar x={281.6} y={81.5} placeholder="CONCEPTO INSTANTE" alwaysOpen onSearch={(term) => window.location.assign(searchUrl(term))} />
      </Anchor>
    </LugarShell>
  )
}
