import pg from 'pg'
import { config } from './config.js'

const { Pool } = pg

export const pool = config.databaseUrl
  ? new Pool({
      connectionString: config.databaseUrl,
      ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null

export const isDatabaseReady = () => Boolean(pool)

export const query = async (...args) => {
  if (!pool) {
    const error = new Error('La base de datos no está configurada. Define DATABASE_URL en el archivo .env.')
    error.code = 'DATABASE_NOT_CONFIGURED'
    throw error
  }
  return pool.query(...args)
}

export const closeDatabase = async () => {
  if (pool) await pool.end()
}
