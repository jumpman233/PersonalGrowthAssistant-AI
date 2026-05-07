import { getTagOptions } from '../services/records'

export default defineEventHandler(() => {
  return getTagOptions()
})
