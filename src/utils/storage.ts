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

  // UPDATED: Now updates the Component status when an Analysis is saved
  saveAnalysis: (analysis: AnalysisResult) => {
    // 1. Save to History
    const history = storage.getAnalysisHistory();
    history.unshift(analysis);
    localStorage.setItem(ANALYSIS_KEY, JSON.stringify(history.slice(0, 100)));

    // 2. Update the specific Asset's status
    const components = storage.getComponents();
    const componentIndex = components.findIndex(c => 
      // Normalize names to match (ignoring case and underscores)
      c.name.toLowerCase().replace(/_/g, ' ') === analysis.componentName.toLowerCase() ||
      analysis.filename.includes(c.name.toLowerCase().replace(/[^a-z0-9]/g, '_'))
    );

    if (componentIndex >= 0) {
      components[componentIndex] = {
        ...components[componentIndex],
        status: analysis.alert_level === 'OPTIMAL' ? 'optimal' : 
               analysis.alert_level === 'WARNING' ? 'warning' : 'critical',
        healthScore: analysis.health_score,
        lastAnalyzed: analysis.timestamp
      };
      storage.saveComponents(components);
    }
  },

  clearHistory: () => {
    localStorage.removeItem(ANALYSIS_KEY);
    // Optionally reset components to default
    localStorage.removeItem(COMPONENTS_KEY);
  }
};

// UPDATED: List matches 'generate_data.py' exactly
function getDefaultComponents(): Component[] {
  return [
    // Transformers
    { id: '1', name: 'Power Transformer 400_220kV', category: 'transformer_reactor', voltage_kv: 400, status: 'optimal' },
    { id: '2', name: 'Power Transformer 220_132kV', category: 'transformer_reactor', voltage_kv: 220, status: 'optimal' },
    { id: '3', name: 'Power Transformer 132_33kV', category: 'transformer_reactor', voltage_kv: 132, status: 'optimal' },
    { id: '4', name: 'Auto Transformer', category: 'transformer_reactor', voltage_kv: 400, status: 'optimal' },
    { id: '5', name: 'Station Transformer', category: 'transformer_reactor', voltage_kv: 33, status: 'optimal' },
    { id: '6', name: 'Auxiliary Transformer 33_0.415kV', category: 'transformer_reactor', voltage_kv: 0.4, status: 'optimal' },
    
    // Reactors
    { id: '7', name: 'Shunt Reactor', category: 'transformer_reactor', voltage_kv: 400, status: 'optimal' },
    { id: '8', name: 'Line Reactor', category: 'transformer_reactor', voltage_kv: 400, status: 'optimal' },

    // Switchgear
    { id: '9', name: 'Circuit Breaker SF6', category: 'switchgear', status: 'optimal' },
    { id: '10', name: 'Circuit Breaker Vacuum', category: 'switchgear', status: 'optimal' },
    { id: '11', name: 'Isolator Disconnector', category: 'switchgear', status: 'optimal' },
    { id: '12', name: 'Isolator with Earth Switch', category: 'switchgear', status: 'optimal' },
    { id: '13', name: 'Bus Coupler', category: 'switchgear', status: 'optimal' },
    { id: '14', name: 'Line Bay', category: 'switchgear', status: 'optimal' },
    { id: '15', name: 'Transformer Bay', category: 'switchgear', status: 'optimal' },
    { id: '16', name: 'Feeder Bay', category: 'switchgear', status: 'optimal' },

    // Instruments
    { id: '17', name: 'CVT Capacitive Voltage Transformer', category: 'instrument', status: 'optimal' },
    { id: '18', name: 'PT Potential Transformer', category: 'instrument', status: 'optimal' },
    { id: '19', name: 'CT Current Transformer', category: 'instrument', status: 'optimal' },
    { id: '20', name: 'Surge Arrester', category: 'instrument', status: 'optimal' },

    // Structures
    { id: '21', name: 'Wave Trap', category: 'structure', status: 'optimal' },
    { id: '22', name: 'Busbar Main', category: 'structure', status: 'optimal' },
    { id: '23', name: 'Busbar Transfer', category: 'structure', status: 'optimal' },
    { id: '24', name: 'Busbar Sectionalizer', category: 'structure', status: 'optimal' },
    { id: '25', name: 'Gantry Structure', category: 'structure', status: 'optimal' },
    { id: '26', name: 'Lightning Mast', category: 'structure', status: 'optimal' },
    { id: '27', name: 'Incoming Transmission Tower', category: 'structure', status: 'optimal' },
    { id: '28', name: 'Dead End Tower', category: 'structure', status: 'optimal' },

    // Electronics & Control
    { id: '29', name: 'Control Room Building', category: 'electronics', status: 'optimal' },
    { id: '30', name: 'Relay Panel', category: 'electronics', status: 'optimal' },
    { id: '31', name: 'SCADA Panel', category: 'electronics', status: 'optimal' },
    { id: '32', name: 'PLCC Panel', category: 'electronics', status: 'optimal' },
    { id: '33', name: 'AC Distribution Board', category: 'electronics', status: 'optimal' },
    { id: '34', name: 'DC Distribution Board', category: 'electronics', status: 'optimal' },

    // Power Sources
    { id: '35', name: 'Battery Bank', category: 'battery_system', status: 'optimal' },
    { id: '36', name: 'Battery Charger', category: 'battery_system', status: 'optimal' },
    { id: '37', name: 'Diesel Generator DG', category: 'generator', status: 'optimal' }
  ];
}