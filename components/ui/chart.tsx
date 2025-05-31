import type React from "react"

export const LineChart = ({ children, data }: { children: React.ReactNode; data: any[] }) => {
  return <div>{children}</div>
}

export const Line = ({
  type,
  dataKey,
  stroke,
  strokeWidth,
  dot,
}: { type: string; dataKey: string; stroke: string; strokeWidth: number; dot: boolean }) => {
  return null
}

export const ResponsiveContainer = ({
  children,
  width,
  height,
}: { children: React.ReactNode; width: string; height: string }) => {
  return <div style={{ width: width, height: height }}>{children}</div>
}

export const XAxis = ({ dataKey, tick }: { dataKey: string; tick: boolean }) => {
  return null
}

export const YAxis = ({ domain }: { domain: number[] }) => {
  return null
}

export const Tooltip = ({ content }: { content: any }) => {
  return null
}
