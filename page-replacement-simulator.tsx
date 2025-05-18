interface PageReplacementSimulatorProps {
  referenceString: number[]
  history: any[]
  currentStep: number
}

export function PageReplacementSimulator({ referenceString, history, currentStep }: PageReplacementSimulatorProps) {
  // Get unique pages from reference string
  const uniquePages = Array.from(new Set(referenceString))

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Timeline header */}
          <div className="flex border-b">
            <div className="w-16 shrink-0 p-2 font-medium">Page</div>
            {referenceString.map((_, index) => (
              <div
                key={index}
                className={`
                  w-10 shrink-0 p-2 text-center font-medium
                  ${index === currentStep - 1 ? "bg-primary/10" : ""}
                `}
              >
                {index + 1}
              </div>
            ))}
          </div>

          {/* Reference string row */}
          <div className="flex border-b bg-gray-50">
            <div className="w-16 shrink-0 p-2 font-medium">Access</div>
            {referenceString.map((page, index) => (
              <div
                key={index}
                className={`
                  w-10 shrink-0 p-2 text-center
                  ${index === currentStep - 1 ? "bg-primary/10 font-bold" : ""}
                `}
              >
                {page}
              </div>
            ))}
          </div>

          {/* Page fault/hit indicators */}
          <div className="flex border-b">
            <div className="w-16 shrink-0 p-2 font-medium">Result</div>
            {referenceString.map((_, index) => {
              const historyItem = history[index]
              const isFault = historyItem?.fault

              return (
                <div
                  key={index}
                  className={`
                    w-10 shrink-0 p-2 flex items-center justify-center
                    ${index === currentStep - 1 ? "bg-primary/10" : ""}
                  `}
                >
                  {index < history.length && (
                    <div
                      className={`
                        w-4 h-4 rounded-full
                        ${isFault ? "bg-red-500" : "bg-green-500"}
                      `}
                      title={isFault ? "Page Fault" : "Page Hit"}
                    ></div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Memory state visualization */}
          {uniquePages.map((page) => (
            <div key={page} className="flex">
              <div className="w-16 shrink-0 p-2 font-medium">Page {page}</div>
              {referenceString.map((_, index) => {
                const historyItem = history[index]
                const isInMemory = historyItem?.frames.includes(page)
                const isCurrentPage = historyItem?.page === page

                return (
                  <div
                    key={index}
                    className={`
                      w-10 shrink-0 p-2
                      ${index === currentStep - 1 ? "bg-primary/10" : ""}
                      ${isCurrentPage ? "bg-yellow-100" : ""}
                    `}
                  >
                    {index < history.length && isInMemory && (
                      <div className="w-full h-6 bg-gray-300 rounded-sm flex items-center justify-center">
                        <span className="text-xs">{page}</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-1"></div>
          <span>Hit</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-1"></div>
          <span>Fault</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-yellow-100 rounded-full mr-1"></div>
          <span>Current Access</span>
        </div>
      </div>
    </div>
  )
}
