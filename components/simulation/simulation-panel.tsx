"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useMemory } from "@/context/memory-context"
import { getAlgorithmDescription } from "@/lib/utils"

export default function SimulationPanel() {
  const {
    algorithm,
    frameCount,
    referenceString,
    speed,
    isRunning,
    isComplete,
    tlbEnabled,
    tlbSize,
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
  } = useMemory()

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle>Simulation Settings</CardTitle>
        <CardDescription>Configure the page replacement algorithm and parameters</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="algorithm">Page Replacement Algorithm</Label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger id="algorithm">
              <SelectValue placeholder="Select algorithm" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fifo">First-In-First-Out (FIFO)</SelectItem>
              <SelectItem value="lru">Least Recently Used (LRU)</SelectItem>
              <SelectItem value="optimal">Optimal</SelectItem>
              <SelectItem value="clock">Clock (Second Chance)</SelectItem>
              <SelectItem value="nfu">Not Frequently Used (NFU)</SelectItem>
              <SelectItem value="random">Random</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">{getAlgorithmDescription(algorithm)}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="frames">Number of Frames</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="frames"
              min={1}
              max={10}
              step={1}
              value={[frameCount]}
              onValueChange={(value) => setFrameCount(value[0])}
            />
            <span className="w-12 text-center">{frameCount}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="reference">Reference String</Label>
            <Button variant="outline" size="sm" onClick={generateRandomString}>
              Random
            </Button>
          </div>
          <Input
            id="reference"
            value={referenceString}
            onChange={(e) => setReferenceString(e.target.value)}
            placeholder="Enter comma-separated page numbers"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="speed">Simulation Speed (ms)</Label>
          <div className="flex items-center space-x-2">
            <Slider
              id="speed"
              min={100}
              max={2000}
              step={100}
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
            />
            <span className="w-12 text-center">{speed}</span>
          </div>
        </div>

        <div className="pt-4 border-t">
          <h3 className="text-sm font-medium mb-2">Advanced Options</h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="tlb-switch">TLB Simulation</Label>
                <p className="text-xs text-muted-foreground">Simulate Translation Lookaside Buffer</p>
              </div>
              <Switch id="tlb-switch" checked={tlbEnabled} onCheckedChange={setTlbEnabled} />
            </div>

            {tlbEnabled && (
              <div className="space-y-2">
                <Label htmlFor="tlb-size">TLB Size</Label>
                <div className="flex items-center space-x-2">
                  <Slider
                    id="tlb-size"
                    min={1}
                    max={8}
                    step={1}
                    value={[tlbSize]}
                    onValueChange={(value) => setTlbSize(value[0])}
                  />
                  <span className="w-12 text-center">{tlbSize}</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="working-set">Working Set Window</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="working-set"
                  min={2}
                  max={10}
                  step={1}
                  value={[workingSetSize]}
                  onValueChange={(value) => setWorkingSetSize(value[0])}
                />
                <span className="w-12 text-center">{workingSetSize}</span>
              </div>
              <p className="text-xs text-muted-foreground">Number of recent accesses to consider as the working set</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={resetSimulation}>
          Reset
        </Button>
        {isRunning ? (
          <Button variant="secondary" onClick={pauseSimulation}>
            Pause
          </Button>
        ) : (
          <Button onClick={startSimulation}>Start</Button>
        )}
        <Button variant="secondary" onClick={stepSimulation} disabled={isRunning || isComplete}>
          Step
        </Button>
      </CardFooter>
    </Card>
  )
}
