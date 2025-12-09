import pandas as pd
import numpy as np
import joblib
import os

# Scikit-Learn for Health Scoring & Root Cause Analysis
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score

# TensorFlow/Keras for Time-Series Forecasting
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping

class UniversalPredictor:
    def __init__(self):
        # Model 1: Health Estimator (Complex non-linear interactions)
        self.health_model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
        
        # Model 2: RUL Estimator (Remaining Life)
        self.rul_model = RandomForestRegressor(n_estimators=100, max_depth=15, random_state=42)
        
        # Model 3: Time-Series Forecaster (Deep Learning)
        self.forecast_model = None
        
        self.scaler = MinMaxScaler()
        self.feature_cols = []
        self.target_cols = ['health_score', 'estimated_life_remaining_days']

    def load_and_preprocess(self, filepath):
        """
        Dynamically loads ANY component file (Breaker, Transformer, etc.)
        and automatically detects which columns are sensor features.
        """
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"File not found: {filepath}")
            
        df = pd.read_csv(filepath)
        
        # Filter: All numeric columns except timestamp and targets are Features
        numeric_df = df.select_dtypes(include=[np.number])
        self.feature_cols = [c for c in numeric_df.columns if c not in self.target_cols]
        
        print(f"   [+] Detected {len(self.feature_cols)} Engineering Factors: {self.feature_cols}")
        return df

    def train_models(self, df):
        """
        Trains the specific AI models for the loaded component type.
        """
        print("   [+] Preprocessing Data...")
        X = df[self.feature_cols]
        y_health = df['health_score']
        y_rul = df['estimated_life_remaining_days']
        
        # --- 1. Train Health & RUL Models (Random Forest) ---
        print("   [+] Training Diagnostic Engines (RF)...")
        X_train, X_test, y_h_train, y_h_test = train_test_split(X, y_health, test_size=0.2, random_state=42)
        self.health_model.fit(X_train, y_h_train)
        
        self.rul_model.fit(X, y_rul) # Train on full data for better RUL context
        
        score = self.health_model.score(X_test, y_h_test)
        print(f"   [+] Diagnostic Accuracy (R²): {score:.4f}")

        # --- 2. Train Forecasting Model (LSTM) ---
        print("   [+] Training Future Forecaster (LSTM Deep Learning)...")
        # Prepare sequences (Look back 24h to predict next step)
        data_values = self.scaler.fit_transform(X)
        X_seq, y_seq = [], []
        seq_len = 24 
        
        for i in range(len(data_values) - seq_len):
            X_seq.append(data_values[i:i+seq_len])
            y_seq.append(data_values[i+seq_len])
            
        X_seq, y_seq = np.array(X_seq), np.array(y_seq)
        
        # Build LSTM Architecture
        model = Sequential()
        model.add(LSTM(64, return_sequences=False, input_shape=(seq_len, len(self.feature_cols))))
        model.add(Dropout(0.2))
        model.add(Dense(32, activation='relu'))
        model.add(Dense(len(self.feature_cols))) # Output layer predicts ALL sensor values
        
        model.compile(optimizer='adam', loss='mse')
        
        # Fast training with Early Stopping
        es = EarlyStopping(monitor='loss', patience=3, restore_best_weights=True)
        model.fit(X_seq, y_seq, epochs=10, batch_size=32, verbose=0, callbacks=[es])
        
        self.forecast_model = model
        print("   [+] Forecasting Engine Ready.")

    def analyze_health(self, df):
        """
        Analyzes the LATEST data point to determine status and Root Cause.
        """
        latest_data = df.iloc[[-1]][self.feature_cols]
        
        # 1. Predictions
        current_health = self.health_model.predict(latest_data)[0]
        predicted_rul = self.rul_model.predict(latest_data)[0]
        
        # 2. Root Cause Analysis (Feature Importance)
        # Which factor contributed most to this specific component's model?
        importances = self.health_model.feature_importances_
        factor_ranking = sorted(zip(self.feature_cols, importances), key=lambda x: x[1], reverse=True)
        
        # Get Top 3 Drivers of Health
        top_factors = factor_ranking[:3]
        
        return {
            'health_score': round(current_health, 2),
            'rul_days': round(predicted_rul, 1),
            'top_factors': top_factors # List of (Factor Name, Importance %)
        }

    def predict_future_trends(self, df, hours=24):
        """
        Predicts how the sensors will behave over the next 24 hours.
        """
        last_sequence = self.scaler.transform(df[self.feature_cols].tail(24))
        current_seq = last_sequence.reshape(1, 24, len(self.feature_cols))
        
        predictions = []
        for _ in range(hours):
            pred_scaled = self.forecast_model.predict(current_seq, verbose=0)
            predictions.append(pred_scaled[0])
            # Slide window: drop first, add new prediction
            current_seq = np.append(current_seq[:, 1:, :], [pred_scaled], axis=1)
            
        pred_array = self.scaler.inverse_transform(predictions)
        return pd.DataFrame(pred_array, columns=self.feature_cols)