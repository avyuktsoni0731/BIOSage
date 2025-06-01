import type { NextApiRequest, NextApiResponse } from "next";
import si from "systeminformation";

function snapToStandardRAMSize(sizeGB: number): string {
  const commonSizes = [4, 8, 16, 32, 64, 128];
  const closest = commonSizes.reduce((prev, curr) =>
    Math.abs(curr - sizeGB) < Math.abs(prev - sizeGB) ? curr : prev
  );
  return `${closest}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const [
      bios,
      cpu,
      mem,
      disk,
      graphics,
      currentLoad,
      cpuTemperature,
      rawNetworkStats,
      diskStats,
      battery,
      fsSize,
      networkInterfaces,
    ] = await Promise.all([
      si.bios(),
      si.cpu(),
      si.mem(),
      si.diskLayout(),
      si.graphics(),
      si.currentLoad(),
      si.cpuTemperature(),
      si.networkStats(),
      si.disksIO(),
      si.battery(),
      si.fsSize(),
      si.networkInterfaces(),
    ]);

    const memoryUsedGB = (mem.used / 1024 ** 3).toFixed(1);
    const memoryTotalGB = snapToStandardRAMSize(mem.total / 1024 ** 3);
    const memoryUsagePercent = Math.round((mem.used / mem.total) * 100);

    const gpu = graphics.controllers[0] || null;
    const gpuUsage = gpu?.utilizationGpu ?? null;
    const gpuMemoryUsed = gpu?.memoryUsed ?? null;
    const gpuMemoryTotal = gpu?.memoryTotal ?? null;

    const activeInterface = networkInterfaces.find(
      (net) =>
        !net.internal &&
        rawNetworkStats.some((stat) => stat.iface === net.iface)
    );
    const activeStat =
      rawNetworkStats.find(
        (stat) => stat.iface === activeInterface?.iface
      ) || rawNetworkStats[0];

    const downloadSpeed = activeStat?.rx_sec
      ? Math.round(activeStat.rx_sec / 125000)
      : null;
    const uploadSpeed = activeStat?.tx_sec
      ? Math.round(activeStat.tx_sec / 125000)
      : null;

    const diskReadSpeed = diskStats?.rIO_sec
      ? Math.round(diskStats.rIO_sec / (1024 * 1024))
      : null;
    const diskWriteSpeed = diskStats?.wIO_sec
      ? Math.round(diskStats.wIO_sec / (1024 * 1024))
      : null;

    const cpuTemp = cpuTemperature.main ?? null;

    const storageDevices = fsSize.map((fs) => ({
      name: fs.fs,
      size: fs.size,
      used: fs.used,
      usagePercent: Math.round((fs.used / fs.size) * 100),
      type: fs.type,
    }));

    const response = {
      biosVersion: bios.version && bios.releaseDate
        ? `${bios.version} (${bios.releaseDate})`
        : bios.version || null,
      cpu: `${cpu.manufacturer} ${cpu.brand}`,
      memory: `${memoryTotalGB}GB`,
      storage:
        disk.length > 0
          ? `${(disk[0].size / 1e12).toFixed(1)}TB ${disk[0].type}`
          : null,
      bootMode: "UEFI", // restored as per your request
      graphics: gpu?.model ?? null,
      metrics: {
        cpu: {
          usage: Math.round(currentLoad.currentLoad),
          temperature: cpuTemp,
        },
        memory: {
          usagePercent: memoryUsagePercent,
          usedGB: memoryUsedGB,
          totalGB: memoryTotalGB,
        },
        gpu: {
          usage: gpuUsage,
          memoryUsed: gpuMemoryUsed
            ? (gpuMemoryUsed / 1024).toFixed(1)
            : null,
          memoryTotal: gpuMemoryTotal
            ? (gpuMemoryTotal / 1024).toFixed(0)
            : null,
        },
        network: {
          downloadSpeed,
          uploadSpeed,
          interface: activeInterface?.iface ?? null,
        },
        disk: {
          readSpeed: diskReadSpeed,
          writeSpeed: diskWriteSpeed,
        },
        power: battery.hasBattery
          ? {
              hasBattery: battery.hasBattery,
              percent: battery.percent,
              isCharging: battery.isCharging,
            }
          : null,
        temperatures: {
          cpu: cpuTemp,
          gpu: null,
        },
        storage: storageDevices,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("System info error:", err);
    res.status(500).json({ error: "Failed to fetch system info" });
  }
}
