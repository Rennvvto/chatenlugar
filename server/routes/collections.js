import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db.js'
import { optionalAuth, requireAuth } from '../middleware/auth.js'

const router = Router()
const collectionSchema = z.object({ name: z.string().trim().min(2).max(100), description: z.string().trim().max(400), isPublic: z.boolean().default(true) })

router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const result = await query(`SELECT c.id, c.name, c.description, c.is_public, c.created_at, u.name AS owner_name, u.handle AS owner_handle,
      CASE WHEN c.user_id = $1 THEN TRUE ELSE FALSE END AS is_owner
      FROM collections c JOIN users u ON u.id = c.user_id WHERE c.is_public = TRUE OR c.user_id = $1 ORDER BY c.created_at DESC`, [req.auth?.sub || null])
    return res.json({ collections: result.rows })
  } catch (error) { return next(error) }
})
router.post('/', requireAuth, async (req, res, next) => { try { const d = collectionSchema.parse(req.body); const r = await query('INSERT INTO collections (user_id,name,description,is_public) VALUES ($1,$2,$3,$4) RETURNING id,name,description,is_public,created_at', [req.auth.sub,d.name,d.description,d.isPublic]); return res.status(201).json({ collection: { ...r.rows[0], is_owner: true } }) } catch (e) { return next(e) } })
router.patch('/:id', requireAuth, async (req, res, next) => { try { const d = collectionSchema.parse(req.body); const r = await query('UPDATE collections SET name=$1,description=$2,is_public=$3 WHERE id=$4 AND user_id=$5 RETURNING id,name,description,is_public,created_at', [d.name,d.description,d.isPublic,req.params.id,req.auth.sub]); if (!r.rowCount) return res.status(404).json({ error:'COLLECTION_NOT_FOUND',message:'No encontramos una colección que puedas editar.' }); return res.json({ collection:{...r.rows[0],is_owner:true} }) } catch(e){return next(e)} })
router.delete('/:id', requireAuth, async (req,res,next)=>{try{const r=await query('DELETE FROM collections WHERE id=$1 AND user_id=$2 RETURNING id',[req.params.id,req.auth.sub]);if(!r.rowCount)return res.status(404).json({error:'COLLECTION_NOT_FOUND',message:'No encontramos una colección que puedas eliminar.'});return res.status(204).end()}catch(e){return next(e)}})
export default router
