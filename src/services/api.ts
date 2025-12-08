import { AnalysisResult } from '../types';

const API_BASE_URL = 'http://localhost:8000';

export const api = {
  analyzeComponent: async (file: File): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Analysis failed. Ensure Python backend is running on port 8000');
    }

    const data = await response.json();

    return {
      id: `analysis_${Date.now()}`,
      filename: data.filename,
      componentName: file.name.replace('.csv', '').replace('data_', '').replace(/_/g, ' '),
      timestamp: new Date().toISOString(),
      status: data.status,
      health_score: data.health_score,
      rul_days: data.rul_days,
      alert_level: data.alert_level,
      top_factors: data.top_factors,
      future_trends: data.future_trends,
    };
  },

  parseCSV: (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = lines.slice(1, 101).map(line => {
      const values = line.split(',');
      const row: Record<string, string | number> = {};
      headers.forEach((header, i) => {
        const value = values[i]?.trim();
        row[header] = isNaN(Number(value)) ? value : Number(value);
      });
      return row;
    });
    return { headers, rows };
  }
};
