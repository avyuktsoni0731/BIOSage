"use client";

import { useState, useEffect, useRef,useCallback  } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BIOS_ERRORS } from "@/lib/bios-errors";
import { AlertCircle, Info, Loader2 } from "lucide-react";
import HardwareMonitor from "@/components/hardware-monitor/page";
import AdvancedFeatures from "@/components/advanced-features/page";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
interface SystemInfo {
  biosVersion: string;
  cpu: string;
  memory: string;
  storage: string;
  bootMode: string;
  graphics: string;
}

interface DiagnosticResponse {
  // generated_text: string;
  response: string;
  // usage?: {
  //   prompt_tokens: number | string;
  //   generated_tokens: number | string;
  // };
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [powerMode, setPowerMode] = useState("balanced");
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [language, setLanguage] = useState<"hindi" | "english" | "russian">("english");
  const [mouseButtons, setMouseButtons] = useState<Set<number>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [llmStatus, setLlmStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");

  const [info, setInfo] = useState<SystemInfo | null>(null);
  useEffect(() => {
    fetch("/api/system-info")
      .then((res) => res.json())
      .then((data) => setInfo(data))
      .catch((err) => console.error("Error fetching system info:", err));

    // Check LLM status
    checkLlmStatus();
  }, []);

  // Check LLM service status
  const checkLlmStatus = async () => {
    try {
      const response = await fetch("/api/llm-status");
      const data = await response;
      // const data = await response.json();
      // console.log("LLM Status Response:", data);
      if (data.status === 200) {
        setLlmStatus("ready");
      } else if (data.status !== 200) {
        setLlmStatus("loading");
      } else {
        setLlmStatus("error");
      }
    } catch (err) {
      setLlmStatus("error");
      console.error("Error checking LLM status:", err);
    }
  };

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

          // Randomly show an error between 60-80% progress
          if (newProgress >= 60 && newProgress <= 80 && !errorMessage) {
            const randomError =
              BIOS_ERRORS[Math.floor(Math.random() * BIOS_ERRORS.length)];
            setErrorMessage(randomError.error);
          }

          return newProgress;
        });
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [bootProgress]);

  const analyzeError = useCallback(async () => {
    if (!errorMessage) return;

    setIsAnalyzing(true);
    try {
      const prompt = `${errorMessage} (tell me what this error means, and how to fix it under 100 words, STRICTLY in ${language} language. Do NOT use any kind of markdown formatting, just plain text, or bullet points if needed)`;

      const response = await fetch("/api/llm-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          model: "llama3.2",
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze error");
      }

      const data: DiagnosticResponse = await response.json();
      setDiagnosticResult(data.response);
    } catch (error) {
      console.error("Error analysis failed:", error);
      setDiagnosticResult(
        "Failed to analyze error. Please check the LLM service status."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }, [errorMessage, language]);
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          if (e.shiftKey) {
            setActiveTab((prev) =>
              prev === "dashboard"
                ? "advanced"
                : prev === "advanced"
                  ? "hardware"
                  : "dashboard"
            );
          } else {
            setActiveTab((prev) =>
              prev === "dashboard"
                ? "hardware"
                : prev === "hardware"
                  ? "advanced"
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
          if (errorMessage) {
            analyzeError(); // Now uses the latest version with current language
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
  }, [errorMessage, diagnosticResult, analyzeError]);

 

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
      {/* <div className="flex justify-between items-center mb-4">
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
      </div> */}

      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">BIOSage v2.0</h1>
          <div className="flex items-center gap-2 mt-1 text-xs">
            <span className="text-gray-400">LLM Service:</span>
            <Badge
              variant="outline"
              className={
                llmStatus === "ready"
                  ? "bg-green-950/30 text-green-400 border-green-800"
                  : llmStatus === "loading"
                    ? "bg-yellow-950/30 text-yellow-400 border-yellow-800"
                    : "bg-red-950/30 text-red-400 border-red-800"
              }
            >
              {llmStatus === "ready"
                ? "Ready"
                : llmStatus === "loading"
                  ? "Loading"
                  : "Unavailable"}
            </Badge>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <div className="text-sm">
            <p className="text-gray-400">
              BOOT STAGE: <span className="text-white">{bootStage}</span>
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Progress value={bootProgress} className="w-40 h-2" />
              <span className="text-xs">{bootProgress}%</span>
            </div>
          </div>
          <Select
            value={language}
            onValueChange={(value: "hindi" | "english" | "russian") => setLanguage(value)}
          > 
            <SelectTrigger className="w-28 h-8 text-xs bg-gray-900 border-gray-800">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border border-gray-800 text-white">
              <SelectItem
                value="english"
                className="text-xs text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                English
              </SelectItem>
              <SelectItem
                value="hindi"
                className="text-xs text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                Hindi
              </SelectItem>
              <SelectItem
                value="russian"
                className="text-xs text-white hover:bg-gray-700 focus:bg-gray-700"
              >
                Russian
              </SelectItem>
            </SelectContent>
          </Select>
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
                  analyze error {isAnalyzing && "(Analyzing...)"}
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
              <div className="text-sm mt-1 whitespace-pre-line">
                {diagnosticResult.split("\n").map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Loading Indicator */}
      {isAnalyzing && (
        <Card className="mb-4 border-yellow-900 bg-yellow-950/20 p-3">
          <div className="flex items-center gap-3">
            <Loader2 className="text-yellow-500 animate-spin" size={18} />
            <span className="text-yellow-400">Analyzing error with LLM...</span>
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
            value="advanced"
            className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
          >
            Advanced Features
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
              <p className="text-red-400">[00:00:15] {errorMessage}</p>
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
        <HardwareMonitor />

        {/* Advanced Features Tab */}
        <AdvancedFeatures />
      </Tabs>

      {/* Footer */}
      <div className="mt-4 border-t border-gray-800 pt-2 text-xs text-gray-500 flex justify-between">
        <div>BIOSage v1.0 | Build Date: 05/31/2025</div>
      </div>
    </div>
  );
}
