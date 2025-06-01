import React from 'react'
import { Card } from '../ui/card'
import {HardDrive} from "lucide-react";
import { Progress } from "@/components/ui/progress";
const Storage = ({metrics}) => {
  return (
    <div className="grid grid-cols-1 gap-4">
        <Card className="border-gray-800 bg-gray-900/50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <HardDrive size={18} className="text-green-400" />
            <h2 className="text-lg font-medium">Storage Status</h2>
          </div>
          <div className="space-y-3">
            {metrics.storage.slice(0, 3).map((storage, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{storage.name} ({(storage.size / 1e12).toFixed(1)}TB)</span>
                  <span>{storage.usagePercent}% used</span>
                </div>
                <Progress value={storage.usagePercent} className="h-1" />
              </div>
            ))}
          </div>
        </Card>
      </div>
  )
}

export default Storage