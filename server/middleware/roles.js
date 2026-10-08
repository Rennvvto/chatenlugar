import { query } from '../db.js'

export const requireRole = (...roles) => async (req, res, next) => {
  try {
    const result = await query('SELECT role FROM users WHERE id = $1', [req.auth.sub])
    if (!result.rowCount || !roles.includes(result.rows[0].role)) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'No tienes permisos para administrar este recurso.' })
    }
    req.currentRole = result.rows[0].role
    return next()
  } catch (error) { return next(error) }
}
