export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

export function generateRandomReferenceString(length = 20, maxPageNumber = 9) {
  const randomPages = Array.from({ length }, () => Math.floor(Math.random() * (maxPageNumber + 1)))
  return randomPages.join(",")
}

export function calculateWorkingSet(history: any[], windowSize: number, currentStep: number) {
  if (currentStep < windowSize) {
    return new Set(history.slice(0, currentStep).map((item) => item.page)).size
  }

  return new Set(history.slice(currentStep - windowSize, currentStep).map((item) => item.page)).size
}

export function formatPercentage(value: number) {
  return `${value.toFixed(2)}%`
}

export function calculateEfficiency(hits: number, total: number) {
  if (total === 0) return 0
  return (hits / total) * 100
}

export function getAlgorithmDescription(algorithm: string) {
  const descriptions = {
    fifo: "First-In-First-Out (FIFO) replaces the oldest page in memory. It's simple but doesn't consider page usage patterns.",
    lru: "Least Recently Used (LRU) replaces the page that hasn't been accessed for the longest time. It works well for most workloads but requires tracking access history.",
    optimal:
      "Optimal algorithm replaces the page that won't be used for the longest time in the future. It's theoretical and requires future knowledge, but provides a benchmark for other algorithms.",
    clock:
      "Clock algorithm (Second Chance) is an approximation of LRU that uses a reference bit and circular queue to give pages a second chance before replacement.",
    nfu: "Not Frequently Used (NFU) replaces the page with the lowest access frequency. It works well for frequency-based access patterns.",
    random: "Random replacement selects a random page to replace. Simple but unpredictable performance.",
  }

  return descriptions[algorithm.toLowerCase()] || "No description available."
}
