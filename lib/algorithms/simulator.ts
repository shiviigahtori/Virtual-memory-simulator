import type { AlgorithmType } from "@/context/memory-context"

export function simulateAlgorithm(algorithm: AlgorithmType, pages: number[], frameCount: number) {
  let memory: number[] = []
  let pageFaults = 0
  let pageHits = 0

  // For Clock algorithm
  let clockPointer = 0
  const referenceFlags: boolean[] = Array(frameCount).fill(false)

  // For NFU algorithm
  const frequencyCounters: Map<number, number> = new Map()

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]

    // Update frequency counter for NFU
    if (algorithm === "nfu") {
      frequencyCounters.set(page, (frequencyCounters.get(page) || 0) + 1)
    }

    if (memory.includes(page)) {
      pageHits++

      if (algorithm === "lru") {
        // Move to the end (most recently used)
        memory = memory.filter((p) => p !== page)
        memory.push(page)
      } else if (algorithm === "clock") {
        // Set reference bit to true
        const index = memory.indexOf(page)
        referenceFlags[index] = true
      }
    } else {
      pageFaults++

      if (memory.length < frameCount) {
        memory.push(page)
        if (algorithm === "clock") {
          referenceFlags[memory.length - 1] = true
        }
      } else {
        if (algorithm === "fifo") {
          memory.shift()
          memory.push(page)
        } else if (algorithm === "lru") {
          memory.shift()
          memory.push(page)
        } else if (algorithm === "optimal") {
          let furthestIndex = -1
          let replaceIndex = 0

          for (let j = 0; j < memory.length; j++) {
            const p = memory[j]
            const nextUseIndex = pages.indexOf(p, i + 1)

            if (nextUseIndex === -1) {
              replaceIndex = j
              break
            } else if (nextUseIndex > furthestIndex) {
              furthestIndex = nextUseIndex
              replaceIndex = j
            }
          }

          memory[replaceIndex] = page
        } else if (algorithm === "clock") {
          // Find the first page with reference bit = false
          while (referenceFlags[clockPointer]) {
            referenceFlags[clockPointer] = false
            clockPointer = (clockPointer + 1) % frameCount
          }

          memory[clockPointer] = page
          referenceFlags[clockPointer] = true
          clockPointer = (clockPointer + 1) % frameCount
        } else if (algorithm === "random") {
          const randomIndex = Math.floor(Math.random() * frameCount)
          memory[randomIndex] = page
        } else if (algorithm === "nfu") {
          // Find page with lowest frequency
          let minFreq = Number.POSITIVE_INFINITY
          let replaceIndex = 0

          for (let j = 0; j < memory.length; j++) {
            const freq = frequencyCounters.get(memory[j]) || 0
            if (freq < minFreq) {
              minFreq = freq
              replaceIndex = j
            }
          }

          memory[replaceIndex] = page
        }
      }
    }
  }

  return { pageFaults, pageHits }
}
