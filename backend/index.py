import os
import pandas as pd
from ml_engine import UniversalPredictor

DATA_FOLDER = "substation_data"

def list_available_components():
    files = [f for f in os.listdir(DATA_FOLDER) if f.endswith('.csv')]
    print("\n=== AVAILABLE COMPONENT DATASETS ===")
    for i, f in enumerate(files):
        print(f" [{i+1}] {f}")
    return files

def main():
    print("=======================================================")
    print("   AI-POWERED SUBSTATION ASSET MANAGEMENT SYSTEM")
    print("=======================================================")
    
    # 1. Select Component
    files = list_available_components()
    if not files:
        print(f"No data found in {DATA_FOLDER}. Please run 'generate_data.py' first.")
        return

    try:
        choice = int(input("\nSelect component ID to analyze (e.g., 1): ")) - 1
        filename = files[choice]
        filepath = os.path.join(DATA_FOLDER, filename)
    except (ValueError, IndexError):
        print("Invalid selection.")
        return

    # 2. Initialize Engine
    print(f"\n>>> Initializing AI Core for: {filename}...")
    ai_engine = UniversalPredictor()
    
    # 3. Load & Train
    df = ai_engine.load_and_preprocess(filepath)
    ai_engine.train_models(df)
    
    # 4. Analyze Current State
    print("\n>>> Performing Root Cause Analysis...")
    analysis = ai_engine.analyze_health(df)
    
    # 5. Forecast Future
    print(">>> Simulating Future Stress (Next 24 Hours)...")
    future_df = ai_engine.predict_future_trends(df)
    
    # ================= REPORT GENERATION =================
    print("\n" + "#"*60)
    print(f"   ASSET HEALTH REPORT: {filename.replace('data_', '').replace('.csv', '').upper()}")
    print("#"*60)
    
    # Health Status
    h = analysis['health_score']
    status = "OPTIMAL" if h > 80 else "WARNING" if h > 50 else "CRITICAL FAILURE"
    print(f"\nCURRENT HEALTH:    {h}%  [{status}]")
    print(f"REM. USEFUL LIFE:  {analysis['rul_days']} Days")
    
    # Root Cause Analysis
    print("\n---------------------------------------------------")
    print(" PRIMARY HEALTH DRIVERS (Root Cause Analysis)")
    print("---------------------------------------------------")
    print("The AI has identified these factors as most critical:")
    for factor, weight in analysis['top_factors']:
        print(f"  • {factor.ljust(30)} : Impact {weight*100:.1f}%")
        
    # Future Forecast (Show only key columns for clarity)
    print("\n---------------------------------------------------")
    print(" PREDICTIVE TRENDS (Next 5 Hours)")
    print("---------------------------------------------------")
    # Dynamically pick the top factor to show in the forecast
    top_factor_name = analysis['top_factors'][0][0]
    cols_to_show = [top_factor_name]
    
    # Add temperature if it exists, otherwise add another factor
    if 'internal_temp_c' in future_df.columns:
        cols_to_show.append('internal_temp_c')
    elif 'oil_temp_c' in future_df.columns:
         cols_to_show.append('oil_temp_c')
         
    print(future_df[cols_to_show].head(5).to_string(index=False))
    
    print("\n" + "="*60)
    if status == "CRITICAL FAILURE":
        print(" !!! ACTION REQUIRED: DISPATCH MAINTENANCE TEAM IMMEDIATELY !!!")
    elif status == "WARNING":
        print(" ! ADVISORY: Schedule inspection during next outage window.")
    else:
        print(" SYSTEM NORMAL: Continue standard monitoring.")

if __name__ == "__main__":
    main()