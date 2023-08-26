// modified based on: https://github.com/fiahfy/semaphore
// modification:  add queueMax option,
//                discards oldest request when adding while queue is full
export const semaphore = (
  permits = 1,
  queueMax = Number.MAX_SAFE_INTEGER
): {
  acquire: (callback?: () => Promise<void>) => Promise<void>
  release: () => void
} => {
  let resources = permits
  const queues: (() => void)[] = []

  const acquire = (): void => {
    if (resources > 0 && queues.length > 0) {
      resources--
      const queue = queues.shift()
      if (queue) {
        queue()
      }
    }
  }

  const release = (): void => {
    resources++
    acquire()
  }

  return {
    acquire: async (callback?: () => Promise<void>): Promise<void> => {
      if (queues.length === queueMax) {
        queues.shift(); // discard oldest
      }
      await new Promise<void>((resolve) => {
        queues.push(resolve)
        setTimeout(async () => {
          acquire()
        }, 0)
      })
      if (callback) {
        await callback()
        release()
      }
    },
    release: (): void => {
      setTimeout(() => {
        release()
      }, 0)
    },
  }
}
