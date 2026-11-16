import { getCachedSession } from './platform-api'
import HomeScreen from './lugar/HomeScreen'
import AccessScreen from './lugar/AccessScreen'
import ConceptScreen from './lugar/ConceptScreen'
import IngresarScreen from './lugar/IngresarScreen'
import UserScreen from './lugar/UserScreen'
import ProfileScreen from './lugar/ProfileScreen'

const termFromPath = (pathname, prefix) => {
  try {
    return decodeURIComponent(pathname.slice(prefix.length)).trim().toLocaleUpperCase('es-CL') || 'CONCEPTO INSTANTE'
  } catch {
    return 'CONCEPTO INSTANTE'
  }
}

// Los pasos de creacion y el backoffice son para quien ya entro con su usuario.
const needsSession = (pathname) => pathname.startsWith('/crear-usuario') || pathname.startsWith('/usuario')

export default function App() {
  const { pathname } = window.location
  if (needsSession(pathname) && !getCachedSession()) {
    window.location.replace('/ingresar')
    return null
  }
  if (pathname.startsWith('/buscar/')) return <HomeScreen term={termFromPath(pathname, '/buscar/')} />
  if (pathname.startsWith('/ingresar')) return <AccessScreen />
  if (pathname.startsWith('/concepto/')) return <ConceptScreen term={termFromPath(pathname, '/concepto/')} />
  if (pathname.startsWith('/crear-usuario')) return <IngresarScreen />
  if (pathname.startsWith('/by/')) return <UserScreen />
  if (pathname.startsWith('/usuario')) return <ProfileScreen />
  return <HomeScreen />
}
