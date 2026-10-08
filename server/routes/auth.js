import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query } from '../db.js'
import { issueAccessToken, requireAuth } from '../middleware/auth.js'
import { toPublicUser, uniqueHandle } from '../utils/user.js'

const router = Router()
const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
})
const loginSchema = z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) })

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body)
    const normalizedEmail = email.toLocaleLowerCase('es-CL')
    const existing = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [normalizedEmail])
    if (existing.rowCount) return res.status(409).json({ error: 'EMAIL_IN_USE', message: 'Ya existe una cuenta con ese correo.' })

    const passwordHash = await bcrypt.hash(password, 12)
    const handle = await uniqueHandle(query, name)
    const result = await query(
      `INSERT INTO users (name, email, password_hash, handle, bio, location)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, handle, bio, location, role, joined_at, updated_at`,
      [name, normalizedEmail, passwordHash, handle, 'Trabajador de campañas en chatenlugar.', 'Chile'],
    )
    const user = result.rows[0]
    return res.status(201).json({ token: issueAccessToken(user), user: toPublicUser(user) })
  } catch (error) { return next(error) }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body)
    const result = await query('SELECT * FROM users WHERE email = $1 LIMIT 1', [email.toLocaleLowerCase('es-CL')])
    const user = result.rows[0]
    if (!user || !await bcrypt.compare(password, user.password_hash)) {
      return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Correo o contraseña incorrectos.' })
    }
    return res.json({ token: issueAccessToken(user), user: toPublicUser(user) })
  } catch (error) { return next(error) }
})

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const result = await query('SELECT id, name, email, handle, bio, location, role, joined_at, updated_at FROM users WHERE id = $1', [req.auth.sub])
    if (!result.rowCount) return res.status(404).json({ error: 'USER_NOT_FOUND', message: 'No encontramos tu usuario.' })
    return res.json({ user: toPublicUser(result.rows[0]) })
  } catch (error) { return next(error) }
})

export default router
