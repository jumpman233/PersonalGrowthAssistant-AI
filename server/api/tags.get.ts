import { getTagOptions } from '../services/records'

export default defineEventHandler((event) => {
  return getTagOptions({ requestId: event.context.requestId })
})
