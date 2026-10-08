import express from 'express'
import cors from 'cors'
import { config } from './config.js'
import { closeDatabase, isDatabaseReady, query } from './db.js'
import { bootstrapDatabase } from './database/bootstrap.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import campaignRoutes from './routes/campaigns.js'
import notificationRoutes from './routes/notifications.js'
import { errorHandler, notFound } from './middleware/errors.js'

const app = express()

app.disable('x-powered-by')
app.use(cors({
  origin(origin, callback) {
    if (!origin || config.clientOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origen no permitido por CORS.'))
  },
  methods: ['GET', 'POST', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json({ limit: '1mb' }))

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
