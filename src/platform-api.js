const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'https://api-production-abc38.up.railway.app/api' : '/api')
const TOKEN_KEY = 'chatenlugar-session-token'
const USER_KEY = 'chatenlugar-session-user'

const parseResponse = async (response) => {
  const data = response.status === 204 ? null : await response.json().catch(() => null)
  if (!response.ok) {
    const error = new Error(data?.message || 'No fue posible completar la solicitud.')
    error.status = response.status
    error.code = data?.error
    throw error
  }
  return data
}

const request = async (path, options = {}) => {
  const token = window.sessionStorage.getItem(TOKEN_KEY)
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers }
  if (token) headers.Authorization = `Bearer ${token}`
  try {
    return await parseResponse(await fetch(`${API_BASE_URL}${path}`, { ...options, headers }))
  } catch (error) {
    if (error.status === 401) {
      clearSession()
      window.dispatchEvent(new Event('chatenlugar:session-expired'))
    }
    throw error
  }
}

const persistSession = ({ token, user }) => {
  window.sessionStorage.setItem(TOKEN_KEY, token)
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(user))
  return { token, user }
}

export const getCachedSession = () => {
  const token = window.sessionStorage.getItem(TOKEN_KEY)
  if (!token) return null
  try { return { token, user: JSON.parse(window.sessionStorage.getItem(USER_KEY) || 'null') } } catch { return { token, user: null } }
}

export const clearSession = () => {
  window.sessionStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(USER_KEY)
}

export const register = async (payload) => persistSession(await request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }))
export const login = async (payload) => persistSession(await request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }))
export const restoreSession = async () => {
  const session = getCachedSession()
  if (!session?.token) return null
  const { user } = await request('/auth/me')
  return persistSession({ token: session.token, user })
}
export const updateProfile = async (payload) => {
  const { user } = await request('/users/me', { method: 'PATCH', body: JSON.stringify(payload) })
  const session = getCachedSession()
  if (session) persistSession({ token: session.token, user })
  return user
}
export const changePassword = (payload) => request('/users/me/password', { method: 'PATCH', body: JSON.stringify(payload) })
export const listCampaigns = (search = '') => request(`/campaigns?q=${encodeURIComponent(search)}`)
export const getNotifications = () => request('/notifications')
export const markNotificationRead = (id) => request(`/notifications/${id}/read`, { method: 'PATCH' })
export const markAllNotificationsRead = () => request('/notifications/read-all', { method: 'POST' })
export const apiRequest = request
export const apiBaseUrl = API_BASE_URL
