import jwt from 'jsonwebtoken'
import { config } from '../config.js'

export const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) return res.status(401).json({ error: 'AUTH_REQUIRED', message: 'Debes iniciar sesión para continuar.' })

  try {
    req.auth = jwt.verify(token, config.jwtSecret)
    return next()
  } catch {
    return res.status(401).json({ error: 'INVALID_SESSION', message: 'Tu sesión no es válida o venció. Ingresa nuevamente.' })
  }
}

export const issueAccessToken = (user) => jwt.sign(
  { sub: user.id, role: user.role, email: user.email },
  config.jwtSecret,
  { expiresIn: '7d', issuer: 'chatenlugar-api', audience: 'chatenlugar-web' },
)
