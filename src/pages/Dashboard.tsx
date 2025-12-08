import { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import { CSVData } from '../types';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<CSVData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);

    const text = await selectedFile.text();
    const parsed = api.parseCSV(text);
    setCsvData(parsed);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await api.analyzeComponent(file);
      storage.saveAnalysis(result);
      setSuccess(true);

      setTimeout(() => {
        navigate('/monitoring');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Analysis Dashboard</h2>
        <p className="text-slate-600 mt-1">Upload component data for AI-powered health analysis</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="bg-blue-50 p-6 rounded-full">
            <Upload className="w-12 h-12 text-blue-600" />
          </div>

          <div className="text-center">
            <label htmlFor="file-upload" className="cursor-pointer">
              <span className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors inline-block">
                Choose CSV File
              </span>
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="text-sm text-slate-500 mt-3">
              Select a component data file from the substation_data folder
            </p>
          </div>

          {file && (
            <div className="flex items-center space-x-2 bg-slate-50 px-4 py-2 rounded-lg">
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">{file.name}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center space-x-2 bg-red-50 text-red-700 px-4 py-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-3 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">Analysis complete! Redirecting...</span>
            </div>
          )}

          {csvData && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Activity className="w-5 h-5" />
              <span>{loading ? 'Analyzing...' : 'Run AI Analysis'}</span>
            </button>
          )}
        </div>
      </div>

      {csvData && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-800">Data Preview</h3>
            <p className="text-sm text-slate-600">First 100 rows of {csvData.rows.length} total records</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  {csvData.headers.slice(0, 8).map((header, i) => (
                    <th key={i} className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {csvData.rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    {csvData.headers.slice(0, 8).map((header, j) => (
                      <td key={j} className="px-4 py-3 text-sm text-slate-700">
                        {typeof row[header] === 'number'
                          ? (row[header] as number).toFixed(2)
                          : row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-sm text-slate-600">
            Showing 10 of {csvData.rows.length} rows • {csvData.headers.length} columns total
          </div>
        </div>
      )}
    </div>
  );
}
