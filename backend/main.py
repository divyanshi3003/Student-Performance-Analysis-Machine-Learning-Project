import os
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import io
import sqlite3
from datetime import datetime

app = FastAPI()

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
rf_final_score = None
rf_prod_index = None
features = []
DB_FILE = "predictions.db"

class StudentData(BaseModel):
    study_hours_per_week: float
    attendance_percentage: float
    material_prep_hours: float
    extracurricular_hours: float
    skill_dev_hours: float
    projects_completed: int
    hackathons_participated: int
    internship_experience: int
    coding_platform_rating: float
    previous_gpa: float

def init_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            study_hours REAL,
            attendance REAL,
            previous_gpa REAL,
            predicted_score REAL,
            predicted_productivity REAL
        )
    ''')
    conn.commit()
    conn.close()

def save_prediction(data: dict, score: float, prod: float):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    c.execute('''
        INSERT INTO history (timestamp, study_hours, attendance, previous_gpa, predicted_score, predicted_productivity)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        datetime.now().isoformat(),
        data.get("study_hours_per_week", 0),
        data.get("attendance_percentage", 0),
        data.get("previous_gpa", 0),
        score,
        prod
    ))
    conn.commit()
    conn.close()

@app.on_event("startup")
def load_and_train_models():
    global rf_final_score, rf_prod_index, features
    
    init_db()
    
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'cse_student_performance.csv')
    if not os.path.exists(csv_path):
        print(f"Dataset not found at {csv_path}")
        return
        
    df = pd.read_csv(csv_path)
    X = df.drop(['student_id', 'final_score', 'productivity_index'], axis=1)
    y_final = df['final_score']
    y_prod = df['productivity_index']
    
    features = list(X.columns)
    
    rf_final_score = RandomForestRegressor(random_state=42)
    rf_final_score.fit(X, y_final)
    
    rf_prod_index = RandomForestRegressor(n_estimators=50, random_state=42)
    rf_prod_index.fit(X, y_prod)
    print("Models and DB successfully initialized.")

@app.post("/predict")
def predict(data: StudentData):
    if not rf_final_score or not rf_prod_index:
        return {"error": "Models are not loaded."}
        
    input_dict = data.dict()
    input_data = pd.DataFrame([input_dict])[features]
    
    pred_final = rf_final_score.predict(input_data)[0]
    pred_prod = rf_prod_index.predict(input_data)[0]
    
    final_rounded = round(pred_final, 2)
    prod_rounded = round(pred_prod, 2)
    
    save_prediction(input_dict, final_rounded, prod_rounded)
    
    return {
        "final_score": final_rounded,
        "productivity_index": prod_rounded
    }

@app.post("/predict/batch")
async def predict_batch(file: UploadFile = File(...)):
    if not rf_final_score or not rf_prod_index:
        return {"error": "Models are not loaded."}
        
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        missing_cols = [col for col in features if col not in df.columns]
        if missing_cols:
            return {"error": f"Missing columns in CSV: {', '.join(missing_cols)}"}
            
        input_data = df[features]
        df['predicted_final_score'] = rf_final_score.predict(input_data).round(2)
        df['predicted_productivity_index'] = rf_prod_index.predict(input_data).round(2)
        
        return df.to_dict(orient="records")
    except Exception as e:
        return {"error": str(e)}

@app.get("/history")
def get_history():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute("SELECT * FROM history ORDER BY id DESC LIMIT 50")
    rows = c.fetchall()
    conn.close()
    return [dict(ix) for ix in rows]

@app.get("/")
def read_root():
    return {"message": "EduMetrics ML API is running"}
