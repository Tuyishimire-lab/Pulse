export interface RadarQuality {
  bandwidth: number;
  latency: number;
  dnsResponseTime: number;
}

export interface RadarDeviceType {
  desktop: number;
  mobile: number;
  other: number;
}

export interface RadarTopLocation {
  location: string;
  name: string;
  percentage: number;
}

export interface RadarHttpVersion {
  http3: number;
  http2: number;
  http1: number;
}

export interface RadarStatsData {
  success: boolean;
  source: string;
  location: string;
  deviceType: RadarDeviceType;
  topLocations: RadarTopLocation[];
  httpVersion: RadarHttpVersion;
  quality: RadarQuality;
}

export interface SiteDbRow {
  id: string;
  name: string;
  url: string;
  rank: number;
  category: string;
  baseline: string;
  baseline_raw?: number;
  baselineRaw?: number;
  rate: number;
  progress: number;
  updated_at?: string;
  keywords?: string[];
  rank_history?: { rank: number; date: string }[];
}

export interface MarqueeItem {
  text: string;
  type: string;
  asns?: number[];
  locations?: string[];
}
