import React from "react";
import { Card } from "@/components/ui/card";
import { Cpu, MemoryStick } from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

interface CpuAndMemoryProps {
  metrics: {
    cpu: {
      usage: number;
    };
    temperatures: {
      cpu?: number;
    };
    memory: {
      usedGB: number;
      totalGB: number;
    };
  };
  cpuData: Array<{ time: string; value: number }>;
  ramData: Array<{ time: string; value: number }>;
}

const Cpuandmemory: React.FC<CpuAndMemoryProps> = ({
  metrics,
  cpuData,
  ramData,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Cpu size={18} className="text-blue-400" />
          <h2 className="text-lg font-medium">CPU Usage</h2>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cpuData}>
              <XAxis
                dataKey="time"
                tick={false}
                axisLine={{ stroke: "transparent" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={false}
                axisLine={{ stroke: "transparent" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-800 border border-gray-700 p-2 text-xs rounded">
                        CPU: {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.2}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-400">Current: {metrics.cpu.usage}%</span>
          <span className="text-gray-400">
            Temp: {metrics.temperatures.cpu ?? "N/A"}°C
          </span>
        </div>
      </Card>

      <Card className="border-gray-800 bg-gray-900/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <MemoryStick size={18} className="text-purple-400" />
          <h2 className="text-lg font-medium">Memory Usage</h2>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ramData}>
              <XAxis
                dataKey="time"
                tick={false}
                axisLine={{ stroke: "transparent" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={false}
                axisLine={{ stroke: "transparent" }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-800 border border-gray-700 p-2 text-xs rounded">
                        RAM: {payload[0].value}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#a855f7"
                fill="#a855f7"
                fillOpacity={0.2}
                strokeWidth={1.5}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 flex justify-between text-sm">
          <span className="text-gray-400">
            Used: {metrics.memory.usedGB} GB
          </span>
          <span className="text-gray-400">
            Total: {metrics.memory.totalGB} GB
          </span>
        </div>
      </Card>
    </div>
  );
};

export default Cpuandmemory;
