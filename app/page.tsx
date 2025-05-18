"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SimulationPanel from "@/components/simulation/simulation-panel"
import VisualizationPanel from "@/components/simulation/visualization-panel"
import ComparisonPanel from "@/components/simulation/comparison-panel"
import EducationalPanel from "@/components/simulation/educational-panel"
import { MemoryProvider } from "@/context/memory-context"
import { ActivitySquare, HelpCircle } from "lucide-react"

export default function VirtualMemoryManager() {
  const [activeTab, setActiveTab] = useState("visualization")

  return (
    <MemoryProvider>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Advanced Virtual Memory Manager</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <SimulationPanel />
          <VisualizationPanel />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
  <TabsList className="grid w-full grid-cols-4 rounded-lg bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-lg p-1">
    <TabsTrigger
      value="visualization"
      className="text-white font-semibold rounded-md hover:bg-white/20 data-[state=active]:bg-white/30 data-[state=active]:text-white transition-colors duration-300"
    >
      Access Pattern
    </TabsTrigger>
    <TabsTrigger
      value="comparison"
      className="text-white font-semibold rounded-md hover:bg-white/20 data-[state=active]:bg-white/30 data-[state=active]:text-white transition-colors duration-300"
    >
      Algorithm Comparison
    </TabsTrigger>
    <TabsTrigger
      value="educational"
      className="text-white font-semibold rounded-md hover:bg-white/20 data-[state=active]:bg-white/30 data-[state=active]:text-white transition-colors duration-300"
    >
      Educational
    </TabsTrigger>
    <TabsTrigger
      value="advanced"
      className="text-white font-semibold rounded-md hover:bg-white/20 data-[state=active]:bg-white/30 data-[state=active]:text-white transition-colors duration-300"
    >
      Quiz
    </TabsTrigger>
  </TabsList>


          <TabsContent value="visualization">
            <Card>
              <CardHeader className="bg-gradient-to-tr from-rose-600 via-pink-500 to-fuchsia-500 rounded-t-xl shadow-md backdrop-blur-sm">
  <div className="flex justify-between items-start p-2">
    <div className="space-y-1">
      <CardTitle className="text-white text-lg flex items-center gap-2">
        <ActivitySquare className="w-5 h-5 text-yellow-200" />
        Page Access Pattern
      </CardTitle>
      <CardDescription className="text-white/80 text-sm">
        Visualization of memory access behavior and state transitions over time
      </CardDescription>
    </div>
  </div>
</CardHeader>

              <CardContent>
                <div className="h-[500px] overflow-auto">
                  <VisualizationPanel detailed />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comparison">
            <ComparisonPanel />
          </TabsContent>

          <TabsContent value="educational">
            <EducationalPanel />
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader className="bg-gradient-to-tr from-red-700 via-red-500 to-pink-500 rounded-t-xl shadow-md backdrop-blur-sm">
  <div className="flex justify-between items-start p-2">
    <div className="space-y-1">
      <CardTitle className="text-white text-lg flex items-center gap-2">
        <HelpCircle className="w-5 h-5 text-yellow-200" />
        Quiz Zone
      </CardTitle>
      <CardDescription className="text-white/80 text-sm">
        Test your understanding of memory concepts and algorithms
      </CardDescription>
    </div>
  </div>
</CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>TLB Simulation</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Translation Lookaside Buffer simulation coming soon. This will demonstrate how address
                        translation is accelerated.
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Thrashing Detection</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        Thrashing detection and prevention mechanisms coming soon. This will show how systems detect and
                        recover from thrashing conditions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MemoryProvider>
  )
}
