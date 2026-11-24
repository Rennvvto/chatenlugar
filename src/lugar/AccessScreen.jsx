import { useRef, useState } from 'react'
import { login, register } from '../platform-api'
import LugarShell, { Anchor, Scene, SearchBar, WordButton } from './LugarShell'
import acceso from './assets/acceso.svg'

const TEXTS = [[545.12, 482.8, 12.13, 'INGRESAR', { bold: true }], [646.12, 482.8, 12.13, 'CREAR USUARIO', { bold: true }]]
const MIN_PASSWORD = 8

// La API pide un nombre al registrar; el diseno solo pide usuario y contrasena, asi que se usa la parte del correo antes de la @.
const nameFromEmail = (email) => {
  const local = email.split('@')[0].trim()
  return (local.length >= 2 ? local : email).slice(0, 80)
}

// Acceso de usuario nuevo o ya inscrito: INGRESAR inicia sesion y CREAR USUARIO registra; los dos llevan a los pasos de creacion.
// Los avisos de error usan el globo del navegador sobre el campo, porque el diseno no dibuja mensajes.
export default function AccessScreen() {
  const emailRef = useRef(null)
  const passwordRef = useRef(null)
  const [busy, setBusy] = useState(false)

  const warn = (input, message) => {
    input.setCustomValidity(message)
    input.reportValidity()
  }

  const submit = async (creating) => {
    const email = emailRef.current
    const password = passwordRef.current
    email.setCustomValidity('')
    password.setCustomValidity('')
    if (busy || !email.reportValidity() || !password.reportValidity()) return
    if (creating && password.value.length < MIN_PASSWORD) return warn(password, `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`)
    setBusy(true)
    try {
      if (creating) await register({ name: nameFromEmail(email.value), email: email.value, password: password.value })
      else await login({ email: email.value, password: password.value })
      window.location.assign('/crear-usuario')
    } catch (error) {
      warn(email, error.message)
      setBusy(false)
    }
  }

  return (
    <LugarShell>
      <Anchor side="center">
        <Scene src={acceso} alt="Acceso de usuario" texts={TEXTS} />
        <form onSubmit={(event) => { event.preventDefault(); submit(false) }}>
          <input ref={emailRef} className="lg-access-input" style={{ top: 338 }} type="email" required autoComplete="email" aria-label="Usuario (correo)" onInput={(event) => event.currentTarget.setCustomValidity('')} />
          <input ref={passwordRef} className="lg-access-input" style={{ top: 390 }} type="password" required autoComplete="current-password" aria-label="Contraseña" onInput={(event) => event.currentTarget.setCustomValidity('')} />
          <button type="submit" hidden />
        </form>
        <WordButton x={545.12} y={482.8} w={53.54} label="Ingresar" onClick={() => submit(false)} />
        <WordButton x={646.12} y={482.8} w={86.02} label="Crear usuario" onClick={() => submit(true)} />
        <SearchBar x={281.6} y={81.5} placeholder="CONCEPTO INSTANTE" />
      </Anchor>
    </LugarShell>
  )
}
