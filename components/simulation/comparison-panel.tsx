"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemory } from "@/context/memory-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts"
import { getAlgorithmDescription } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Sparkles } from "lucide-react"

export default function ComparisonPanel() {
  const { comparisonData } = useMemory()

  // Calculate performance metrics for radar chart
  const radarData = comparisonData.map(algorithm => ({
    subject: algorithm.name,
    efficiency: algorithm.efficiency,
    faults: 100 - (algorithm.pageFaults / (algorithm.pageFaults + algorithm.pageHits)) * 100,
    speed: 100 - (algorithm.pageFaults * 0.5), // Simulated performance metric
    memory: 100 - (algorithm.pageFaults * 0.3)  // Simulated memory usage metric
  }))

  return (
    <Card className="border-none shadow-lg">
      <CardHeader className="bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 rounded-t-xl shadow-md backdrop-blur-sm">
  <div className="flex justify-between items-start p-2">
    <div className="space-y-1">
      <CardTitle className="text-white text-lg flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-yellow-300" />
        Algorithm Performance Dashboard
      </CardTitle>
      <CardDescription className="text-white/80 text-sm">
        Dive into a comparative view of page replacement strategies.
      </CardDescription>
    </div>
    <div className="mt-1">
      <Badge className="bg-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full shadow-inner">
        {comparisonData.length} Algorithms
      </Badge>
    </div>
  </div>
</CardHeader>

      
      <CardContent className="p-6 space-y-8">
        {comparisonData.length > 0 ? (
          <>
            {/* Performance Overview Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-4 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Page Faults Comparison
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                      <YAxis tick={{ fill: '#6b7280' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937',
                          borderColor: '#374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Bar 
                        dataKey="pageFaults" 
                        name="Page Faults" 
                        fill="#ef4444" 
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-4 shadow-sm">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  Performance Radar Analysis
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} />
                      <Radar 
                        name="Performance" 
                        dataKey="efficiency" 
                        stroke="#3b82f6" 
                        fill="#3b82f6" 
                        fillOpacity={0.4} 
                      />
                      <Radar 
                        name="Fault Resistance" 
                        dataKey="faults" 
                        stroke="#10b981" 
                        fill="#10b981" 
                        fillOpacity={0.4} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937',
                          borderColor: '#374151',
                          borderRadius: '0.5rem'
                        }}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Efficiency Metrics */}
            <Card className="p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Efficiency Metrics</h3>
              <div className="space-y-4">
                {comparisonData.map((data, index) => (
                  <div key={index} className="grid grid-cols-12 items-center gap-4">
                    <div className="col-span-2 font-medium text-sm">{data.name}</div>
                    <div className="col-span-7">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500" 
                            style={{ width: `${data.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm w-12 text-right">{data.efficiency}%</span>
                      </div>
                    </div>
                    <div className="col-span-3 flex gap-2 justify-end">
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {data.pageFaults} Faults
                      </Badge>
                      <Badge variant="outline" className="px-2 py-0.5 text-xs">
                        {data.pageHits} Hits
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Algorithm Insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {comparisonData.map((data, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium">{data.name}</h4>
                      <Badge 
                        variant="secondary" 
                        className={`px-2 ${
                          Number(data.efficiency) > 75 ? 'bg-green-100 text-green-800' :
                          Number(data.efficiency) > 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {data.efficiency}% Eff
                      </Badge>
                    </div>
                    
                    <div className="flex gap-4 mb-3">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Hits</div>
                        <div className="text-lg font-semibold text-green-600">{data.pageHits}</div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">Faults</div>
                        <div className="text-lg font-semibold text-red-600">{data.pageFaults}</div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {getAlgorithmDescription(data.name)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-600">No Comparison Data</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Run complete simulations with multiple algorithms to see detailed performance comparisons and insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}