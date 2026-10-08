import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import { rateLimit } from 'express-rate-limit'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from './config.js'
import { closeDatabase, isDatabaseReady, query } from './db.js'
import { bootstrapDatabase } from './database/bootstrap.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import campaignRoutes from './routes/campaigns.js'
import notificationRoutes from './routes/notifications.js'
import communityRoutes from './routes/community.js'
import exploreRoutes from './routes/explore.js'
import storeRoutes from './routes/store.js'
import adminRoutes from './routes/admin.js'
import collectionRoutes from './routes/collections.js'
import { errorHandler, notFound } from './middleware/errors.js'

const app = express()
const serverDirectory = path.dirname(fileURLToPath(import.meta.url))
const clientBuildDirectory = path.resolve(serverDirectory, '../dist')

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false }))
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.clientOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origen no permitido por CORS.'))
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '1mb' }))
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 500, standardHeaders: 'draft-8', legacyHeaders: false }))
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'TOO_MANY_REQUESTS', message: 'Demasiados intentos. Intenta nuevamente más tarde.' } }))

app.get('/api/health', async (req, res) => {
  if (!isDatabaseReady()) return res.status(503).json({ status: 'degraded', database: 'not-configured' })
  try {
    await query('SELECT 1')
    return res.json({ status: 'ok', database: 'connected' })
  } catch {
    return res.status(503).json({ status: 'degraded', database: 'unavailable' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/campaigns', campaignRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/community', communityRoutes)
app.use('/api/explore', exploreRoutes)
app.use('/api/store', storeRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/collections', collectionRoutes)

if (existsSync(clientBuildDirectory)) {
  app.use(express.static(clientBuildDirectory, { index: false, maxAge: '1h' }))
  app.get('/{*clientPath}', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next()
    return res.sendFile(path.join(clientBuildDirectory, 'index.html'))
  })
}
app.use(notFound)
app.use(errorHandler)

let server

const start = async () => {
  if (isDatabaseReady()) {
    await bootstrapDatabase()
    console.log('Esquema de PostgreSQL comprobado y datos iniciales preparados.')
  }
  server = app.listen(config.port, () => {
    console.log(`API de chatenlugar activa en http://127.0.0.1:${config.port}`)
    console.log(isDatabaseReady() ? 'PostgreSQL configurado.' : 'PostgreSQL pendiente: define DATABASE_URL en .env.')
  })
}

const shutdown = async () => {
  if (!server) {
    await closeDatabase()
    process.exit(0)
  }
  server.close(async () => {
    await closeDatabase()
    process.exit(0)
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)

start().catch(async (error) => {
  console.error('La API no pudo iniciar.', error)
  await closeDatabase()
  process.exit(1)
})
