import glob from 'fast-glob'

import { deleteEntries } from './delete/entries'
import { inverse, green, red } from './display'

const PATTERNS = ['package-lock.json', 'yarn.lock', 'node_modules', 'dist', '.next']

async function* fire(): AsyncGenerator<any> {
  let i = 0
  while (true) {
    if (PATTERNS[i]) {
      const files = await glob(PATTERNS[i], {
        onlyFiles: false,
        dot: true,
      })
      yield files
      i++
    } else {
      return
    }
  }
}
const cleanGenerator = fire()

export const eraser = async () => {
  const run = async () => {
    const next: IteratorResult<string[], void> = (await cleanGenerator.next()) ?? null
    if (!next) {
      console.log(red('Clean task failed'))
      cleanGenerator.throw('Clean task failed')
    }
    if (next.done) {
      console.log(green('Clean task done'))
      cleanGenerator.return('Clean task complete')
      process.exit()
    } else {
      console.log(inverse(`Using pattern: ${next.value}`))
      await deleteEntries(next.value ?? [], run)
    }
  }
  await run()
}
eraser()
