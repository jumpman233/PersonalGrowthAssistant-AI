import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentDir = dirname(fileURLToPath(import.meta.url))
const defaultUserProfilePath = join(currentDir, 'defaultUserProfile.md')

const readDefaultUserProfile = () => {
  try {
    return readFileSync(defaultUserProfilePath, 'utf8').trim()
  } catch {
    return ''
  }
}

const defaultUserProfile = readDefaultUserProfile()

export const getDefaultUserProfile = () => defaultUserProfile
