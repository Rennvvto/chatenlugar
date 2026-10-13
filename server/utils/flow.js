import crypto from 'node:crypto'
import { config } from '../config.js'

const baseUrl = () => config.flow.environment === 'production' ? 'https://www.flow.cl/api' : config.flow.environment === 'sandbox' ? 'https://sandbox.flow.cl/api' : null
const configured = () => Boolean(config.flow.apiKey && config.flow.secretKey && baseUrl())
const sign = (parameters) => crypto.createHmac('sha256', config.flow.secretKey).update(Object.keys(parameters).sort().map((key) => `${key}${parameters[key]}`).join('')).digest('hex')
const flowRequest = async (path, parameters, method = 'POST') => {
  if (!configured()) { const error = new Error('Flow aún no está configurado en este entorno.'); error.code = 'FLOW_NOT_CONFIGURED'; throw error }
  const data = { ...parameters, apiKey: config.flow.apiKey }; data.s = sign(data)
  const options = method === 'GET' ? {} : { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(data) }
  const url = method === 'GET' ? `${baseUrl()}${path}?${new URLSearchParams(data)}` : `${baseUrl()}${path}`
  const response = await fetch(url, options); const body = await response.json().catch(() => null)
  if (!response.ok) { const error = new Error(body?.message || body?.error || 'Flow rechazó la operación.'); error.code = 'FLOW_REQUEST_FAILED'; throw error }
  return body
}
export const createFlowPayment = ({ commerceOrder, subject, amount, email }) => flowRequest('/payment/create', { commerceOrder, subject, currency: 'CLP', amount: String(amount), email, urlConfirmation: `${config.appUrl}/api/payments/flow/confirmation`, urlReturn: `${config.appUrl}/api/payments/flow/return`, timeout: '1800' })
export const getFlowPayment = (token) => flowRequest('/payment/getStatus', { token }, 'GET')
