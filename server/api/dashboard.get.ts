import { getDashboardData } from '../services/dashboard'

export default defineEventHandler(() => {
  return getDashboardData()
})
