"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMemory } from "@/context/memory-context"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { BookOpenCheck } from "lucide-react"

export default function EducationalPanel() {
  const { algorithm } = useMemory()
  const [activeTab, setActiveTab] = useState("concepts")
  const [terminalOutput, setTerminalOutput] = useState<{[key: string]: string}>({})
  const [isRunning, setIsRunning] = useState<{[key: string]: boolean}>({})
  const [pageSequence, setPageSequence] = useState("7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1")
  const [frameCount, setFrameCount] = useState(3)
  const [inputError, setInputError] = useState("")

  // Actual algorithm implementations
  const fifoAlgorithm = (pages: number[], frameCount: number) => {
    const memory = new Set<number>()
    const queue: number[] = []
    let pageFaults = 0
    let output = ""

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      if (!memory.has(page)) {
        pageFaults++
        output += `Page fault (${page}) - `
        
        if (memory.size >= frameCount) {
          const removed = queue.shift()!
          memory.delete(removed)
          output += `Replaced ${removed} with ${page}\n`
        } else {
          output += `Loaded ${page} into empty frame\n`
        }
        
        memory.add(page)
        queue.push(page)
      } else {
        output += `Hit (${page}) - No action needed\n`
      }
      output += `Memory state: [${Array.from(memory).join(', ')}]\n\n`
    }
    
    return {
      pageFaults,
      finalMemory: Array.from(memory),
      steps: output
    }
  }

  const lruAlgorithm = (pages: number[], frameCount: number) => {
    const memory = new Set<number>()
    const recentlyUsed: number[] = []
    let pageFaults = 0
    let output = ""

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      if (!memory.has(page)) {
        pageFaults++
        output += `Page fault (${page}) - `
        
        if (memory.size >= frameCount) {
          const removed = recentlyUsed.shift()!
          memory.delete(removed)
          output += `Replaced ${removed} with ${page}\n`
        } else {
          output += `Loaded ${page} into empty frame\n`
        }
        
        memory.add(page)
        recentlyUsed.push(page)
      } else {
        output += `Hit (${page}) - `
        recentlyUsed.splice(recentlyUsed.indexOf(page), 1)
        recentlyUsed.push(page)
        output += `Updated usage\n`
      }
      output += `Memory state: [${Array.from(memory).join(', ')}]\n`
      output += `Usage order: [${recentlyUsed.join(', ')}]\n\n`
    }
    
    return {
      pageFaults,
      finalMemory: Array.from(memory),
      steps: output
    }
  }

  const optimalAlgorithm = (pages: number[], frameCount: number) => {
    const memory = new Set<number>()
    let pageFaults = 0
    let output = ""

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      if (!memory.has(page)) {
        pageFaults++
        output += `Page fault (${page}) - `
        
        if (memory.size >= frameCount) {
          let farthest = -1
          let toReplace = -1
          
          for (const memPage of memory) {
            let j
            for (j = i + 1; j < pages.length; j++) {
              if (pages[j] === memPage) break
            }
            if (j === pages.length) {
              toReplace = memPage
              break
            }
            if (j > farthest) {
              farthest = j
              toReplace = memPage
            }
          }
          
          memory.delete(toReplace)
          output += `Replaced ${toReplace} with ${page}\n`
        } else {
          output += `Loaded ${page} into empty frame\n`
        }
        
        memory.add(page)
      } else {
        output += `Hit (${page}) - No action needed\n`
      }
      output += `Memory state: [${Array.from(memory).join(', ')}]\n\n`
    }
    
    return {
      pageFaults,
      finalMemory: Array.from(memory),
      steps: output
    }
  }

  const clockAlgorithm = (pages: number[], frameCount: number) => {
    const memory: {page: number, ref: boolean}[] = []
    let pointer = 0
    let pageFaults = 0
    let output = ""

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      let found = false
      let foundIndex = -1
      
      for (let j = 0; j < memory.length; j++) {
        if (memory[j].page === page) {
          found = true
          foundIndex = j
          break
        }
      }
      
      if (found) {
        memory[foundIndex].ref = true
        output += `Hit (${page}) - Reference bit set\n`
      } else {
        pageFaults++
        output += `Page fault (${page}) - `
        
        if (memory.length < frameCount) {
          memory.push({page, ref: true})
          output += `Loaded ${page} into empty frame\n`
        } else {
          while (true) {
            if (!memory[pointer].ref) {
              const replaced = memory[pointer].page
              memory[pointer] = {page, ref: true}
              output += `Replaced ${replaced} with ${page}\n`
              pointer = (pointer + 1) % frameCount
              break
            } else {
              memory[pointer].ref = false
              pointer = (pointer + 1) % frameCount
            }
          }
        }
      }
      
      output += `Memory state: [${memory.map(m => m.page).join(', ')}]\n`
      output += `Reference bits: [${memory.map(m => m.ref ? '1' : '0').join(', ')}]\n`
      output += `Pointer: ${pointer}\n\n`
    }
    
    return {
      pageFaults,
      finalMemory: memory.map(m => m.page),
      steps: output
    }
  }

  const lfuAlgorithm = (pages: number[], frameCount: number) => {
    const memory = new Map<number, {count: number, time: number}>()
    let time = 0
    let pageFaults = 0
    let output = ""

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i]
      time++
      
      if (memory.has(page)) {
        const entry = memory.get(page)!
        memory.set(page, {count: entry.count + 1, time})
        output += `Hit (${page}) - Count increased to ${entry.count + 1}\n`
      } else {
        pageFaults++
        output += `Page fault (${page}) - `
        
        if (memory.size >= frameCount) {
          let minCount = Infinity
          let oldestTime = Infinity
          let toReplace = -1
          
          for (const [memPage, {count, time}] of memory) {
            if (count < minCount || (count === minCount && time < oldestTime)) {
              minCount = count
              oldestTime = time
              toReplace = memPage
            }
          }
          
          memory.delete(toReplace)
          output += `Replaced ${toReplace} (count: ${minCount}) with ${page}\n`
        } else {
          output += `Loaded ${page} into empty frame\n`
        }
        
        memory.set(page, {count: 1, time})
      }
      
      output += `Memory state: [${Array.from(memory.keys()).join(', ')}]\n`
      output += `Counts: {${Array.from(memory.entries()).map(([p, {count}]) => `${p}:${count}`).join(', ')}}\n\n`
    }
    
    return {
      pageFaults,
      finalMemory: Array.from(memory.keys()),
      steps: output
    }
  }

  const validateInputs = () => {
    if (!pageSequence.trim()) {
      setInputError("Page sequence cannot be empty")
      return false
    }
    
    const pages = pageSequence.trim().split(',')
    if (pages.some(p => isNaN(Number(p.trim())))) {
      setInputError("Page sequence must contain only numbers separated by commas")
      return false
    }
    
    if (isNaN(frameCount) || frameCount < 1 || frameCount > 10) {
      setInputError("Frame count must be between 1 and 10")
      return false
    }
    
    setInputError("")
    return true
  }

  const runCode = (algorithmName: string) => {
    if (!validateInputs()) return
    
    setIsRunning(prev => ({...prev, [algorithmName]: true}))
    setTerminalOutput(prev => ({
      ...prev, 
      [algorithmName]: `$ Preparing ${algorithmName} simulation...\n`
    }))

    const pages = pageSequence.trim().split(',').map(Number)
    const frames = Number(frameCount)

    setTimeout(() => {
      setTerminalOutput(prev => ({
        ...prev,
        [algorithmName]: prev[algorithmName] + `$ Page reference sequence: ${pages.join(", ")}\n` +
                        `$ Number of frames: ${frames}\n` +
                        `$ Running simulation...\n\n`
      }))
    }, 300)

    setTimeout(() => {
      let result: {pageFaults: number, finalMemory: number[], steps: string}
      
      switch(algorithmName) {
        case "FIFO":
          result = fifoAlgorithm(pages, frames)
          break
        case "LRU":
          result = lruAlgorithm(pages, frames)
          break
        case "Optimal":
          result = optimalAlgorithm(pages, frames)
          break
        case "Clock":
          result = clockAlgorithm(pages, frames)
          break
        case "LFU":
          result = lfuAlgorithm(pages, frames)
          break
        default:
          result = {pageFaults: 0, finalMemory: [], steps: ""}
      }
      
      const output = result.steps +
                    `Simulation complete.\n` +
                    `Total page faults: ${result.pageFaults}\n` +
                    `Final memory state: [${result.finalMemory.join(", ")}]\n\n` +
                    `$ Ready for next command.`

      setTerminalOutput(prev => ({
        ...prev, 
        [algorithmName]: prev[algorithmName] + output
      }))
      setIsRunning(prev => ({...prev, [algorithmName]: false}))
    }, 500)
  }

  return (
    <Card>
      <CardHeader className="bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 rounded-t-xl shadow-md backdrop-blur-sm">
  <div className="flex justify-between items-start p-2">
    <div className="space-y-1">
      <CardTitle className="text-white text-lg flex items-center gap-2">
        <BookOpenCheck className="w-5 h-5 text-yellow-200" />
        Educational Resources
      </CardTitle>
      <CardDescription className="text-white/80 text-sm">
        Learn about virtual memory management and page replacement algorithms
      </CardDescription>
    </div>
  </div>
</CardHeader>

      <CardContent>
        <Tabs defaultValue="concepts" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="concepts">Key Concepts</TabsTrigger>
            <TabsTrigger value="algorithms">Algorithms</TabsTrigger>
            {/* <TabsTrigger value="quiz">Quiz</TabsTrigger> */}
          </TabsList>

  <TabsContent value="concepts" className="space-y-6">
  <div className="prose max-w-none">
    <h3 className="text-2xl font-bold mb-6">Virtual Memory Key Concepts</h3>
    
    <div className="space-y-8">
      {/* Question 1 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Q1. What is Virtual Memory and why is it important?
        </h4>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            Virtual memory is a memory management technique that creates an illusion of a much larger memory space than what is physically available. It allows programs to execute as if they have access to a large, contiguous memory space, even though the actual physical memory might be limited.
          </p>
          <p className="font-medium text-gray-800 dark:text-gray-200">Key benefits:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>Enables running larger applications than physical memory</li>
            <li>Provides memory protection between processes</li>
            <li>Allows efficient sharing of memory between processes</li>
            <li>Simplifies programming by abstracting physical memory constraints</li>
            <li>Supports demand paging (loading pages only when needed)</li>
          </ul>
        </div>
      </div>

      {/* Question 2 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Q2. Explain the difference between paging and segmentation
        </h4>
        <div className="space-y-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Paging:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Divides memory into fixed-size blocks (pages/frames)</li>
                <li>Eliminates external fragmentation</li>
                <li>Uses page tables for address translation</li>
                <li>Simplifies memory allocation</li>
                <li>Less natural for programmers</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">Segmentation:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Divides memory into variable-sized blocks (segments)</li>
                <li>Matches program's logical structure</li>
                <li>Uses segment tables for address translation</li>
                <li>Can suffer from external fragmentation</li>
                <li>More natural for programmers</li>
              </ul>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            Many modern systems use <span className="font-semibold">segmented paging</span>, which combines both approaches by dividing segments into pages.
          </p>
        </div>
      </div>

      {/* Question 3 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Q3. What causes page faults and how does the OS handle them?
        </h4>
        <div className="space-y-2">
          <p className="font-medium text-gray-800 dark:text-gray-200">Page faults occur when:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>A program accesses a page not currently in physical memory</li>
            <li>The page was swapped out to disk (page file/swap space)</li>
            <li>The access violates memory protection (segmentation fault)</li>
            <li>The page was never loaded into memory</li>
          </ul>
          
          <p className="font-medium text-gray-800 dark:text-gray-200 mt-3">OS handling process:</p>
          <ol className="list-decimal pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>CPU generates a page fault trap</li>
            <li>OS checks if the reference is valid</li>
            <li>If invalid, terminates the process</li>
            <li>If valid, finds a free frame or selects a victim frame</li>
            <li>Loads the required page from disk</li>
            <li>Updates page tables</li>
            <li>Restarts the interrupted instruction</li>
          </ol>
        </div>
      </div>

      {/* Question 4 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Q4. What is the working set model and why is it important?
        </h4>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            The working set model defines the set of pages a process is actively using at any given time. Formally, the working set W(t, Δ) at time t for a window size Δ is the set of pages referenced in the time interval (t-Δ, t].
          </p>
          
          <p className="font-medium text-gray-800 dark:text-gray-200 mt-3">Importance:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>Prevents thrashing by ensuring each process has enough frames</li>
            <li>Provides a principle for memory allocation decisions</li>
            <li>Helps determine which pages to keep in memory</li>
            <li>Used in various page replacement algorithms</li>
            <li>Helps optimize system performance</li>
          </ul>
        </div>
      </div>

      {/* Question 5 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Q5. What is the Translation Lookaside Buffer (TLB) and how does it work?
        </h4>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            The TLB is a special cache that stores recent virtual-to-physical address translations to speed up memory access. It acts as a cache for the page table.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">TLB Operation:</p>
              <ol className="list-decimal pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                <li>CPU generates virtual address</li>
                <li>TLB checked for translation (hit/miss)</li>
                <li>On hit: Physical address used immediately</li>
                <li>On miss: Page table walk performed</li>
                <li>New translation added to TLB</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-200">TLB Characteristics:</p>
              <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                <li>Typically fully associative cache</li>
                <li>Small (64-1024 entries)</li>
                <li>Extremely fast (1-2 cycle access)</li>
                <li>Uses LRU or random replacement</li>
                <li>Flushed on context switches</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Question 6 */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h4 className="text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
          Q6. What is thrashing and how can it be prevented?
        </h4>
        <div className="space-y-2">
          <p className="text-gray-700 dark:text-gray-300">
            Thrashing occurs when a system spends more time handling page faults than executing process code, leading to severe performance degradation.
          </p>
          
          <p className="font-medium text-gray-800 dark:text-gray-200 mt-3">Causes:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>Too many processes competing for memory</li>
            <li>Process working sets exceed available memory</li>
            <li>Poor page replacement algorithm</li>
            <li>Insufficient physical memory</li>
          </ul>
          
          <p className="font-medium text-gray-800 dark:text-gray-200 mt-3">Prevention:</p>
          <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
            <li>Use working set model for memory allocation</li>
            <li>Implement page fault frequency monitoring</li>
            <li>Adjust multiprogramming level</li>
            <li>Use better page replacement algorithms</li>
            <li>Add more physical memory</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</TabsContent>
          <TabsContent value="algorithms" className="space-y-8">
            <div className="prose max-w-none">
              <h3>Page Replacement Algorithms</h3>

              <div className="mb-6 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="pageSequence">Page Reference Sequence</Label>
                    <Input
                      id="pageSequence"
                      value={pageSequence}
                      onChange={(e) => setPageSequence(e.target.value)}
                      placeholder="e.g. 7,0,1,2,0,3,0,4,2,3,0,3,2,1,2,0,1,7,0,1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Comma-separated numbers representing page references
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="frameCount">Number of Frames</Label>
                    <Input
                      id="frameCount"
                      type="number"
                      min="1"
                      max="10"
                      value={frameCount}
                      onChange={(e) => setFrameCount(Number(e.target.value))}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Between 1 and 10 frames
                    </p>
                  </div>
                </div>
                {inputError && (
                  <div className="text-red-500 text-sm mb-4">{inputError}</div>
                )}
              </div>
              {/* FIFO Algorithm Section */}
              <div className="mb-12">
                <h4>1. First-In-First-Out (FIFO)</h4>
                <p>
                  The FIFO algorithm selects the page that has been in memory the longest for replacement. It maintains a queue of pages in memory, replacing the page at the head of the queue when needed and adding new pages to the tail.
                </p>
                <p>
                  <strong>Advantages:</strong> Simple to implement, low overhead<br />
                  <strong>Disadvantages:</strong> Suffers from Belady's anomaly, poor performance in many cases<br />
                  <strong>Belady's Anomaly:</strong> The phenomenon where increasing the number of page frames can lead to more page faults for certain access patterns
                </p>
                
                <div className="my-4">
                  <button
                    onClick={() => runCode("FIFO")}
                    disabled={isRunning["FIFO"]}
                    className={`px-4 py-2 rounded-md ${isRunning["FIFO"] ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {isRunning["FIFO"] ? "Running..." : "Run FIFO Simulation"}
                  </button>
                </div>
                
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                  <pre>{terminalOutput["FIFO"] || "$ Ready to run FIFO simulation. Enter parameters above and click 'Run'."}</pre>
                </div>
                
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-md mt-4 overflow-x-auto">
                  {`// FIFO Implementation in C++
#include <iostream>
#include <queue>
#include <unordered_set>
using namespace std;

int fifo(const vector<int>& pages, int frameCount) {
    unordered_set<int> memory;
    queue<int> fifoQueue;
    int pageFaults = 0;

    for (int page : pages) {
        if (memory.find(page) == memory.end()) {
            pageFaults++;
            if (memory.size() >= frameCount) {
                int oldest = fifoQueue.front();
                fifoQueue.pop();
                memory.erase(oldest);
            }
            memory.insert(page);
            fifoQueue.push(page);
        }
    }
    return pageFaults;
}`}
                </pre>
              </div>

              {/* LRU Algorithm Section */}
              <div className="mb-12">
                <h4>2. Least Recently Used (LRU)</h4>
                <p>
                  LRU replaces the page that hasn't been used for the longest period of time. It's based on the principle of locality - pages that have been used recently are likely to be used again soon.
                </p>
                <p>
                  <strong>Advantages:</strong> Good performance in practice, no Belady's anomaly<br />
                  <strong>Disadvantages:</strong> Higher implementation overhead, requires tracking usage<br />
                  <strong>Implementation Approaches:</strong> Counters (timestamp), stack, or special hardware support
                </p>
                
                <div className="my-4">
                  <button
                    onClick={() => runCode("LRU")}
                    disabled={isRunning["LRU"]}
                    className={`px-4 py-2 rounded-md ${isRunning["LRU"] ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {isRunning["LRU"] ? "Running..." : "Run LRU Simulation"}
                  </button>
                </div>
                
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                  <pre>{terminalOutput["LRU"] || "$ Ready to run LRU simulation. Enter parameters above and click 'Run'."}</pre>
                </div>
                
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-md mt-4 overflow-x-auto">
                  {`// LRU Implementation in C++
#include <iostream>
#include <list>
#include <unordered_map>
using namespace std;

int lru(const vector<int>& pages, int frameCount) {
    list<int> lruList;
    unordered_map<int, list<int>::iterator> pageMap;
    int pageFaults = 0;

    for (int page : pages) {
        if (pageMap.find(page) == pageMap.end()) {
            pageFaults++;
            if (lruList.size() == frameCount) {
                int last = lruList.back();
                lruList.pop_back();
                pageMap.erase(last);
            }
        } else {
            lruList.erase(pageMap[page]);
        }
        lruList.push_front(page);
        pageMap[page] = lruList.begin();
    }
    return pageFaults;
}`}
                </pre>
              </div>

              {/* Optimal Algorithm Section */}
              <div className="mb-12">
                <h4>3. Optimal Page Replacement</h4>
                <p>
                  The Optimal algorithm replaces the page that will not be used for the longest time in the future. It serves as a theoretical benchmark since it requires knowledge of future page references.
                </p>
                <p>
                  <strong>Advantages:</strong> Provides the lowest possible page fault rate for a fixed number of frames<br />
                  <strong>Disadvantages:</strong> Not implementable in practice (requires future knowledge)<br />
                  <strong>Usefulness:</strong> Used as a comparison metric for other algorithms
                </p>
                
                <div className="my-4">
                  <button
                    onClick={() => runCode("Optimal")}
                    disabled={isRunning["Optimal"]}
                    className={`px-4 py-2 rounded-md ${isRunning["Optimal"] ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {isRunning["Optimal"] ? "Running..." : "Run Optimal Simulation"}
                  </button>
                </div>
                
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                  <pre>{terminalOutput["Optimal"] || "$ Ready to run Optimal simulation. Enter parameters above and click 'Run'."}</pre>
                </div>
                
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-md mt-4 overflow-x-auto">
                  {`// Optimal Implementation in C++
#include <iostream>
#include <vector>
#include <unordered_set>
#include <climits>
using namespace std;

int optimal(const vector<int>& pages, int frameCount) {
    unordered_set<int> memory;
    int pageFaults = 0;

    for (int i = 0; i < pages.size(); i++) {
        if (memory.find(pages[i]) == memory.end()) {
            pageFaults++;
            if (memory.size() >= frameCount) {
                int farthest = -1, replace = -1;
                for (int page : memory) {
                    int j;
                    for (j = i + 1; j < pages.size(); j++) {
                        if (pages[j] == page) break;
                    }
                    if (j == pages.size()) {
                        replace = page;
                        break;
                    }
                    if (j > farthest) {
                        farthest = j;
                        replace = page;
                    }
                }
                memory.erase(replace);
            }
            memory.insert(pages[i]);
        }
    }
    return pageFaults;
}`}
                </pre>
              </div>

              {/* Clock Algorithm Section */}
              <div className="mb-12">
                <h4>4. Clock (Second Chance) Algorithm</h4>
                <p>
                  The Clock algorithm is an approximation of LRU that uses a circular list and a reference bit. Each page has a reference bit that is set when the page is accessed. The algorithm scans pages like a clock hand, giving pages a second chance if their reference bit is set.
                </p>
                <p>
                  <strong>Advantages:</strong> More efficient than true LRU implementation, reasonable performance<br />
                  <strong>Disadvantages:</strong> Not as accurate as true LRU<br />
                  <strong>Variations:</strong> Enhanced Clock algorithm (uses both reference and modify bits)
                </p>
                
                <div className="my-4">
                  <button
                    onClick={() => runCode("Clock")}
                    disabled={isRunning["Clock"]}
                    className={`px-4 py-2 rounded-md ${isRunning["Clock"] ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {isRunning["Clock"] ? "Running..." : "Run Clock Simulation"}
                  </button>
                </div>
                
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                  <pre>{terminalOutput["Clock"] || "$ Ready to run Clock simulation. Enter parameters above and click 'Run'."}</pre>
                </div>
                
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-md mt-4 overflow-x-auto">
                  {`// Clock Implementation in C++
#include <iostream>
#include <vector>
#include <unordered_map>
using namespace std;

struct PageEntry {
    int page;
    bool reference;
};

int clock(const vector<int>& pages, int frameCount) {
    vector<PageEntry> memory;
    unordered_map<int, int> pageToIndex;
    int pointer = 0;
    int pageFaults = 0;

    for (int page : pages) {
        if (pageToIndex.find(page) != pageToIndex.end()) {
            memory[pageToIndex[page]].reference = true;
        } else {
            pageFaults++;
            if (memory.size() < frameCount) {
                memory.push_back({page, true});
                pageToIndex[page] = memory.size() - 1;
            } else {
                while (true) {
                    if (!memory[pointer].reference) {
                        pageToIndex.erase(memory[pointer].page);
                        memory[pointer] = {page, true};
                        pageToIndex[page] = pointer;
                        pointer = (pointer + 1) % frameCount;
                        break;
                    } else {
                        memory[pointer].reference = false;
                        pointer = (pointer + 1) % frameCount;
                    }
                }
            }
        }
    }
    return pageFaults;
}`}
                </pre>
              </div>

              {/* LFU Algorithm Section */}
              <div className="mb-12">
                <h4>5. Least Frequently Used (LFU)</h4>
                <p>
                  LFU replaces the page that has been used the least often. It maintains a count of how often each page has been referenced.
                </p>
                <p>
                  <strong>Advantages:</strong> Good for workloads with stable access patterns<br />
                  <strong>Disadvantages:</strong> Doesn't adapt well to changing access patterns, overhead of maintaining counts<br />
                  <strong>Variations:</strong> Aging LFU (weights recent references more heavily)
                </p>
                
                <div className="my-4">
                  <button
                    onClick={() => runCode("LFU")}
                    disabled={isRunning["LFU"]}
                    className={`px-4 py-2 rounded-md ${isRunning["LFU"] ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    {isRunning["LFU"] ? "Running..." : "Run LFU Simulation"}
                  </button>
                </div>
                
                <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm h-64 overflow-y-auto">
                  <pre>{terminalOutput["LFU"] || "$ Ready to run LFU simulation. Enter parameters above and click 'Run'."}</pre>
                </div>
                
                <pre className="bg-gray-800 text-gray-100 p-4 rounded-md mt-4 overflow-x-auto">
                  {`// LFU Implementation in C++
#include <iostream>
#include <vector>
#include <unordered_map>
#include <set>
using namespace std;

struct PageInfo {
    int page;
    int frequency;
    int time;
};

struct Compare {
    bool operator()(const PageInfo& a, const PageInfo& b) const {
        if (a.frequency == b.frequency) return a.time < b.time;
        return a.frequency < b.frequency;
    }
};

int lfu(const vector<int>& pages, int frameCount) {
    unordered_map<int, PageInfo> pageMap;
    set<PageInfo, Compare> lfuSet;
    int time = 0;
    int pageFaults = 0;

    for (int page : pages) {
        if (pageMap.find(page) != pageMap.end()) {
            lfuSet.erase(pageMap[page]);
            pageMap[page].frequency++;
            pageMap[page].time = time++;
            lfuSet.insert(pageMap[page]);
        } else {
            pageFaults++;
            if (pageMap.size() >= frameCount) {
                PageInfo victim = *lfuSet.begin();
                lfuSet.erase(victim);
                pageMap.erase(victim.page);
            }
            PageInfo newPage = {page, 1, time++};
            pageMap[page] = newPage;
            lfuSet.insert(newPage);
        }
    }
    return pageFaults;
}`}
                </pre>
              </div>
            </div>
          </TabsContent>

          {/* Previous advanced tab remains the same */}
          
        </Tabs>
      </CardContent>
    </Card>
  )
}