"use client";

import { useState, useEffect, useRef } from "react";
import { TabsContent } from "@/components/ui/tabs";

import RowGPUAndNetwork from "./RowGPUAndNetwork";
import Storage from "./storage";
import Cpuandmemory from "./cpuandmemory";
import RowDiskAndTemp from "./RowDiskAndTemp";

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

interface TimeSeriesData {
  time: number;
  value: number;
}

interface NetworkData {
  time: number;
  upload: number;
  download: number;
}

interface DiskData {
  time: number;
  read: number;
  write: number;
}

export default function HardwareMonitor() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Time series data for charts
  const [cpuData, setCpuData] = useState<TimeSeriesData[]>([]);
  const [ramData, setRamData] = useState<TimeSeriesData[]>([]);
  const [tempData, setTempData] = useState<TimeSeriesData[]>([]);
  const [gpuData, setGpuData] = useState<TimeSeriesData[]>([]);
  const [networkData, setNetworkData] = useState<NetworkData[]>([]);
  const [diskData, setDiskData] = useState<DiskData[]>([]);
  
  const timeCounter = useRef(0);

  const fetchSystemMetrics = async () => {
    try {
      const response = await fetch('/api/system-info');
      if (!response.ok) throw new Error('Failed to fetch system metrics');
      
      const data = await response.json();
      setMetrics(data.metrics);
      setError(null);
      
      // Update time series data
      const currentTime = timeCounter.current++;
      
      setCpuData(prev => [...prev.slice(-49), { time: currentTime, value: data.metrics.cpu.usage }]);
      setRamData(prev => [...prev.slice(-49), { time: currentTime, value: data.metrics.memory.usagePercent }]);
      
      if (data.metrics.temperatures.cpu !== null) {
        setTempData(prev => [...prev.slice(-49), { time: currentTime, value: data.metrics.temperatures.cpu }]);
      }
      
      if (data.metrics.gpu.usage !== null) {
        setGpuData(prev => [...prev.slice(-49), { time: currentTime, value: data.metrics.gpu.usage }]);
      }
      
      if (data.metrics.network.downloadSpeed !== null && data.metrics.network.uploadSpeed !== null) {
        setNetworkData(prev => [...prev.slice(-49), { 
          time: currentTime, 
          upload: data.metrics.network.uploadSpeed,
          download: data.metrics.network.downloadSpeed
        }]);
      }
      
      if (data.metrics.disk.readSpeed !== null && data.metrics.disk.writeSpeed !== null) {
        setDiskData(prev => [...prev.slice(-49), { 
          time: currentTime, 
          read: data.metrics.disk.readSpeed,
          write: data.metrics.disk.writeSpeed
        }]);
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchSystemMetrics();
    
    // Update every 2 seconds
    const interval = setInterval(fetchSystemMetrics, 2000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <TabsContent value="hardware" className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading system metrics...</div>
        </div>
      </TabsContent>
    );
  }

  if (error) {
    return (
      <TabsContent value="hardware" className="space-y-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-red-400">Error: {error}</div>
        </div>
      </TabsContent>
    );
  }

  if (!metrics) return null;

  return (
    <TabsContent value="hardware" className="space-y-4">

      <Cpuandmemory metrics={metrics} cpuData={cpuData} ramData={ramData} />
      <RowGPUAndNetwork metrics={metrics} gpuData={gpuData} networkData={networkData} />
      <RowDiskAndTemp metrics={metrics} diskData={diskData} tempData={tempData} />
      <Storage metrics={metrics}/>

    </TabsContent>
  );
}