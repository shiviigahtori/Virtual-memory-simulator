"use client"

import { useEffect, useState } from "react"

interface MemoryVisualizerProps {
  frames: number[]
  frameCount: number
  currentPage: number | null
  history: any[]
  currentStep: number
}

export function MemoryVisualizer({ frames, frameCount, currentPage, history, currentStep }: MemoryVisualizerProps) {
  const [lastFault, setLastFault] = useState(false)

  useEffect(() => {
    if (history.length > 0 && currentStep > 0) {
      setLastFault(history[currentStep - 1]?.fault || false)
    }
  }, [history, currentStep])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Memory Frames</h3>
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span className="text-xs">Hit</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span className="text-xs">Fault</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: frameCount }).map((_, index) => {
            const value = frames[index]
            const isEmpty = value === undefined

            return (
              <div
                key={index}
                className={`
                  flex items-center justify-center h-12 rounded-md border-2
                  ${isEmpty ? "border-dashed border-gray-300" : "border-solid border-gray-400"}
                `}
              >
                <span className={`text-lg font-semibold ${isEmpty ? "text-gray-300" : "text-gray-800"}`}>
                  {isEmpty ? "Empty" : value}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Current Request</h3>
        <div className="flex items-center space-x-4">
          <div
            className={`
            flex items-center justify-center w-12 h-12 rounded-md border-2 border-gray-400
            ${currentPage !== null ? "bg-gray-100" : "bg-gray-50 border-dashed"}
          `}
          >
            <span className="text-lg font-semibold">{currentPage !== null ? currentPage : "-"}</span>
          </div>

          {currentStep > 0 && (
            <div
              className={`
              px-4 py-2 rounded-md text-white
              ${lastFault ? "bg-red-500" : "bg-green-500"}
            `}
            >
              {lastFault ? "Page Fault" : "Page Hit"}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Access History</h3>
        <div className="flex flex-wrap gap-2">
          {history.map((item, index) => (
            <div
              key={index}
              className={`
                flex items-center justify-center w-8 h-8 rounded-md border
                ${item.fault ? "bg-red-100 border-red-300" : "bg-green-100 border-green-300"}
                ${index === currentStep - 1 ? "ring-2 ring-primary" : ""}
              `}
            >
              <span className="text-sm font-medium">{item.page}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
