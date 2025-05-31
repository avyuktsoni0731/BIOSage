"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "@/components/ui/chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  ChevronRight,
  AlertCircle,
  Info,
  Cpu,
  MemoryStickIcon as Memory,
  HardDrive,
  Thermometer,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const generateTimeData = (points: number) => {
  return Array.from({ length: points }, (_, i) => ({
    time: i,
    value: Math.floor(Math.random() * 60) + 20,
  }));
};

const cpuData = generateTimeData(20);
const ramData = generateTimeData(20);
const tempData = generateTimeData(20);

export default function HardwareMonitor() {
  return (
    <>
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
    </>
  );
}
