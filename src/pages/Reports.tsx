import { useState, useEffect } from 'react';
import { FileText, Download, Trash2, Calendar, Activity } from 'lucide-react';
import { storage } from '../utils/storage';
import { AnalysisResult } from '../types';

export default function Reports() {
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = () => {
    setHistory(storage.getAnalysisHistory());
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all analysis history?')) {
      storage.clearHistory();
      loadHistory();
    }
  };

  const handleDownloadReport = (analysis: AnalysisResult) => {
    const report = {
      ...analysis,
      generatedAt: new Date().toISOString(),
      reportType: 'Component Health Analysis',
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${analysis.componentName}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCSV = (analysis: AnalysisResult) => {
    const headers = ['Metric', 'Value'];
    const rows = [
      ['Component Name', analysis.componentName],
      ['Health Score', analysis.health_score],
      ['Remaining Useful Life (days)', analysis.rul_days],
      ['Alert Level', analysis.alert_level],
      ['Analysis Date', new Date(analysis.timestamp).toLocaleString()],
      ['Status', analysis.status],
      ...analysis.top_factors.map(([name, value], i) => [
        `Risk Factor #${i + 1}`,
        `${name}: ${(value * 100).toFixed(1)}%`
      ])
    ];

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${analysis.componentName}_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getAlertBadge = (level: string) => {
    const styles = {
      OPTIMAL: 'bg-green-100 text-green-700 border-green-200',
      WARNING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      CRITICAL: 'bg-red-100 text-red-700 border-red-200',
    };
    return styles[level as keyof typeof styles] || styles.OPTIMAL;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Analysis Reports</h2>
          <p className="text-slate-600 mt-1">View and download historical analysis results</p>
        </div>

        {history.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            <span className="font-medium">Clear History</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Analyses</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{history.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Average Health</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {history.length > 0
                  ? (history.reduce((acc, h) => acc + h.health_score, 0) / history.length).toFixed(1)
                  : '0'}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Activity className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Last Analysis</p>
              <p className="text-lg font-bold text-slate-800 mt-1">
                {history.length > 0
                  ? new Date(history[0].timestamp).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Reports Yet</h3>
          <p className="text-slate-600 mb-6">
            Run your first analysis to generate reports
          </p>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            Start Analysis
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Health Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    RUL (days)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Alert Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((analysis) => (
                  <tr key={analysis.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{analysis.componentName}</div>
                      <div className="text-sm text-slate-500">{analysis.filename}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {new Date(analysis.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-800">
                          {analysis.health_score.toFixed(1)}
                        </span>
                        <div className="w-16 bg-slate-100 rounded-full h-2">
                          <div
                            className={`h-full rounded-full ${
                              analysis.health_score > 80 ? 'bg-green-500' :
                              analysis.health_score > 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${analysis.health_score}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-800">
                      {analysis.rul_days.toFixed(0)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-md text-xs font-semibold border ${getAlertBadge(analysis.alert_level)}`}>
                        {analysis.alert_level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownloadReport(analysis)}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Download JSON"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadCSV(analysis)}
                          className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                          title="Download CSV"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
