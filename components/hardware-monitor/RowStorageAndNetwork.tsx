"use client";

import { Card } from "@/components/ui/card";
import { Monitor, Wifi,HardDrive } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, AreaChart, XAxis, YAxis, Tooltip, Area, LineChart, Line } from "recharts";
type StorageMetrics = {
  storage: {
    name: string;
    size: number;
    usagePercent: number;
  }[];
};
interface TimeSeriesData {
  time: number;
  value: number;
}
interface SystemMetrics {
  cpu: {
    usage: number;
    temperature: number;
  };
  memory: {
    usagePercent: number;
    usedGB: string;
    totalGB: string;
  };
  gpu: {
    usage: number | null;
    memoryUsed: string | null;
    memoryTotal: string | null;
  };
  network: {
    downloadSpeed: number | null;
    uploadSpeed: number | null;
    interface: string | null;
  };
  disk: {
    readSpeed: number | null;
    writeSpeed: number | null;
  };
  power: {
    hasBattery: boolean;
    percent: number | null;
    isCharging: boolean | null;
  } | null;
  temperatures: {
    cpu: number | null;
    gpu: number | null;
  };
  storage: Array<{
    name: string;
    size: number;
    used: number;
    usagePercent: number;
    type: string;
  }>;
}
interface NetworkData {
  time: number;
  upload: number;
  download: number;
}
interface Props {
  metrics: SystemMetrics;
  gpuData: TimeSeriesData[];
  networkData: NetworkData[];
}

export default function RowGPUAndNetwork({ metrics, gpuData, networkData }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-gray-800 bg-gray-900/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <HardDrive size={18} className="text-green-400" />
                  <h2 className="text-lg font-medium">Storage Status</h2>
                </div>
                <div className="space-y-3">
                  {metrics.storage.slice(0, 3).map((storage, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>
                          {storage.name} ({(storage.size / 1e12).toFixed(1)}TB)
                        </span>
                        <span>{storage.usagePercent}% used</span>
                      </div>
                      <Progress value={storage.usagePercent} className="h-1" />
                    </div>
                  ))}
                </div>
              </Card>

      {metrics.network.downloadSpeed !== null && metrics.network.uploadSpeed !== null && (
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Wifi size={18} className="text-cyan-400" />
            <h2 className="text-lg font-medium">Network Activity</h2>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={networkData}>
                <XAxis dataKey="time" tick={false} axisLine={{ stroke: 'transparent' }} />
                <YAxis tick={false} axisLine={{ stroke: 'transparent' }} />
                <Tooltip content={({ active, payload }) =>
                  active && payload?.length ? (
                    <div className="bg-gray-800 border border-gray-700 p-2 text-xs rounded">
                      <div>Download: {payload[1]?.value || 0} Mbps</div>
                      <div>Upload: {payload[0]?.value || 0} Mbps</div>
                    </div>
                  ) : null
                } />
                <Line type="monotone" dataKey="upload" stroke="#06b6d4" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="download" stroke="#0891b2" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-cyan-400">↓ {metrics.network.downloadSpeed} Mbps</span>
            <span className="text-cyan-300">↑ {metrics.network.uploadSpeed} Mbps</span>
          </div>
        </Card>
      )}
    </div>
  );
}
