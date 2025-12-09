import { useState, useEffect } from 'react';
import { Search, Filter, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import { storage } from '../utils/storage';
import { Component } from '../types';

const categoryIcons: Record<string, string> = {
  transformer_reactor: '⚡',
  switchgear: '🔌',
  instrument: '📊',
  structure: '🏗️',
  electronics: '💻',
  battery_system: '🔋',
  generator: '⚙️',
};

export default function Assets() {
  const [components, setComponents] = useState<Component[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setComponents(storage.getComponents());
  }, []);

  const categories = ['all', ...Array.from(new Set(components.map(c => c.category)))];

  const filteredComponents = components.filter(comp => {
    const matchesSearch = comp.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || comp.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-100 text-green-700 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'optimal': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'critical': return <Zap className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  const statusCounts = {
    optimal: components.filter(c => c.status === 'optimal').length,
    warning: components.filter(c => c.status === 'warning').length,
    critical: components.filter(c => c.status === 'critical').length,
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Asset Management</h2>
        <p className="text-slate-600 dark:text-slate-400 mt-1">Monitor and manage all substation components</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Optimal</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{statusCounts.optimal}</p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Warning</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">{statusCounts.warning}</p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Critical</p>
              <p className="text-3xl font-bold text-red-600 mt-1">{statusCounts.critical}</p>
            </div>
            <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
              <Zap className="w-8 h-8 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search components..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="text-slate-400 dark:text-slate-400 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((component) => (
            <div
              key={component.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-all hover:border-blue-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{categoryIcons[component.category]}</span>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white text-sm leading-tight">
                      {component.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {component.category.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {component.voltage_kv && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Voltage</span>
                    <span className="font-medium text-slate-800 dark:text-white">{component.voltage_kv} kV</span>
                  </div>
                )}

                {component.healthScore && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">Health Score</span>
                    <span className="font-medium text-slate-800 dark:text-white">{component.healthScore}%</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                  <span className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(component.status)}`}>
                    {getStatusIcon(component.status)}
                    <span className="capitalize">{component.status}</span>
                  </span>
                </div>

                {component.lastAnalyzed && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                    Last analyzed: {new Date(component.lastAnalyzed).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400">No components found</p>
          </div>
        )}
      </div>
    </div>
  );
}
