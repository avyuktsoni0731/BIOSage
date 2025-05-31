"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  AlertCircle,
  Info,
  Cpu,
  MemoryStickIcon as Memory,
  HardDrive,
  Thermometer,
} from "lucide-react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "@/components/ui/chart";

interface SystemInfo {
  biosVersion: string;
  cpu: string;
  memory: string;
  storage: string;
  bootMode: string;
}

// Generate sample data for charts
const generateTimeData = (points: number) => {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: Math.floor(Math.random() * 60) + 20,
  }));
};

const cpuData = generateTimeData(20);
const ramData = generateTimeData(20);
const tempData = generateTimeData(20);

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function BiosSimulator() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bootProgress, setBootProgress] = useState(0);
  const [bootStage, setBootStage] = useState("Initializing hardware...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState(0);
  const [focusedElement, setFocusedElement] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [info, setInfo] = useState<SystemInfo | null>(null);
  useEffect(() => {
    fetch("/api/system-info")
      .then((res) => res.json())
      .then((data) => setInfo(data))
      .catch((err) => console.error("Error fetching system info:", err));
  }, []);

  // Simulate boot process
  useEffect(() => {
    if (bootProgress < 100) {
      const timer = setTimeout(() => {
        setBootProgress((prev) => {
          const newProgress = prev + 5;

          // Set boot stages based on progress
          if (newProgress === 25) setBootStage("Loading BIOS modules...");
          if (newProgress === 50)
            setBootStage("Detecting hardware components...");
          if (newProgress === 75)
            setBootStage("Initializing system services...");
          if (newProgress === 100) setBootStage("System ready");

          // Simulate an error at 65%
          if (newProgress === 65) {
            setErrorMessage(
              "ERROR: Memory module in DIMM_A2 reporting inconsistent timings"
            );
          }

          return newProgress;
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [bootProgress]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            setActiveTab((prev) =>
              prev === "dashboard"
                ? "diagnostics"
                : prev === "diagnostics"
                ? "hardware"
                : "dashboard"
            );
          } else {
            setActiveTab((prev) =>
              prev === "dashboard"
                ? "hardware"
                : prev === "hardware"
                ? "diagnostics"
                : "dashboard"
            );
          }
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedItem((prev) => Math.max(0, prev - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedItem((prev) => Math.min(5, prev + 1));
          break;
        case "F1":
          e.preventDefault();
          if (errorMessage && !diagnosticResult) {
            analyzeError();
          }
          break;
        case "F5":
          e.preventDefault();
          resetSystem();
          break;
        case "Escape":
          e.preventDefault();
          setDiagnosticResult(null);
          setErrorMessage(null);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [errorMessage, diagnosticResult]);

  const analyzeError = () => {
    setDiagnosticResult(
      "DIAGNOSTIC RESULT: Memory module in DIMM_A2 has incorrect timing parameters. " +
        "The module is reporting CL16-18-18-36 but system expects CL16-18-18-38. " +
        "Recommended action: Update BIOS to latest version or manually adjust memory timings in BIOS setup."
    );
  };

  const resetSystem = () => {
    setBootProgress(0);
    setBootStage("Initializing hardware...");
    setErrorMessage(null);
    setDiagnosticResult(null);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black text-gray-200 p-4 font-mono"
      tabIndex={0}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">BIOSage v2.0</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">
            BOOT STAGE: <span className="text-white">{bootStage}</span>
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Progress value={bootProgress} className="w-40 h-2" />
            <span className="text-xs">{bootProgress}%</span>
          </div>
        </div>
      </div>

      {/* Keyboard Navigation Guide */}
      <div className="flex gap-4 mb-4 text-xs text-gray-500 border border-gray-800 bg-gray-900/50 p-2">
        <div>
          <kbd className="px-1 bg-gray-800 rounded">Tab</kbd> Switch Tabs
        </div>
        <div>
          <kbd className="px-1 bg-gray-800 rounded">↑/↓</kbd> Navigate
        </div>
        <div>
          <kbd className="px-1 bg-gray-800 rounded">F1</kbd> Analyze Error
        </div>
        <div>
          <kbd className="px-1 bg-gray-800 rounded">F5</kbd> Reset System
        </div>
        <div>
          <kbd className="px-1 bg-gray-800 rounded">ESC</kbd> Clear Messages
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <Card className="mb-4 border-red-900 bg-red-950/20 p-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={18} />
            <div className="flex-1">
              <p className="text-red-400 font-medium">{errorMessage}</p>
              {!diagnosticResult && (
                <p className="text-xs text-gray-400 mt-1">
                  Press <kbd className="px-1 bg-gray-800 rounded">F1</kbd> to
                  analyze error
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Diagnostic Result */}
      {diagnosticResult && (
        <Card className="mb-4 border-blue-900 bg-blue-950/20 p-3">
          <div className="flex items-start gap-3">
            <Info className="text-blue-500 mt-0.5" size={18} />
            <div>
              <p className="text-blue-400 font-medium">Diagnostic Complete</p>
              <p className="text-sm mt-1">{diagnosticResult}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Main Content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            System Dashboard
          </TabsTrigger>
          <TabsTrigger
            value="hardware"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Hardware Monitor
          </TabsTrigger>
          <TabsTrigger
            value="diagnostics"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Diagnostics
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-800 bg-gray-900/50 p-4">
              <h2 className="text-lg font-medium mb-3">System Information</h2>
              <div className="space-y-2 text-sm">
                {info ? (
                  <>
                    <InfoRow label="BIOS Version" value={info.biosVersion} />
                    <InfoRow label="CPU" value={info.cpu} />
                    <InfoRow label="Memory" value={info.memory} />
                    <InfoRow label="Storage" value={info.storage} />
                    <InfoRow label="Boot Mode" value={info.bootMode} />
                  </>
                ) : (
                  <p className="text-gray-400">Loading...</p>
                )}
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 p-4">
              <h2 className="text-lg font-medium mb-3">Boot Status</h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">POST</span>
                    <Badge
                      variant="outline"
                      className="bg-green-950/30 text-green-400 border-green-800"
                    >
                      Passed
                    </Badge>
                  </div>
                  <Progress value={100} className="h-1" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Memory Test</span>
                    <Badge
                      variant="outline"
                      className="bg-red-950/30 text-red-400 border-red-800"
                    >
                      Failed
                    </Badge>
                  </div>
                  <Progress value={65} className="h-1" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Storage Detection</span>
                    <Badge
                      variant="outline"
                      className="bg-green-950/30 text-green-400 border-green-800"
                    >
                      Passed
                    </Badge>
                  </div>
                  <Progress value={100} className="h-1" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Boot Device</span>
                    <Badge
                      variant="outline"
                      className="bg-blue-950/30 text-blue-400 border-blue-800"
                    >
                      Pending
                    </Badge>
                  </div>
                  <Progress value={0} className="h-1" />
                </div>
              </div>
            </Card>
          </div>

          <Card className="border-gray-800 bg-gray-900/50 p-4">
            <h2 className="text-lg font-medium mb-3">Boot Log</h2>
            <div className="bg-black/50 p-3 rounded text-sm font-mono h-40 overflow-y-auto">
              <p className="text-green-400">
                [00:00:01] Initializing system hardware
              </p>
              <p className="text-green-400">
                [00:00:02] CPU: {info?.cpu} detected
              </p>
              <p className="text-green-400">
                [00:00:03] Memory: {info?.memory} detected
              </p>
              <p className="text-green-400">
                [00:00:04] Storage: {info?.storage} detected
              </p>
              <p className="text-green-400">[00:00:05] Loading BIOS modules</p>
              <p className="text-green-400">
                [00:00:07] Initializing PCIe devices
              </p>
              {/* <p className="text-green-400">
                [00:00:09] GPU: NVIDIA RTX 4090 detected
              </p> */}
              {/* <p className="text-green-400">
                [00:00:11] Network: Intel AX211 detected
              </p> */}
              <p className="text-green-400">[00:00:13] Running memory tests</p>
              <p className="text-red-400">
                [00:00:15] ERROR: Memory module in DIMM_A2 reporting
                inconsistent timings
              </p>
              <p className="text-yellow-400">
                [00:00:16] WARNING: Memory running at reduced speed
              </p>
              <p className="text-green-400">
                [00:00:18] Storage detection complete
              </p>
              <p className="text-green-400">
                [00:00:20] Waiting for boot device selection
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* Hardware Monitor Tab */}
        <TabsContent value="hardware" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={18} className="text-blue-400" />
                <h2 className="text-lg font-medium">CPU Usage</h2>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cpuData}>
                    <XAxis dataKey="time" tick={false} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-gray-800 border border-gray-700 p-2 text-xs">
                              CPU: {payload[0].value}%
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-400">Current: 45%</span>
                <span className="text-gray-400">Max: 78%</span>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Memory size={18} className="text-purple-400" />
                <h2 className="text-lg font-medium">Memory Usage</h2>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ramData}>
                    <XAxis dataKey="time" tick={false} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-gray-800 border border-gray-700 p-2 text-xs">
                              RAM: {payload[0].value}%
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#a855f7"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-400">Used: 14.2 GB</span>
                <span className="text-gray-400">Total: 32 GB</span>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Thermometer size={18} className="text-red-400" />
                <h2 className="text-lg font-medium">Temperature</h2>
              </div>
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={tempData}>
                    <XAxis dataKey="time" tick={false} />
                    <YAxis domain={[20, 100]} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-gray-800 border border-gray-700 p-2 text-xs">
                              Temp: {payload[0].value}°C
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">CPU:</span>
                  <span>65°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">GPU:</span>
                  <span>58°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Motherboard:</span>
                  <span>42°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SSD:</span>
                  <span>39°C</span>
                </div>
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <HardDrive size={18} className="text-green-400" />
                <h2 className="text-lg font-medium">Storage Status</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>NVMe SSD (2TB)</span>
                    <span>42% used</span>
                  </div>
                  <Progress value={42} className="h-1" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>SATA SSD (1TB)</span>
                    <span>67% used</span>
                  </div>
                  <Progress value={67} className="h-1" />
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>HDD (4TB)</span>
                    <span>23% used</span>
                  </div>
                  <Progress value={23} className="h-1" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-sm font-medium mb-2">SMART Status</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">NVMe SSD:</span>
                    <Badge
                      variant="outline"
                      className="bg-green-950/30 text-green-400 border-green-800"
                    >
                      Good
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">SATA SSD:</span>
                    <Badge
                      variant="outline"
                      className="bg-green-950/30 text-green-400 border-green-800"
                    >
                      Good
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">HDD:</span>
                    <Badge
                      variant="outline"
                      className="bg-yellow-950/30 text-yellow-400 border-yellow-800"
                    >
                      Warning
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* Diagnostics Tab */}
        <TabsContent value="diagnostics" className="space-y-4">
          <Card className="border-gray-800 bg-gray-900/50 p-4">
            <h2 className="text-lg font-medium mb-3">System Diagnostics</h2>

            <div className="space-y-2">
              <div
                className={`flex items-center p-2 ${
                  selectedItem === 0 ? "bg-gray-800" : ""
                }`}
              >
                <ChevronRight
                  size={16}
                  className={
                    selectedItem === 0 ? "text-white" : "text-gray-500"
                  }
                />
                <span className="ml-2">Run Memory Test</span>
              </div>

              <div
                className={`flex items-center p-2 ${
                  selectedItem === 1 ? "bg-gray-800" : ""
                }`}
              >
                <ChevronRight
                  size={16}
                  className={
                    selectedItem === 1 ? "text-white" : "text-gray-500"
                  }
                />
                <span className="ml-2">Run CPU Stress Test</span>
              </div>

              <div
                className={`flex items-center p-2 ${
                  selectedItem === 2 ? "bg-gray-800" : ""
                }`}
              >
                <ChevronRight
                  size={16}
                  className={
                    selectedItem === 2 ? "text-white" : "text-gray-500"
                  }
                />
                <span className="ml-2">Check Storage Health</span>
              </div>

              <div
                className={`flex items-center p-2 ${
                  selectedItem === 3 ? "bg-gray-800" : ""
                }`}
              >
                <ChevronRight
                  size={16}
                  className={
                    selectedItem === 3 ? "text-white" : "text-gray-500"
                  }
                />
                <span className="ml-2">Analyze Boot Performance</span>
              </div>

              <div
                className={`flex items-center p-2 ${
                  selectedItem === 4 ? "bg-gray-800" : ""
                }`}
              >
                <ChevronRight
                  size={16}
                  className={
                    selectedItem === 4 ? "text-white" : "text-gray-500"
                  }
                />
                <span className="ml-2">Verify System Integrity</span>
              </div>

              <div
                className={`flex items-center p-2 ${
                  selectedItem === 5 ? "bg-gray-800" : ""
                }`}
              >
                <ChevronRight
                  size={16}
                  className={
                    selectedItem === 5 ? "text-white" : "text-gray-500"
                  }
                />
                <span className="ml-2">Export Diagnostic Report</span>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-400">
              Use <kbd className="px-1 bg-gray-800 rounded">↑/↓</kbd> to
              navigate and <kbd className="px-1 bg-gray-800 rounded">Enter</kbd>{" "}
              to select
            </div>
          </Card>

          <Card className="border-gray-800 bg-gray-900/50 p-4">
            <h2 className="text-lg font-medium mb-3">Error Log</h2>
            <div className="bg-black/50 p-3 rounded text-sm font-mono h-40 overflow-y-auto">
              <p className="text-red-400">
                [05/31/2025 15:45:22] ERROR: Memory module in DIMM_A2 reporting
                inconsistent timings
              </p>
              <p className="text-yellow-400">
                [05/31/2025 15:45:23] WARNING: Memory running at reduced speed
              </p>
              <p className="text-yellow-400">
                [05/30/2025 09:12:15] WARNING: HDD S.M.A.R.T. status degrading
                (Reallocated Sectors Count: 24)
              </p>
              <p className="text-red-400">
                [05/29/2025 22:34:01] ERROR: CPU temperature exceeded threshold
                (95°C)
              </p>
              <p className="text-yellow-400">
                [05/29/2025 22:34:05] WARNING: CPU throttling enabled due to
                thermal limits
              </p>
              <p className="text-red-400">
                [05/28/2025 14:22:33] ERROR: PCIe device in slot 2 failed to
                initialize
              </p>
              <p className="text-yellow-400">
                [05/27/2025 08:15:42] WARNING: CMOS battery low
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer */}
      <div className="mt-4 border-t border-gray-800 pt-2 text-xs text-gray-500 flex justify-between">
        <div>BIOSage v1.0 | Build Date: 05/31/2025</div>
      </div>
    </div>
  );
}
