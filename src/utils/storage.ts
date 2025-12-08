import { Component, AnalysisResult } from '../types';

const COMPONENTS_KEY = 'substation_components';
const ANALYSIS_KEY = 'analysis_history';

export const storage = {
  getComponents: (): Component[] => {
    const data = localStorage.getItem(COMPONENTS_KEY);
    return data ? JSON.parse(data) : getDefaultComponents();
  },

  saveComponents: (components: Component[]) => {
    localStorage.setItem(COMPONENTS_KEY, JSON.stringify(components));
  },

  getAnalysisHistory: (): AnalysisResult[] => {
    const data = localStorage.getItem(ANALYSIS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveAnalysis: (analysis: AnalysisResult) => {
    const history = storage.getAnalysisHistory();
    history.unshift(analysis);
    localStorage.setItem(ANALYSIS_KEY, JSON.stringify(history.slice(0, 100)));
  },

  clearHistory: () => {
    localStorage.removeItem(ANALYSIS_KEY);
  }
};

function getDefaultComponents(): Component[] {
  return [
    { id: '1', name: 'Power Transformer 400/220kV', category: 'transformer_reactor', voltage_kv: 400, status: 'optimal' },
    { id: '2', name: 'Power Transformer 220/132kV', category: 'transformer_reactor', voltage_kv: 220, status: 'optimal' },
    { id: '3', name: 'Power Transformer 132/33kV', category: 'transformer_reactor', voltage_kv: 132, status: 'optimal' },
    { id: '4', name: 'Circuit Breaker SF6 400kV', category: 'switchgear', status: 'optimal' },
    { id: '5', name: 'Circuit Breaker SF6 220kV', category: 'switchgear', status: 'optimal' },
    { id: '6', name: 'Circuit Breaker Vacuum 132kV', category: 'switchgear', status: 'optimal' },
    { id: '7', name: 'Isolator Disconnector 400kV', category: 'switchgear', status: 'optimal' },
    { id: '8', name: 'Isolator Disconnector 220kV', category: 'switchgear', status: 'optimal' },
    { id: '9', name: 'Current Transformer CT 400kV', category: 'instrument', status: 'optimal' },
    { id: '10', name: 'Current Transformer CT 220kV', category: 'instrument', status: 'optimal' },
    { id: '11', name: 'Potential Transformer PT 400kV', category: 'instrument', status: 'optimal' },
    { id: '12', name: 'CVT 220kV', category: 'instrument', status: 'optimal' },
    { id: '13', name: 'Lightning Arrester 400kV', category: 'structure', status: 'optimal' },
    { id: '14', name: 'Lightning Arrester 220kV', category: 'structure', status: 'optimal' },
    { id: '15', name: 'Busbar Structure 400kV', category: 'structure', status: 'optimal' },
    { id: '16', name: 'Gantry Steel Structure', category: 'structure', status: 'optimal' },
    { id: '17', name: 'Control Room Building', category: 'electronics', status: 'optimal' },
    { id: '18', name: 'Relay Panel Protection', category: 'electronics', status: 'optimal' },
    { id: '19', name: 'SCADA System', category: 'electronics', status: 'optimal' },
    { id: '20', name: 'RTU Remote Terminal Unit', category: 'electronics', status: 'optimal' },
    { id: '21', name: 'Battery Bank 110V DC', category: 'battery_system', status: 'optimal' },
    { id: '22', name: 'Battery Charger', category: 'battery_system', status: 'optimal' },
    { id: '23', name: 'UPS System', category: 'battery_system', status: 'optimal' },
    { id: '24', name: 'Diesel Generator DG-1', category: 'generator', status: 'optimal' },
    { id: '25', name: 'Diesel Generator DG-2', category: 'generator', status: 'optimal' },
    { id: '26', name: 'Shunt Reactor 220kV', category: 'transformer_reactor', voltage_kv: 220, status: 'optimal' },
    { id: '27', name: 'Power Capacitor Bank', category: 'switchgear', status: 'optimal' },
    { id: '28', name: 'Earth Switch 400kV', category: 'switchgear', status: 'optimal' },
    { id: '29', name: 'Control Cable Network', category: 'electronics', status: 'optimal' },
    { id: '30', name: 'Fire Detection System', category: 'electronics', status: 'optimal' },
    { id: '31', name: 'CCTV Surveillance', category: 'electronics', status: 'optimal' },
    { id: '32', name: 'Earthing Grid System', category: 'structure', status: 'optimal' }
  ];
}
