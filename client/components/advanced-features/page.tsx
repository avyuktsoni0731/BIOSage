"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Wifi,
  NetworkIcon as Ethernet,
  Cpu,
  MemoryStickIcon as Memory,
  HardDrive,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface NetworkInterface {
  iface: string;
  type: string;
  mac: string;
  ip4: string;
  ip6?: string;
  speed: number;
  dhcp: boolean;
  rx_sec: number;
  tx_sec: number;
  gateway?: string;
}

interface SystemInfo {
  biosVersion: string;
  cpu: string;
  memory: string;
  storage: string;
  bootMode: string;
  graphics: string;
  network: NetworkInterface[];
  systemTime: string;
  gateway: string;
}

export default function AdvancedFeatures() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [uptime, setUptime] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchSystemInfo = async () => {
      try {
        const response = await fetch("/api/system-info");
        const data = await response.json();
        setSystemInfo(data);
      } catch (error) {
        console.error("Failed to fetch system info:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setUptime((prev) => prev + 1);
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getSignalStrength = (speed: number) => {
    if (speed <= 10) return "Weak";
    if (speed <= 50) return "Fair";
    if (speed <= 100) return "Good";
    return "Excellent";
  };

  if (loading) {
    return (
      <TabsContent value="advanced" className="space-y-4">
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex justify-center py-8">
            <div className="animate-pulse text-gray-400">
              Loading system information...
            </div>
          </div>
        </Card>
      </TabsContent>
    );
  }

  return (
    <TabsContent value="advanced" className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Network Interface Overview */}
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wifi size={18} className="text-blue-400" />
            <h2 className="text-lg font-medium">Network Interfaces</h2>
          </div>
          <div className="space-y-3">
            {systemInfo?.network?.map((intf) => (
              <div key={intf.iface}>
                <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                  <div className="flex items-center gap-2">
                    {intf.type === "wireless" ? (
                      <Wifi size={16} className="text-blue-400" />
                    ) : (
                      <Ethernet size={16} className="text-green-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium">
                        {intf.type === "wireless" ? "Wi-Fi" : "Ethernet"}
                      </div>
                      <div className="text-xs text-gray-400">{intf.iface}</div>
                    </div>
                  </div>
                  <Badge className="bg-green-950/30 text-green-400 border-green-800">
                    {intf.operstate === "up" ? "Connected" : "Disconnected"}
                  </Badge>
                </div>

                <div className="text-xs space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">MAC:</span>
                    <span>{intf.mac}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IPv4:</span>
                    <span>{intf.ip4}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Speed:</span>
                    <span>
                      {intf.type === "wireless"
                        ? `${getSignalStrength(intf.speed)} (${
                            intf.speed
                          } Mbps)`
                        : `${intf.speed} Mbps`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Traffic:</span>
                    <span>
                      ↓ {formatBytes(intf.rx_sec)}/s ↑{" "}
                      {formatBytes(intf.tx_sec)}/s
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-xs space-y-1 mt-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Default Gateway:</span>
                <span>{systemInfo?.gateway || "N/A"}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* System Overview */}
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Cpu size={18} className="text-purple-400" />
            <h2 className="text-lg font-medium">System Overview</h2>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm">
                  System Time: {currentTime.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-gray-400" />
                <span className="text-sm">Uptime: {formatUptime(uptime)}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Cpu size={14} className="text-gray-400" />
                <span>CPU: {systemInfo?.cpu}</span>
              </div>
              <div className="flex items-center gap-2">
                <Memory size={14} className="text-gray-400" />
                <span>Memory: {systemInfo?.memory}</span>
              </div>
              <div className="flex items-center gap-2">
                <HardDrive size={14} className="text-gray-400" />
                <span>Storage: {systemInfo?.storage}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">BIOS Version:</span>
                <span>{systemInfo?.biosVersion}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Boot Mode:</span>
                <span>{systemInfo?.bootMode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Graphics:</span>
                <span>{systemInfo?.graphics}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </TabsContent>
  );
}
