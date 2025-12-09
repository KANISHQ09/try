import pandas as pd
import numpy as np
import os
import re

# Create output directory
OUTPUT_DIR = "substation_data"
if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def generate_component_data(name, category, voltage_kv=None, n_rows=1000):
    print(f"Generating data for: {name}...")
    np.random.seed(42)
    dates = pd.date_range(start='2024-01-01', periods=n_rows, freq='h')
    
    # === 1. BASE ENVIRONMENTAL DATA (Affects everything) ===
    data = {'timestamp': dates}
    # Ambient Temp with daily cycle
    data['ambient_temp'] = np.random.normal(25, 5, n_rows) + np.sin(np.linspace(0, 10, n_rows)) * 8
    # Humidity
    data['humidity'] = np.clip(np.random.normal(60, 15, n_rows), 10, 100)
    
    # === 2. CATEGORY-SPECIFIC PHYSICS LOGIC ===
    
    # --- A. TRANSFORMERS & REACTORS (Oil, Temp, Load, Gas) ---
    if category == 'transformer_reactor':
        # Load factor based on voltage rating (Higher KV = Higher Load Capacity)
        base_load = 100 if not voltage_kv else voltage_kv * 2
        
        data['load_current_a'] = np.abs(np.random.normal(base_load, base_load*0.1, n_rows) * np.sin(np.linspace(0, 20, n_rows)))
        data['oil_temp_c'] = data['ambient_temp'] + (data['load_current_a'] * 0.05) + np.random.normal(0, 1, n_rows)
        data['winding_temp_c'] = data['oil_temp_c'] * 1.1
        
        # Dissolved Gas Analysis (DGA) - Critical for health
        data['dissolved_gas_h2_ppm'] = np.cumsum(np.random.normal(0.2, 0.05, n_rows)) # Hydrogen (Arcing)
        data['moisture_in_oil_ppm'] = 10 + (data['humidity'] * 0.05) + np.linspace(0, 15, n_rows)
        
        # Mechanical
        data['vibration_level_mm_s'] = np.random.normal(0.5, 0.1, n_rows) + (data['load_current_a']/1000)
        
        # Health Equation: Gas + Moisture + Vibration
        data['health_score'] = 100 - (data['dissolved_gas_h2_ppm']/5) - (data['moisture_in_oil_ppm']/3) - (data['vibration_level_mm_s']*10)

    # --- B. SWITCHGEAR (Breakers, Isolators) ---
    elif category == 'switchgear':
        is_sf6 = 'SF6' in name
        
        if is_sf6:
            data['gas_pressure_bar'] = 6.4 - np.linspace(0, 0.8, n_rows) + np.random.normal(0, 0.01, n_rows)
        
        data['contact_resistance_micro_ohm'] = 50 + np.cumsum(np.random.normal(0.05, 0.01, n_rows))
        data['operation_count'] = np.arange(n_rows) // 48 # Rare operations
        data['mechanism_travel_time_ms'] = 40 + (data['operation_count'] * 0.1) # Slowing down
        data['control_voltage_v'] = 110 + np.random.normal(0, 2, n_rows)
        
        # Health: Pressure (if SF6) + Resistance
        pressure_penalty = (6.4 - data['gas_pressure_bar']) * 100 if is_sf6 else 0
        data['health_score'] = 100 - pressure_penalty - (data['contact_resistance_micro_ohm'] - 50)

    # --- C. INSTRUMENT TRANSFORMERS (CT, PT, CVT) ---
    elif category == 'instrument':
        data['secondary_voltage_current_deviation'] = np.linspace(0, 1.5, n_rows) # Drift
        data['oil_level_percent'] = 100 - np.linspace(0, 5, n_rows) - (data['ambient_temp'] * 0.1)
        data['tan_delta_dielectric'] = 0.002 + np.cumsum(np.random.normal(0.0001, 0, n_rows))
        
        if 'CVT' in name:
            data['capacitance_change_pf'] = np.linspace(0, 200, n_rows) # Capacitor failure
        
        # Health: Dielectric (Tan Delta) is main failure mode
        data['health_score'] = 100 - (data['tan_delta_dielectric'] * 5000)

    # --- D. STRUCTURES (Towers, Gantries, Busbars) ---
    elif category == 'structure':
        data['corrosion_index'] = np.linspace(0, 20, n_rows) + (data['humidity'] * 0.1)
        data['mechanical_stress_mpa'] = np.random.normal(50, 10, n_rows) # Wind load
        data['vibration_hz'] = np.random.normal(10, 2, n_rows) # Wind induced
        data['ground_foundation_tilt_deg'] = np.cumsum(np.random.normal(0.001, 0, n_rows))
        
        # Health: Corrosion + Tilt
        data['health_score'] = 100 - data['corrosion_index'] - (data['ground_foundation_tilt_deg'] * 100)

    # --- E. ELECTRONICS & PANELS (Relay, SCADA, Charger) ---
    elif category == 'electronics':
        data['internal_temp_c'] = data['ambient_temp'] + 10 + np.random.normal(0, 1, n_rows)
        data['input_voltage_v'] = 230 + np.random.normal(0, 5, n_rows)
        data['communication_error_rate'] = np.random.poisson(0.5, n_rows)
        data['fan_status_rpm'] = 2000 - np.linspace(0, 500, n_rows) # Fan dying
        
        # Health: Heat + Comms Errors
        data['health_score'] = 100 - (data['internal_temp_c'] - 30) - (data['communication_error_rate'] * 5)

    # --- F. BATTERY & AUX ---
    elif category == 'battery_system':
        data['voltage_v'] = 110 + np.random.normal(0, 1, n_rows)
        data['internal_resistance_mohm'] = 10 + np.cumsum(np.random.normal(0.02, 0.001, n_rows))
        data['electrolyte_temp_c'] = data['ambient_temp']
        data['discharge_cycles'] = np.arange(n_rows) // 100
        
        # Health: Resistance rising = death
        data['health_score'] = 100 - (data['internal_resistance_mohm'] - 10) * 5

    # --- G. GENERATORS (DG Set) ---
    elif category == 'generator':
        data['fuel_level_percent'] = 100 - (np.arange(n_rows) % 100)
        data['coolant_temp_c'] = 85 + np.random.normal(0, 2, n_rows)
        data['oil_pressure_psi'] = 60 - np.linspace(0, 15, n_rows)
        data['battery_start_voltage'] = 24 - np.linspace(0, 4, n_rows)
        
        # Health: Oil Pressure
        data['health_score'] = 100 - (60 - data['oil_pressure_psi']) * 3

    # === 3. FINALIZE & SAVE ===
    df = pd.DataFrame(data)
    df['health_score'] = df['health_score'].clip(0, 100)
    df['estimated_life_remaining_days'] = df['health_score'] * 20 # Simple heuristic
    
    # Sanitize filename
    clean_name = re.sub(r'[^a-zA-Z0-9]', '_', name).lower()
    filepath = os.path.join(OUTPUT_DIR, f"data_{clean_name}.csv")
    df.to_csv(filepath, index=False)
    # print(f"  -> Saved {filepath}")

# ==============================================================================
# MAIN CONFIGURATION: DEFINING YOUR 32 COMPONENTS
# ==============================================================================
COMPONENT_LIST = [
    # --- Transformers ---
    ("Power Transformer 400_220kV", "transformer_reactor", 400),
    ("Power Transformer 220_132kV", "transformer_reactor", 220),
    ("Power Transformer 132_33kV", "transformer_reactor", 132),
    ("Auto Transformer", "transformer_reactor", 400),
    ("Station Transformer", "transformer_reactor", 33),
    ("Auxiliary Transformer 33_0.415kV", "transformer_reactor", 0.4),
    
    # --- Reactors ---
    ("Shunt Reactor", "transformer_reactor", 400),
    ("Line Reactor", "transformer_reactor", 400),
    
    # --- Switchgear ---
    ("Circuit Breaker SF6", "switchgear", None),
    ("Circuit Breaker Vacuum", "switchgear", None),
    ("Isolator Disconnector", "switchgear", None),
    ("Isolator with Earth Switch", "switchgear", None),
    ("Bus Coupler", "switchgear", None),
    
    # --- Bays (Modeled as Switchgear Aggregates) ---
    ("Line Bay", "switchgear", None),
    ("Transformer Bay", "switchgear", None),
    ("Feeder Bay", "switchgear", None),
    
    # --- Instrument Transformers ---
    ("CVT Capacitive Voltage Transformer", "instrument", None),
    ("PT Potential Transformer", "instrument", None),
    ("CT Current Transformer", "instrument", None),
    
    # --- Protection ---
    ("Surge Arrester", "instrument", None), # Similar failure modes (leakage)
    ("Wave Trap", "structure", None), # Static but electrical
    
    # --- Structures & Bus ---
    ("Busbar Main", "structure", None),
    ("Busbar Transfer", "structure", None),
    ("Busbar Sectionalizer", "structure", None),
    ("Gantry Structure", "structure", None),
    ("Lightning Mast", "structure", None),
    ("Incoming Transmission Tower", "structure", None),
    ("Dead End Tower", "structure", None),
    
    # --- Control & Aux ---
    ("Control Room Building", "electronics", None),
    ("Relay Panel", "electronics", None),
    ("SCADA Panel", "electronics", None),
    ("PLCC Panel", "electronics", None),
    ("AC Distribution Board", "electronics", None),
    ("DC Distribution Board", "electronics", None),
    
    # --- Power Sources ---
    ("Battery Bank", "battery_system", None),
    ("Battery Charger", "battery_system", None),
    ("Diesel Generator DG", "generator", None)
]

if __name__ == "__main__":
    print(f"Starting Generation for {len(COMPONENT_LIST)} Components...")
    
    for name, cat, kv in COMPONENT_LIST:
        generate_component_data(name, cat, voltage_kv=kv)
        
    print("\nSUCCESS! All datasets generated in 'substation_data' folder.")