export interface DailyTraffic {
  day: string;
  requests: number;
}

export interface TopPath {
  path: string;
  requests: number;
}

export interface StatusBreakdown {
  statusCode: number;
  requests: number;
  pct: number;
}

export interface TopHost {
  host: string;
  requests: number;
  totalBytes: number;
}

export interface HourlyTraffic {
  hourOfDay: number;
  totalBytes: number;
  requests: number;
}

export interface ErrorRateByDay {
  day: string;
  errors: number;
  total: number;
  errorPct: number;
}

export interface HostHealth {
  host: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  status: string;
}