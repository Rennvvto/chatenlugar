import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { query } from '../db.js'

const schemaUrl = new URL('./schema.sql', import.meta.url)
const seedUrl = new URL('./seed.sql', import.meta.url)

export const bootstrapDatabase = async () => {
  const [schema, seed] = await Promise.all([
    readFile(fileURLToPath(schemaUrl), 'utf8'),
    readFile(fileURLToPath(seedUrl), 'utf8'),
  ])
  await query(schema)
  await query(seed)
}
