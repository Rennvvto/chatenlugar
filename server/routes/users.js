import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query } from '../db.js'
import { requireAuth } from '../middleware/auth.js'
import { toPublicUser, uniqueHandle } from '../utils/user.js'

const router = Router()
const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(160),
  bio: z.string().trim().max(220).optional().default(''),
  location: z.string().trim().max(70).optional().default(''),
})
const passwordSchema = z.object({ currentPassword: z.string().min(1).max(128), newPassword: z.string().min(8).max(128) })

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const data = profileSchema.parse(req.body)
    const email = data.email.toLocaleLowerCase('es-CL')
    const existing = await query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, req.auth.sub])
    if (existing.rowCount) return res.status(409).json({ error: 'EMAIL_IN_USE', message: 'Ese correo ya está en uso.' })
    const handle = await uniqueHandle(query, data.name, req.auth.sub)
    const result = await query(
      `UPDATE users SET name = $1, email = $2, handle = $3, bio = $4, location = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, name, email, handle, bio, location, role, joined_at, updated_at`,
      [data.name, email, handle, data.bio, data.location, req.auth.sub],
    )
    return res.json({ user: toPublicUser(result.rows[0]) })
  } catch (error) { return next(error) }
})

router.patch('/me/password', requireAuth, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = passwordSchema.parse(req.body)
    const result = await query('SELECT password_hash FROM users WHERE id = $1', [req.auth.sub])
    if (!result.rowCount || !await bcrypt.compare(currentPassword, result.rows[0].password_hash)) {
      return res.status(400).json({ error: 'INVALID_PASSWORD', message: 'La contraseña actual no coincide.' })
    }
    const passwordHash = await bcrypt.hash(newPassword, 12)
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [passwordHash, req.auth.sub])
    return res.status(204).end()
  } catch (error) { return next(error) }
})

export default router
