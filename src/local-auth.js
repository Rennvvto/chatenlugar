const ACCOUNTS_KEY = 'chatenlugar-local-accounts'
const SESSION_KEY = 'chatenlugar-local-session'

const readJson = (key, fallback) => {
  try {
    const value = window.localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

const writeJson = (key, value) => window.localStorage.setItem(key, JSON.stringify(value))

const normalizeEmail = (email = '') => email.trim().toLocaleLowerCase('es-CL')

const createHandle = (name, accounts, currentId = null) => {
  const base = name.toLocaleLowerCase('es-CL').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 20) || 'usuario'
  let handle = base
  let suffix = 2
  while (accounts.some((account) => account.id !== currentId && account.handle === handle)) {
    handle = `${base.slice(0, 17)}.${suffix}`
    suffix += 1
  }
  return handle
}

const hashPassword = async (password) => {
  if (!window.crypto?.subtle) throw new Error('Tu navegador no permite crear una cuenta local segura.')
  const bytes = new TextEncoder().encode(`chatenlugar-local-v1:${password}`)
  const digest = await window.crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

const publicUser = ({ passwordHash, ...user }) => user

export const getLocalSession = () => readJson(SESSION_KEY, null)

export const clearLocalSession = () => window.localStorage.removeItem(SESSION_KEY)

export const registerLocalUser = async ({ name, email, password }) => {
  const cleanName = name.trim()
  const cleanEmail = normalizeEmail(email)
  const accounts = readJson(ACCOUNTS_KEY, [])

  if (cleanName.length < 2) throw new Error('Escribe tu nombre completo.')
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error('Escribe un correo válido.')
  if (password.length < 8) throw new Error('La contraseña debe tener al menos 8 caracteres.')
  if (accounts.some((account) => account.email === cleanEmail)) throw new Error('Ya existe una cuenta con ese correo.')

  const account = {
    id: window.crypto.randomUUID(),
    name: cleanName,
    email: cleanEmail,
    handle: createHandle(cleanName, accounts),
    bio: 'Participante de campañas en chatenlugar.',
    location: 'Chile',
    joinedAt: new Date().toISOString(),
    passwordHash: await hashPassword(password),
  }

  accounts.push(account)
  writeJson(ACCOUNTS_KEY, accounts)
  const session = { user: publicUser(account) }
  writeJson(SESSION_KEY, session)
  return session
}

export const loginLocalUser = async ({ email, password }) => {
  const cleanEmail = normalizeEmail(email)
  const account = readJson(ACCOUNTS_KEY, []).find((candidate) => candidate.email === cleanEmail)
  if (!account || account.passwordHash !== await hashPassword(password)) throw new Error('Correo o contraseña incorrectos.')
  const session = { user: publicUser(account) }
  writeJson(SESSION_KEY, session)
  return session
}

export const updateLocalProfile = ({ id, name, email, bio, location }) => {
  const accounts = readJson(ACCOUNTS_KEY, [])
  const index = accounts.findIndex((account) => account.id === id)
  const cleanName = name.trim()
  const cleanEmail = normalizeEmail(email)

  if (index < 0) throw new Error('No encontramos tu cuenta local.')
  if (cleanName.length < 2) throw new Error('Escribe tu nombre completo.')
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) throw new Error('Escribe un correo válido.')
  if (accounts.some((account) => account.id !== id && account.email === cleanEmail)) throw new Error('Ese correo ya está en uso.')

  const account = {
    ...accounts[index],
    name: cleanName,
    email: cleanEmail,
    handle: createHandle(cleanName, accounts, id),
    bio: bio.trim().slice(0, 220),
    location: location.trim().slice(0, 70),
  }
  accounts[index] = account
  writeJson(ACCOUNTS_KEY, accounts)
  const session = { user: publicUser(account) }
  writeJson(SESSION_KEY, session)
  return session
}

export const changeLocalPassword = async ({ id, currentPassword, newPassword }) => {
  const accounts = readJson(ACCOUNTS_KEY, [])
  const index = accounts.findIndex((account) => account.id === id)
  if (index < 0) throw new Error('No encontramos tu cuenta local.')
  if (accounts[index].passwordHash !== await hashPassword(currentPassword)) throw new Error('La contraseña actual no coincide.')
  if (newPassword.length < 8) throw new Error('La nueva contraseña debe tener al menos 8 caracteres.')
  accounts[index] = { ...accounts[index], passwordHash: await hashPassword(newPassword) }
  writeJson(ACCOUNTS_KEY, accounts)
}
