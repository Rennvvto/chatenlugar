import HomeScreen from './lugar/HomeScreen'
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

export default function App() {
  const { pathname } = window.location
  if (pathname.startsWith('/buscar/')) return <HomeScreen term={termFromPath(pathname, '/buscar/')} />
  if (pathname.startsWith('/concepto/')) return <ConceptScreen term={termFromPath(pathname, '/concepto/')} />
  if (pathname.startsWith('/crear-usuario')) return <IngresarScreen />
  if (pathname.startsWith('/by/')) return <UserScreen />
  if (pathname.startsWith('/usuario')) return <ProfileScreen />
  return <HomeScreen />
}
