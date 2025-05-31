"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Wifi, NetworkIcon as Ethernet, Keyboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

export default function AdvancedFeatures() {
  const [powerMode, setPowerMode] = useState("balanced");
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [uptime, setUptime] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [mouseButtons, setMouseButtons] = useState<Set<number>>(new Set());

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

  return (
    <>
      {/* Advanced Features Tab */}
      <TabsContent value="advanced" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Network Interface Overview */}
          <Card className="border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Wifi size={18} className="text-blue-400" />
              <h2 className="text-lg font-medium">Network Interfaces</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                <div className="flex items-center gap-2">
                  <Ethernet size={16} className="text-green-400" />
                  <div>
                    <div className="text-sm font-medium">Ethernet</div>
                    <div className="text-xs text-gray-400">eth0</div>
                  </div>
                </div>
                <Badge className="bg-green-950/30 text-green-400 border-green-800">
                  Connected
                </Badge>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">MAC Address:</span>
                  <span>00:1B:44:11:3A:B7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Address:</span>
                  <span>192.168.1.105</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Speed:</span>
                  <span>1000 Mbps</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-black/30 rounded">
                <div className="flex items-center gap-2">
                  <Wifi size={16} className="text-blue-400" />
                  <div>
                    <div className="text-sm font-medium">Wi-Fi</div>
                    <div className="text-xs text-gray-400">wlan0</div>
                  </div>
                </div>
                <Badge className="bg-blue-950/30 text-blue-400 border-blue-800">
                  Connected
                </Badge>
              </div>

              <div className="text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-400">MAC Address:</span>
                  <span>A4:CF:12:B0:09:2D</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">IP Address:</span>
                  <span>192.168.1.106</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Signal:</span>
                  <span>-45 dBm (Excellent)</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Input Device Tester */}
          <Card className="border-gray-800 bg-gray-900/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Keyboard size={18} className="text-purple-400" />
              <h2 className="text-lg font-medium">Input Device Tester</h2>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Keyboard</h3>
                <div className="bg-black/30 p-3 rounded text-xs">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Active Keys:</span>
                    <span>{pressedKeys.size}</span>
                  </div>
                  <div className="min-h-[40px] flex flex-wrap gap-1">
                    {Array.from(pressedKeys).map((key) => (
                      <Badge
                        key={key}
                        className="bg-purple-950/30 text-purple-400 border-purple-800 text-xs"
                      >
                        {key}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Mouse</h3>
                <div className="bg-black/30 p-3 rounded text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Position:</span>
                    <span>
                      X: {mousePosition.x}, Y: {mousePosition.y}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Buttons:</span>
                    <div className="flex gap-1">
                      {Array.from(mouseButtons).map((button) => (
                        <Badge
                          key={button}
                          className="bg-blue-950/30 text-blue-400 border-blue-800 text-xs"
                        >
                          {button === 0 ? "L" : button === 1 ? "M" : "R"}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Connected Devices</h3>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>USB Keyboard (HID)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>USB Optical Mouse</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>Touchpad (I2C)</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* System Logs */}
        {/* <Card className="border-gray-800 bg-gray-900/50 p-4">
          <h2 className="text-lg font-medium mb-3">System Event Log</h2>
          <div className="bg-black/50 p-3 rounded text-sm font-mono h-40 overflow-y-auto">
            <p className="text-green-400">
              [{formatUptime(uptime)}] Performance profile changed to:{" "}
              {profile.name}
            </p>
            <p className="text-blue-400">
              [{formatUptime(uptime - 5)}] Power mode set to: {powerMode}
            </p>
            <p className="text-green-400">
              [{formatUptime(uptime - 12)}] Network interface eth0 connected
            </p>
            <p className="text-green-400">
              [{formatUptime(uptime - 18)}] Wi-Fi interface wlan0 connected to
              network
            </p>
            <p className="text-yellow-400">
              [{formatUptime(uptime - 25)}] Battery level:{" "}
              {Math.round(batteryLevel)}%
            </p>
            <p className="text-blue-400">
              [{formatUptime(uptime - 30)}] Input devices initialized
            </p>
            <p className="text-green-400">
              [{formatUptime(uptime - 45)}] System boot completed successfully
            </p>
          </div>
        </Card> */}
      </TabsContent>
    </>
  );
}
