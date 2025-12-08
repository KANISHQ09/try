export interface Component {
  id: string;
  name: string;
  category: string;
  voltage_kv?: number;
  status: 'optimal' | 'warning' | 'critical';
  lastAnalyzed?: string;
  healthScore?: number;
}

export interface AnalysisResult {
  id: string;
  filename: string;
  componentName: string;
  timestamp: string;
  status: string;
  health_score: number;
  rul_days: number;
  alert_level: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  top_factors: [string, number][];
  future_trends: Record<string, number>[];
}

export interface CSVData {
  headers: string[];
  rows: Record<string, string | number>[];
}
