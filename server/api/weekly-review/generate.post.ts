import { createCurrentWeeklyReviewGeneration } from '../../services/weekly-review'

export default defineEventHandler(() => createCurrentWeeklyReviewGeneration())
