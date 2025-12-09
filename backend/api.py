import shutil
import os
import pandas as pd
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from ml_engine import UniversalPredictor

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "temp_uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/analyze")
async def analyze_component(file: UploadFile = File(...)):
    try:
        # 1. Save File
        file_location = os.path.join(UPLOAD_FOLDER, file.filename)
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Run ML Engine
        ai_engine = UniversalPredictor()
        df = ai_engine.load_and_preprocess(file_location)
        ai_engine.train_models(df)
        
        # 3. Get Predictions
        health_analysis = ai_engine.analyze_health(df)
        future_df = ai_engine.predict_future_trends(df, hours=24)
        
        # 4. Return JSON Response
        response = {
            "filename": file.filename,
            "status": "success",
            "health_score": health_analysis['health_score'],
            "rul_days": health_analysis['rul_days'],
            "top_factors": health_analysis['top_factors'], 
            "future_trends": future_df.to_dict(orient="records"),
            "alert_level": "OPTIMAL" if health_analysis['health_score'] > 80 else "WARNING" if health_analysis['health_score'] > 50 else "CRITICAL"
        }
        
        os.remove(file_location)
        return response

    except Exception as e:
        # FIX: MUST USE 'raise', NOT 'return'
        print(f"Error: {str(e)}") # Print error to console for debugging
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)