import 'dotenv/config'

const required = (name, fallback) => {
  const value = process.env[name] || fallback
  if (!value) throw new Error(`Falta la variable de entorno ${name}. Revisa .env.example.`)
  return value
}

export const config = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: required('JWT_SECRET', process.env.NODE_ENV === 'production' ? '' : 'chatenlugar-local-development-secret-change-me'),
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://127.0.0.1:5173,http://localhost:5173').split(',').map((origin) => origin.trim()).filter(Boolean),
}
