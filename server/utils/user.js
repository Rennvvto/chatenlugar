export const toPublicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  handle: user.handle,
  bio: user.bio,
  location: user.location,
  role: user.role,
  joinedAt: user.joined_at,
  updatedAt: user.updated_at,
})

export const createHandle = (name) => name
  .toLocaleLowerCase('es-CL')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '.')
  .replace(/^\.|\.$/g, '')
  .slice(0, 20) || 'usuario'

export const uniqueHandle = async (query, name, userId = null) => {
  const base = createHandle(name)
  let candidate = base
  let suffix = 2
  while (true) {
    const result = await query(
      'SELECT id FROM users WHERE handle = $1 AND ($2::uuid IS NULL OR id <> $2::uuid) LIMIT 1',
      [candidate, userId],
    )
    if (!result.rowCount) return candidate
    candidate = `${base.slice(0, 17)}.${suffix}`
    suffix += 1
  }
}
