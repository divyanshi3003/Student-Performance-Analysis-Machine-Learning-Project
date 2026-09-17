import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
from sklearn.ensemble import RandomForestRegressor

app = FastAPI()

# Allow CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variables
rf_final_score = None
rf_prod_index = None
features = []

# Pydantic model for input data
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

@app.on_event("startup")
def load_and_train_models():
    global rf_final_score, rf_prod_index, features
    
    # Path to the dataset (one directory up from backend)
    csv_path = os.path.join(os.path.dirname(__file__), '..', 'cse_student_performance.csv')
    
    if not os.path.exists(csv_path):
        print(f"Dataset not found at {csv_path}")
        return
        
    df = pd.read_csv(csv_path)
    
    X = df.drop(['student_id', 'final_score', 'productivity_index'], axis=1)
    y_final = df['final_score']
    y_prod = df['productivity_index']
    
    features = list(X.columns)
    
    # Train the models
    rf_final_score = RandomForestRegressor(random_state=42)
    rf_final_score.fit(X, y_final)
    
    rf_prod_index = RandomForestRegressor(n_estimators=50, random_state=42)
    rf_prod_index.fit(X, y_prod)
    
    print("Models successfully trained and loaded.")

@app.post("/predict")
def predict(data: StudentData):
    if not rf_final_score or not rf_prod_index:
        return {"error": "Models are not loaded."}
        
    # Convert input to DataFrame (must match training feature order)
    input_data = pd.DataFrame([data.dict()])[features]
    
    pred_final = rf_final_score.predict(input_data)[0]
    pred_prod = rf_prod_index.predict(input_data)[0]
    
    return {
        "final_score": round(pred_final, 2),
        "productivity_index": round(pred_prod, 2)
    }

@app.get("/")
def read_root():
    return {"message": "EduMetrics ML API is running"}
