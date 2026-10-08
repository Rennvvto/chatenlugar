import 'dotenv/config'
import { closeDatabase, isDatabaseReady } from '../db.js'
import { bootstrapDatabase } from './bootstrap.js'

if (!isDatabaseReady()) {
  console.error('DATABASE_URL no está configurada.')
  process.exit(1)
}

try {
  await bootstrapDatabase()
  console.log('Migración y datos iniciales aplicados correctamente.')
} catch (error) {
  console.error('No fue posible aplicar la migración.', error)
  process.exitCode = 1
} finally {
  await closeDatabase()
}
