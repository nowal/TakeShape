import { existsSync } from 'fs'
import { rm } from 'fs/promises'

import { faint, green, red } from '../display'

export const deleteEntry = async (entryPath: string) => {
  const fullPath = entryPath // path.join(cwd,entryPath);
  try {
    if (!existsSync(fullPath)) {
      console.log(faint(`%s entry ${entryPath} doesn't exist`), fullPath)
    } else {
      await rm(fullPath, { recursive: true })
      console.log(green(`succeeded to delete ${entryPath} `))
    }
  } catch (error) {
    console.log(red(`failed to delete ${entryPath}`))
  }
}
