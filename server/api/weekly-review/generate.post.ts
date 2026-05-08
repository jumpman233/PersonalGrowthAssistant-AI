import { createCurrentWeeklyReviewGeneration } from '../../services/weekly-review'

export default defineEventHandler((event) =>
  createCurrentWeeklyReviewGeneration({ requestId: event.context.requestId }),
)
