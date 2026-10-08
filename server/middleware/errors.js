export const notFound = (req, res) => res.status(404).json({ error: 'NOT_FOUND', message: 'No encontramos ese recurso.' })

export const errorHandler = (error, req, res, next) => {
  if (error?.code === 'DATABASE_NOT_CONFIGURED') {
    return res.status(503).json({ error: 'DATABASE_NOT_CONFIGURED', message: error.message })
  }
  if (error?.code === '23505') {
    return res.status(409).json({ error: 'DUPLICATE_VALUE', message: 'Ese dato ya está en uso.' })
  }
  if (error?.name === 'ZodError') {
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Revisa los datos ingresados.', details: error.issues })
  }

  console.error(error)
  return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado.' })
}
