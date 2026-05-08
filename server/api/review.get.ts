import { getWeeklyReviewData } from '../services/weekly-review'

export default defineEventHandler((event) => getWeeklyReviewData({ requestId: event.context.requestId }))
