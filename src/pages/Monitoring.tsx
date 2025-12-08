import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, TrendingUp, Calendar, AlertCircle, Brain, Target } from 'lucide-react';
import { storage } from '../utils/storage';
import { AnalysisResult } from '../types';

export default function Monitoring() {
  const [latestAnalysis, setLatestAnalysis] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const history = storage.getAnalysisHistory();
    if (history.length > 0) {
      setLatestAnalysis(history[0]);
    }
  }, []);

  if (!latestAnalysis) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">AI Monitoring</h2>
          <p className="text-slate-600 mt-1">Real-time component health analysis</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="w-10 h-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No Analysis Available</h3>
          <p className="text-slate-600 mb-6">Upload a component CSV file from the Dashboard to see AI-powered insights</p>
          <a
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block"
          >
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const getAlertStyle = (level: string) => {
    switch (level) {
      case 'OPTIMAL': return 'bg-green-50 border-green-200 text-green-700';
      case 'WARNING': return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'CRITICAL': return 'bg-red-50 border-red-200 text-red-700';
      default: return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  const healthGaugeColor = latestAnalysis.health_score > 80 ? 'text-green-600' :
                           latestAnalysis.health_score > 50 ? 'text-yellow-600' : 'text-red-600';

  const factorsData = latestAnalysis.top_factors.map(([name, value]) => ({
    name: name.replace(/_/g, ' ').substring(0, 20),
    impact: (value * 100).toFixed(1),
  }));

  const trendsData = latestAnalysis.future_trends.slice(0, 24).map((trend, i) => ({
    hour: `${i}h`,
    ...Object.entries(trend).reduce((acc, [key, val]) => {
      if (typeof val === 'number' && !key.includes('timestamp')) {
        acc[key.substring(0, 15)] = Number(val.toFixed(2));
      }
      return acc;
    }, {} as Record<string, number>)
  }));

  const firstTrendKey = Object.keys(trendsData[0]).find(k => k !== 'hour') || '';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">AI Monitoring</h2>
        <p className="text-slate-600 mt-1">Real-time component health analysis</p>
      </div>

      <div className={`border-2 rounded-xl p-6 ${getAlertStyle(latestAnalysis.alert_level)}`}>
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6" />
          <div>
            <h3 className="font-bold text-lg">Alert Level: {latestAnalysis.alert_level}</h3>
            <p className="text-sm opacity-90">
              Component: {latestAnalysis.componentName} • Analyzed: {new Date(latestAnalysis.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Health Score</h3>
            <Target className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold ${healthGaugeColor} mb-2`}>
              {latestAnalysis.health_score.toFixed(1)}
            </div>
            <div className="text-slate-600 text-sm">out of 100</div>
            <div className="mt-4 bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full ${
                  latestAnalysis.health_score > 80 ? 'bg-green-500' :
                  latestAnalysis.health_score > 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${latestAnalysis.health_score}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Remaining Useful Life</h3>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {Math.floor(latestAnalysis.rul_days)}
            </div>
            <div className="text-slate-600 text-sm">days estimated</div>
            <div className="mt-4 text-xs text-slate-500">
              ≈ {Math.floor(latestAnalysis.rul_days / 30)} months
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">ML Engine Status</h3>
            <Brain className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Model Type</span>
              <span className="text-sm font-medium text-slate-800">RF + LSTM</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Features</span>
              <span className="text-sm font-medium text-slate-800">{latestAnalysis.top_factors.length}+</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Confidence</span>
              <span className="text-sm font-medium text-green-600">High</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Activity className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800 text-lg">Critical Risk Factors</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={factorsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} label={{ value: 'Impact %', angle: -90, position: 'insideLeft' }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              formatter={(value: number) => [`${value}%`, 'Impact']}
            />
            <Bar dataKey="impact" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          {latestAnalysis.top_factors.map(([name, value], i) => (
            <div key={i} className="bg-slate-50 rounded-lg p-3">
              <div className="text-xs text-slate-600 mb-1">#{i + 1} Factor</div>
              <div className="font-medium text-slate-800 text-sm">{name.replace(/_/g, ' ')}</div>
              <div className="text-xs text-blue-600 font-semibold mt-1">
                {(value * 100).toFixed(1)}% impact
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-5 h-5 text-slate-600" />
          <h3 className="font-semibold text-slate-800 text-lg">24-Hour Predictive Forecast</h3>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={trendsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="hour" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={firstTrendKey}
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              name={firstTrendKey}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>AI Insight:</strong> The LSTM neural network has projected the next 24 hours of operational parameters.
            Monitor for deviations from expected ranges to prevent potential failures.
          </p>
        </div>
      </div>
    </div>
  );
}
