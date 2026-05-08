import { logger } from '../utils/logger'
import { createRequestId } from '../utils/requestId'

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  if (!path.startsWith('/api/')) {
    return
  }

  const requestId = createRequestId()
  const method = getMethod(event)
  const start = Date.now()

  event.context.requestId = requestId
  event.node.res.setHeader('x-request-id', requestId)

  logger.info('request started', {
    requestId,
    method,
    path,
  })

  event.node.res.on('finish', () => {
    logger.info('request finished', {
      requestId,
      method,
      path,
      statusCode: event.node.res.statusCode,
      durationMs: Date.now() - start,
    })
  })
})
