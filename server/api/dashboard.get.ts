import { getDashboardData } from '../services/dashboard'

export default defineEventHandler((event) => {
  return getDashboardData({ requestId: event.context.requestId })
})
