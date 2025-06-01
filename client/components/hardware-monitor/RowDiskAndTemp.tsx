// RowDiskAndTemp.tsx

"use client";

import { Card } from "@/components/ui/card";
import { Activity, Thermometer } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

interface DiskData {
  time: number;
  read: number;
  write: number;
}

interface TempData {
  time: number;
  value: number;
}

interface RowDiskAndTempProps {
  metrics: {
    disk: {
      readSpeed: number | null;
      writeSpeed: number | null;
    };
    temperatures: {
      cpu: number | null;
      gpu: number | null;
    };
  };
  diskData: DiskData[];
  tempData: TempData[];
}

export default function RowDiskAndTemp({
  metrics,
  diskData,
  tempData,
}: RowDiskAndTempProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {metrics.disk.readSpeed !== null && metrics.disk.writeSpeed !== null && (
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-orange-400" />
            <h2 className="text-lg font-medium">Disk Activity</h2>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={diskData}>
                <XAxis
                  dataKey="time"
                  tick={false}
                  axisLine={{ stroke: "transparent" }}
                />
                <YAxis tick={false} axisLine={{ stroke: "transparent" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 border border-gray-700 p-2 text-xs rounded">
                          <div>Read: {payload[0]?.value || 0} MB/s</div>
                          <div>Write: {payload[1]?.value || 0} MB/s</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="read"
                  stroke="#f97316"
                  strokeWidth={1.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="write"
                  stroke="#ea580c"
                  strokeWidth={1.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-orange-400">
              Read: {metrics.disk.readSpeed} MB/s
            </span>
            <span className="text-orange-300">
              Write: {metrics.disk.writeSpeed} MB/s
            </span>
          </div>
        </Card>
      )}

      {metrics.temperatures.cpu !== null && (
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Thermometer size={18} className="text-red-400" />
            <h2 className="text-lg font-medium">Temperature</h2>
          </div>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tempData}>
                <XAxis
                  dataKey="time"
                  tick={false}
                  axisLine={{ stroke: "transparent" }}
                />
                <YAxis
                  domain={[20, 100]}
                  tick={false}
                  axisLine={{ stroke: "transparent" }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-gray-800 border border-gray-700 p-2 text-xs rounded">
                          Temp: {payload[0].value}°C
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.2}
                  strokeWidth={1.5}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">CPU:</span>
              <span>{metrics.temperatures.cpu}°C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">GPU:</span>
              <span>{metrics.temperatures.gpu ?? "N/A"}°C</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
