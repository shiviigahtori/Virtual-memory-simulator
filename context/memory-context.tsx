"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { simulateAlgorithm } from "@/lib/algorithms/simulator"
import { generateRandomReferenceString } from "@/lib/utils"

export type AlgorithmType = "fifo" | "lru" | "optimal" | "clock" | "nfu" | "random"

interface MemoryState {
  algorithm: AlgorithmType
  frameCount: number
  referenceString: string
  parsedReferenceString: number[]
  speed: number
  isRunning: boolean
  isComplete: boolean
  currentStep: number
  memoryState: number[]
  pageFaults: number
  pageHits: number
  history: HistoryItem[]
  comparisonData: ComparisonItem[]
  tlbEnabled: boolean
  tlbSize: number
  tlbHits: number
  tlbMisses: number
  workingSetSize: number
  setAlgorithm: (algorithm: AlgorithmType) => void
  setFrameCount: (count: number) => void
  setReferenceString: (str: string) => void
  setSpeed: (speed: number) => void
  startSimulation: () => void
  pauseSimulation: () => void
  stepSimulation: () => void
  resetSimulation: () => void
  generateRandomString: () => void
  setTlbEnabled: (enabled: boolean) => void
  setTlbSize: (size: number) => void
  setWorkingSetSize: (size: number) => void
}

export interface HistoryItem {
  step: number
  page: number
  frames: number[]
  fault: boolean
  replaced?: number
  tlbHit?: boolean
}

export interface ComparisonItem {
  name: string
  pageFaults: number
  pageHits: number
  efficiency: string
}

const MemoryContext = createContext<MemoryState | undefined>(undefined)

export function MemoryProvider({ children }: { children: ReactNode }) {
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("fifo")
  const [frameCount, setFrameCount] = useState(3)
  const [referenceString, setReferenceString] = useState("7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1")
  const [speed, setSpeed] = useState(1000)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [memoryState, setMemoryState] = useState<number[]>([])
  const [pageFaults, setPageFaults] = useState(0)
  const [pageHits, setPageHits] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [comparisonData, setComparisonData] = useState<ComparisonItem[]>([])
  const [parsedReferenceString, setParsedReferenceString] = useState<number[]>([])
  const [tlbEnabled, setTlbEnabled] = useState(false)
  const [tlbSize, setTlbSize] = useState(4)
  const [tlbHits, setTlbHits] = useState(0)
  const [tlbMisses, setTlbMisses] = useState(0)
  const [workingSetSize, setWorkingSetSize] = useState(5)

  useEffect(() => {
    setParsedReferenceString(referenceString.split(",").map((num) => Number.parseInt(num.trim())))
  }, [referenceString])

  useEffect(() => {
    if (isComplete) {
      runComparison()
    }
  }, [isComplete])

  const resetSimulation = useCallback(() => {
    setIsRunning(false)
    setIsComplete(false)
    setCurrentStep(0)
    setMemoryState([])
    setPageFaults(0)
    setPageHits(0)
    setHistory([])
    setTlbHits(0)
    setTlbMisses(0)
  }, [])

  const startSimulation = useCallback(() => {
    resetSimulation()
    setIsRunning(true)
  }, [resetSimulation])

  const pauseSimulation = useCallback(() => {
    setIsRunning(false)
  }, [])

  const stepSimulation = useCallback(() => {
    if (currentStep < parsedReferenceString.length) {
      simulateStep()
    } else {
      setIsComplete(true)
      setIsRunning(false)
    }
  }, [currentStep, parsedReferenceString.length])

  const simulateStep = useCallback(() => {
    const pageNumber = parsedReferenceString[currentStep]
    let newMemoryState = [...memoryState]
    let fault = false
    let replaced: number | undefined = undefined
    let tlbHit = false

    // TLB simulation
    if (tlbEnabled) {
      // Simple TLB simulation - if the page was recently accessed, consider it a TLB hit
      const recentAccesses = history.slice(-tlbSize).map((item) => item.page)
      if (recentAccesses.includes(pageNumber)) {
        tlbHit = true
        setTlbHits((prev) => prev + 1)
      } else {
        setTlbMisses((prev) => prev + 1)
      }
    }

    // Check if page is already in memory
    if (newMemoryState.includes(pageNumber)) {
      setPageHits((prev) => prev + 1)

      // For LRU, move the page to the end (most recently used)
      if (algorithm === "lru") {
        newMemoryState = newMemoryState.filter((p) => p !== pageNumber)
        newMemoryState.push(pageNumber)
      } else if (algorithm === "clock") {
        // For Clock algorithm, mark the page as referenced
        const index = newMemoryState.indexOf(pageNumber)
        // In a real implementation, we would set a reference bit
        // Here we're just simulating the concept
      }
    } else {
      fault = true
      setPageFaults((prev) => prev + 1)

      // If memory is not full, add the page
      if (newMemoryState.length < frameCount) {
        newMemoryState.push(pageNumber)
      } else {
        // Memory is full, need to replace a page
        if (algorithm === "fifo") {
          // Remove the first page (oldest)
          replaced = newMemoryState[0]
          newMemoryState.shift()
          newMemoryState.push(pageNumber)
        } else if (algorithm === "lru") {
          // Remove the least recently used page (first in the array)
          replaced = newMemoryState[0]
          newMemoryState.shift()
          newMemoryState.push(pageNumber)
        } else if (algorithm === "optimal") {
          // Find the page that won't be used for the longest time
          let furthestIndex = -1
          let replaceIndex = 0

          for (let i = 0; i < newMemoryState.length; i++) {
            const page = newMemoryState[i]
            const nextUseIndex = parsedReferenceString.indexOf(page, currentStep + 1)

            if (nextUseIndex === -1) {
              // Page won't be used again, replace it
              replaceIndex = i
              break
            } else if (nextUseIndex > furthestIndex) {
              furthestIndex = nextUseIndex
              replaceIndex = i
            }
          }

          replaced = newMemoryState[replaceIndex]
          newMemoryState[replaceIndex] = pageNumber
        } else if (algorithm === "clock") {
          // Simplified Clock algorithm
          // In a real implementation, we would check reference bits
          // Here we're just simulating FIFO for simplicity
          replaced = newMemoryState[0]
          newMemoryState.shift()
          newMemoryState.push(pageNumber)
        } else if (algorithm === "random") {
          // Random replacement
          const randomIndex = Math.floor(Math.random() * newMemoryState.length)
          replaced = newMemoryState[randomIndex]
          newMemoryState[randomIndex] = pageNumber
        } else if (algorithm === "nfu") {
          // Not Frequently Used - simplified
          // In a real implementation, we would track frequency counters
          // Here we're just simulating FIFO for simplicity
          replaced = newMemoryState[0]
          newMemoryState.shift()
          newMemoryState.push(pageNumber)
        }
      }
    }

    setMemoryState(newMemoryState)
    setHistory((prev) => [
      ...prev,
      {
        step: currentStep,
        page: pageNumber,
        frames: [...newMemoryState],
        fault: fault,
        replaced,
        tlbHit,
      },
    ])
    setCurrentStep((prev) => prev + 1)
  }, [algorithm, currentStep, frameCount, history, memoryState, parsedReferenceString, tlbEnabled, tlbSize])

  useEffect(() => {
    let timer: NodeJS.Timeout

    if (isRunning && currentStep < parsedReferenceString.length) {
      timer = setTimeout(() => {
        simulateStep()
      }, speed)
    } else if (currentStep >= parsedReferenceString.length) {
      setIsComplete(true)
      setIsRunning(false)
    }

    return () => clearTimeout(timer)
  }, [isRunning, currentStep, parsedReferenceString, speed, simulateStep])

  const runComparison = useCallback(() => {
    const algorithms: AlgorithmType[] = ["fifo", "lru", "optimal", "clock", "nfu", "random"]
    const results = []

    for (const alg of algorithms) {
      const result = simulateAlgorithm(alg, parsedReferenceString, frameCount)
      results.push({
        name: alg.toUpperCase(),
        pageFaults: result.pageFaults,
        pageHits: result.pageHits,
        efficiency: ((result.pageHits / parsedReferenceString.length) * 100).toFixed(2),
      })
    }

    setComparisonData(results)
  }, [frameCount, parsedReferenceString])

  const generateRandomString = useCallback(() => {
    setReferenceString(generateRandomReferenceString())
  }, [])

  return (
    <MemoryContext.Provider
      value={{
        algorithm,
        frameCount,
        referenceString,
        parsedReferenceString,
        speed,
        isRunning,
        isComplete,
        currentStep,
        memoryState,
        pageFaults,
        pageHits,
        history,
        comparisonData,
        tlbEnabled,
        tlbSize,
        tlbHits,
        tlbMisses,
        workingSetSize,
        setAlgorithm,
        setFrameCount,
        setReferenceString,
        setSpeed,
        startSimulation,
        pauseSimulation,
        stepSimulation,
        resetSimulation,
        generateRandomString,
        setTlbEnabled,
        setTlbSize,
        setWorkingSetSize,
      }}
    >
      {children}
    </MemoryContext.Provider>
  )
}

export function useMemory() {
  const context = useContext(MemoryContext)
  if (context === undefined) {
    throw new Error("useMemory must be used within a MemoryProvider")
  }
  return context
}
