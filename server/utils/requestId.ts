import { randomUUID } from 'node:crypto'

export const createRequestId = () => {
  try {
    return randomUUID()
  } catch {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`
  }
}
