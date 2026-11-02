import HomeScreen from './lugar/HomeScreen'
import ConceptScreen from './lugar/ConceptScreen'
import CreateUserScreen from './lugar/CreateUserScreen'

const conceptFromPath = (pathname) => {
  try {
    return decodeURIComponent(pathname.slice('/concepto/'.length)).trim().toLocaleUpperCase('es-CL') || 'CONCEPTO INSTANTE'
  } catch {
    return 'CONCEPTO INSTANTE'
  }
}

export default function App() {
  const { pathname } = window.location
  if (pathname.startsWith('/concepto/')) return <ConceptScreen term={conceptFromPath(pathname)} />
  if (pathname.startsWith('/crear-usuario')) return <CreateUserScreen />
  return <HomeScreen />
}
