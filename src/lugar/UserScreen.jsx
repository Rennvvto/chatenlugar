import LugarShell, { Anchor, Scene, SearchBar, Text, searchUrl } from './LugarShell'
import usuarioBy from './assets/usuario-by.svg'

const TEXTS = [
  [108.47, 209.84, 10.38, 'TARJETA COLECCIONABLE EN BLANCO'],
  [108.47, 222.29, 10.38, 'TARJETA COLECCIONABLE'],
  [108.47, 234.74, 10.38, 'BRANDING TICKET COLECCIONABLE'],
  [108.47, 247.2, 10.38, '/MAPA INSCRITO'],
  [308.62, 209.84, 10.38, 'POLERA TEMÁTICA  :', { color: '#fff' }],
  [308.62, 222.29, 10.38, 'PRODUCTO  :', { color: '#fff' }],
  [161.7, 275.56, 6.67, 'LETRA  :  CONCEPTO INSTANTE'],
  [257.33, 275.56, 6.67, 'DIVISA'],
  [143.91, 298.53, 6.67, 'LOTE DE'],
  [143.91, 306.54, 6.67, 'USUARIO'],
  [195.8, 297.79, 6.67, '=Y =X'],
  [195.8, 305.8, 6.67, 'KMS/TEXTO'],
  [104.62, 441.92, 6.67, 'APERTURA  :                                                CIERRE  :'],
  [104.62, 469.35, 8.9, 'AFINIDAD  :'],
  [104.62, 480.02, 8.9, 'ESCALA  :'],
  [104.62, 490.7, 8.9, 'ALTURA  :  L | P | H | D | URL'],
  [104.62, 501.37, 8.9, 'ELEVACIÓN  : LOTE DE USUARIO  :  MERCADO'],
  [162.94, 578.34, 7.69, 'URL  :'],
  [162.94, 587.57, 7.69, 'LANDING  :'],
  [162.94, 596.8, 7.69, 'PIXEL  :'],
  [162.94, 606.03, 7.69, 'HEXADECIMAL  :'],
  [162.94, 615.26, 7.69, 'TOUR  :'],
  [304.92, 273.55, 9.46, 'BILLETE  :  MERCADO'],
  [304.92, 284.91, 9.46, 'ESQUIRLA A CRIPTOMONEDA TEMÁTICA'],
  [304.92, 371.44, 8.9, 'NODO  :'],
  [304.92, 382.12, 8.9, 'LUGAR :'],
  [304.92, 403.47, 8.9, 'CAMPAÑA'],
  [304.92, 414.14, 8.9, 'DOMINIO  :'],
  [304.92, 424.81, 8.9, 'CONCEPTO INSTANTE  :'],
  [304.92, 435.49, 8.9, 'MERCADO  :'],
  [304.92, 446.16, 8.9, 'DIVISA  :'],
  [304.92, 467.51, 8.9, 'SOLICITUDES  :'],
  [304.92, 488.86, 8.9, 'COLECCIÓN  :'],
  [304.92, 499.54, 8.9, 'ÁLBUM  :'],
  [304.92, 520.89, 8.9, 'TIENDA DROPSHIPPING  :'],
  [306.4, 583.45, 10.38, 'MARCA TEMÁTICA :  CAMPAÑA'],
  [346.31, 608.51, 7.19, 'BILLETE  :'],
  [346.31, 617.14, 7.19, 'PRODUCTO  :'],
  [346.31, 625.77, 7.19, 'ESQUIRLA  :'],
  [346.31, 634.39, 7.19, 'URL  :'],
  [597.64, 284.28, 12.87, 'URL'],
  [545.1, 412.21, 7.41, 'HACER MAZO TEMÁTICO DESDE ÉSTA TARJETA COLECCIONABLE'],
  [737.84, 220.13, 17.83, 'CONCEPTO INSTANTE'],
  [731.17, 256.54, 10.38, 'TIENDA DROPSHIPPING'],
  [731.17, 268.99, 10.38, 'URL'],
  [731.17, 281.45, 10.38, 'PRODUCTO'],
  [731.17, 305.47, 10.38, 'HEXÁGONO'],
  [731.17, 317.93, 10.38, 'LOTE DE USUARIO'],
  [731.17, 342.53, 10.38, 'TRANSACCIONES  :  TRASPASOS  :  TRANSFERENCIAS'],
  [895, 256.54, 10.38, 'SOLICITUDES'],
  [895, 268.99, 10.38, 'DE DISEÑO  :'],
  [895, 293.9, 10.38, 'PUJAS POR RANGO  :'],
  [725.47, 372.92, 8.29, 'LUGAR'],
  [779.68, 372.92, 8.29, 'URL'],
  [821.15, 372.92, 8.29, 'DIVISA'],
  [862.02, 372.92, 8.29, 'LANDING'],
  [915.49, 372.92, 8.29, 'PIXEL'],
  [956.51, 372.4, 5.6, 'HEXADECIMAL'],
  [546.58, 435.93, 10.38, 'COMPRA  :  VENTA  :  COMPRA VENTA DE ESQUIRLAS', { color: '#fff' }],
  [741.55, 514.52, 10.38, 'IMAGEN  :'],
  [741.55, 526.98, 10.38, 'ANUNCIO  :'],
  [741.55, 539.43, 10.38, 'IMAGEN A ANUNCIO  :'],
  [741.55, 580.5, 10.38, '/NODO SOCIAL'],
]

// Lo que ve un usuario ya inscrito en chatenlugar.cl/by/usuario. Por ahora es el ejemplo del PDF con sus campos vacios.
export default function UserScreen() {
  return (
    <LugarShell>
      <Anchor side="center">
        <Scene src={usuarioBy} alt="Página del usuario" texts={TEXTS} />
        <SearchBar x={273.6} y={74.5} initialValue="CONCEPTO INSTANTE" onSearch={(term) => window.location.assign(searchUrl(term))} />
        <label className="lg-hex-picker" style={{ left: 1066.1, top: 127.2, width: 45.5, height: 19.7 }}>
          <Text x={4.89} y={12.53} size={8.79}>HEX</Text>
          <i style={{ background: '#00d200', left: 26.1, top: 3.6 }} />
          <i style={{ background: '#ff8300', left: 32.4, top: 3.6 }} />
          <i style={{ background: '#f00', left: 26.1, top: 9.9 }} />
          <i style={{ background: '#0062d2', left: 32.4, top: 9.9 }} />
          <input type="color" defaultValue="#00ff00" aria-label="Seleccionar hexadecimal" />
        </label>
      </Anchor>
    </LugarShell>
  )
}
