"use client";

import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Info } from "lucide-react";
import HardwareMonitor from "@/components/hardware-monitor/page";

interface SystemInfo {
  biosVersion: string;
  cpu: string;
  memory: string;
  storage: string;
  bootMode: string;
  graphics: string;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-400">{label}</span>
      <span>{value}</span>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  CircleAlert,
  Cpu,
  MemoryStickIcon as Memory,
  HardDrive,
  Thermometer,
  Zap,
  Battery,
  Wifi,
  NetworkIcon as Ethernet,
  Keyboard,
} from "lucide-react";

// Performance profiles
const performanceProfiles = {
  quiet: {
    name: "Quiet",
    theme: "green",
    fanSpeed: 25,
    cpuMultiplier: 0.6,
    colors: {
      primary: "text-green-400",
      bg: "bg-green-950/20",
      border: "border-green-800",
    },
  },
  balanced: {
    name: "Balanced",
    theme: "blue",
    fanSpeed: 50,
    cpuMultiplier: 1.0,
    colors: {
      primary: "text-blue-400",
      bg: "bg-blue-950/20",
      border: "border-blue-800",
    },
  },
  turbo: {
    name: "Turbo",
    theme: "red",
    fanSpeed: 85,
    cpuMultiplier: 1.4,
    colors: {
      primary: "text-red-400",
      bg: "bg-red-950/20",
      border: "border-red-800",
    },
  },
};

const generateTimeData = (points: number, multiplier = 1) => {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: Math.floor((Math.random() * 40 + 20) * multiplier),
  }));
};

export default function BiosSimulator() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [bootProgress, setBootProgress] = useState(0);
  const [bootStage, setBootStage] = useState("Initializing hardware...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentProfile, setCurrentProfile] =
    useState<keyof typeof performanceProfiles>("balanced");
  const [powerMode, setPowerMode] = useState("balanced");
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseButtons, setMouseButtons] = useState<Set<number>>(new Set());
  const profile = performanceProfiles[currentProfile];

  const [info, setInfo] = useState<SystemInfo | null>(null);
  useEffect(() => {
    fetch("/api/system-info")
      .then((res) => res.json())
      .then((data) => setInfo(data))
      .catch((err) => console.error("Error fetching system info:", err));
  }, []);

  // Generate CPU data based on current profile
  const [cpuData, setCpuData] = useState(() =>
    generateTimeData(20, performanceProfiles[currentProfile].cpuMultiplier)
  );
  const [ramData] = useState(() => generateTimeData(20));
  const [tempData] = useState(() => generateTimeData(20));

  // Load saved profile from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("biosProfile");
    if (saved && saved in performanceProfiles) {
      setCurrentProfile(saved as keyof typeof performanceProfiles);
    }
  }, []);

  // Update CPU data when profile changes
  useEffect(() => {
    setCpuData(
      generateTimeData(20, performanceProfiles[currentProfile].cpuMultiplier)
    );
    localStorage.setItem("biosProfile", currentProfile);
  }, [currentProfile]);

  // Uptime counter
  useEffect(() => {
    const interval = setInterval(() => {
      setUptime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Battery simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setBatteryLevel((prev) => {
        if (isCharging) {
          return Math.min(100, prev + 0.1);
        } else {
          return Math.max(0, prev - 0.05);
        }
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isCharging]);

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
              <h2 className="text-lg font-medium mb-2">System Information</h2>
              <div className="space-y-2 text-sm">
                {info ? (
                  <>
                    <InfoRow label="BIOS Version" value={info.biosVersion} />
                    <InfoRow label="CPU" value={info.cpu} />
                    <InfoRow label="GPU" value={info.graphics} />
                    <InfoRow label="Memory" value={info.memory} />
                    <InfoRow label="Storage" value={info.storage} />
                    <InfoRow label="Boot Mode" value={info.bootMode} />
                    <div className="flex justify-between">
                      <span className="text-gray-400">Performance Profile</span>

                      <Badge
                        className={`${profile.colors.bg} ${profile.colors.primary} ${profile.colors.border}`}
                      >
                        {profile.name}
                      </Badge>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-400">Loading...</p>
                )}
              </div>
            </Card>

            <Card className="border-gray-800 bg-gray-900/50 p-4">
              <h2 className="text-lg font-medium mb-2">Boot Status</h2>
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
              <p className="text-green-400">
                [00:00:09] GPU: {info?.graphics} detected
              </p>
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

          <Card className="border-gray-800 bg-gray-900/50 p-4">
            <h2 className="text-lg font-medium mb-3">Performance Profiles</h2>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(performanceProfiles).map(([key, prof]) => (
                <Card
                  key={key}
                  className={`p-4 cursor-pointer transition-all ${
                    currentProfile === key
                      ? `${prof.colors.border} ${prof.colors.bg}`
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                  onClick={() =>
                    setCurrentProfile(key as keyof typeof performanceProfiles)
                  }
                >
                  <div className="text-center">
                    <h3
                      className={`font-medium ${
                        currentProfile === key
                          ? prof.colors.primary
                          : "text-white"
                      }`}
                    >
                      {prof.name}
                    </h3>
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Fan Speed:</span>
                        <span>{prof.fanSpeed}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">CPU Boost:</span>
                        <span>{Math.round(prof.cpuMultiplier * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Hardware Monitor Tab */}
        <HardwareMonitor />
      </Tabs>

      {/* Footer */}
      <div className="mt-4 border-t border-gray-800 pt-2 text-xs text-gray-500 flex justify-between">
        <div>BIOSage v1.0 | Build Date: 05/31/2025</div>
      </div>
    </div>
  );
}
