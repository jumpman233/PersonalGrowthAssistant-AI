import { ensureCurrentWeeklyReviewGeneration } from '../services/weekly-review'

export default defineTask({
  meta: {
    name: 'weekly-review:generate-current',
    description: 'Generate the current natural week review when it is stale or missing.',
  },
  async run() {
    const result = await ensureCurrentWeeklyReviewGeneration()

    return { result }
  },
})
