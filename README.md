# SubStation AI - Predictive Maintenance Platform

A full-stack AI-powered predictive maintenance system for electrical substation equipment monitoring and analysis.

## Architecture

### Frontend (React + TypeScript)
- **Dashboard**: Upload CSV files and preview component data
- **Assets**: Manage 32 substation components with status tracking
- **Monitoring**: Real-time ML analysis with visualizations
- **Reports**: Historical analysis with downloadable reports

### Backend (Python + FastAPI)
- **ML Engine**: RandomForest + LSTM neural networks
- **Data Processing**: Automated feature extraction and scaling
- **Predictive Analytics**: Health scoring and RUL estimation

## Quick Start

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Generate sample data
python generate_data.py

# Start API server
python api.py
```

The backend will run on `http://localhost:8000`

### 2. Frontend Setup

```bash
npm install
npm run dev
```

The frontend will run on `http://localhost:5173`

## Features

### ML Capabilities
- **Health Score Prediction**: RandomForest regression for current health status
- **RUL Estimation**: Remaining Useful Life calculation in days
- **Time Series Forecasting**: LSTM for 24-hour predictive trends
- **Feature Importance**: Automatic risk factor identification

### Component Categories
- Transformers & Reactors (400kV, 220kV, 132kV)
- Switchgear (SF6, Vacuum Circuit Breakers)
- Instrument Transformers (CT, PT, CVT)
- Structures (Lightning Arresters, Busbars)
- Electronics (SCADA, RTU, Relay Panels)
- Battery Systems (DC Banks, UPS)
- Generators (Diesel Backup)

### Data Parameters Analyzed
- Environmental: Temperature, Humidity
- Electrical: Load Current, Voltage, Resistance
- Mechanical: Vibration, Pressure, Operation Count
- Chemical: Dissolved Gases, Moisture Content
- Thermal: Oil Temperature, Winding Temperature

## Usage

1. **Generate Data**: Run `generate_data.py` to create CSV files in `substation_data/` folder
2. **Upload File**: Go to Dashboard and upload any generated CSV
3. **Run Analysis**: Click "Run AI Analysis" to process with ML models
4. **View Results**: Navigate to Monitoring for visualizations and insights
5. **Download Reports**: Export analysis as JSON or CSV from Reports page

## API Endpoints

### POST `/analyze`
Upload CSV file for ML analysis

**Request**: multipart/form-data with CSV file
**Response**:
```json
{
  "filename": "data_transformer.csv",
  "status": "success",
  "health_score": 87.5,
  "rul_days": 1750,
  "alert_level": "OPTIMAL",
  "top_factors": [
    ["dissolved_gas_h2_ppm", 0.85],
    ["oil_temp_c", 0.72]
  ],
  "future_trends": [...]
}
```

## Technology Stack

**Frontend**:
- React 18 + TypeScript
- React Router for navigation
- Recharts for data visualization
- Tailwind CSS for styling
- Lucide React for icons

**Backend**:
- FastAPI for REST API
- Scikit-learn for ML models
- TensorFlow/Keras for deep learning
- Pandas for data processing
- NumPy for numerical computations

## Project Structure

```
/
├── src/
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Assets.tsx
│   │   ├── Monitoring.tsx
│   │   └── Reports.tsx
│   ├── services/
│   │   └── api.ts
│   ├── utils/
│   │   └── storage.ts
│   └── types/
│       └── index.ts
└── backend/
    ├── generate_data.py
    ├── ml_engine.py
    ├── api.py
    └── requirements.txt
```

## ML Model Details

### RandomForest (Health & RUL)
- Ensemble of 100 decision trees
- Max depth: 15
- Trained on all available sensor parameters
- R² accuracy typically > 0.95

### LSTM (Forecasting)
- 64 LSTM units with dropout
- 24-hour sequence input
- Multi-feature output prediction
- Early stopping with patience=3

## Alert Levels

- **OPTIMAL**: Health Score > 80 (Green)
- **WARNING**: Health Score 50-80 (Yellow)
- **CRITICAL**: Health Score < 50 (Red)

## Data Storage

Analysis results are stored locally using browser localStorage. For production deployment, integrate with a database system.

## Contributing

This is a demo/educational project showcasing ML integration with modern web technologies for industrial IoT applications.
