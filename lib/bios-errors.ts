// lib/bios-errors.ts
export interface BiosError {
  error: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const BIOS_ERRORS: BiosError[] = [
  {
    error: "ERROR: Memory module in DIMM_A2 reporting inconsistent timings.",
    severity: "high"
  },
  {
    error: "WARNING: CPU temperature exceeding safe thresholds (92°C).",
    severity: "medium"
  },
  {
    error: "ERROR: Boot device not found - no storage devices detected.",
    severity: "critical"
  },
  {
    error: "WARNING: GPU fan speed below recommended minimum (20%).",
    severity: "medium"
  },
  {
    error: "ERROR: CMOS battery failure - system settings may not persist.",
    severity: "high"
  },
  {
    error: "WARNING: Network interface eth0 link speed degraded (100Mbps).",
    severity: "low"
  }
];