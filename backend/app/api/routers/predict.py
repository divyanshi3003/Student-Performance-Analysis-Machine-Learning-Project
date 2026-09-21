from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user, get_current_student
from app.models import User, Prediction, ModelVersion, Student
from app.schemas.predict import PredictionRequest, PredictionResponse
from app.services.ml_service import ml_service
import json

router = APIRouter()

def get_or_create_model_version(db: Session, version_tag: str):
    mv = db.query(ModelVersion).filter(ModelVersion.version_tag == version_tag).first()
    if not mv:
        mv = ModelVersion(version_tag=version_tag, description="Auto-registered model")
        db.add(mv)
        db.commit()
        db.refresh(mv)
    return mv

@router.post("/single", response_model=PredictionResponse)
def predict_single(
    request: PredictionRequest, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Get student reference
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    student_id = student.id if student else None
    
    # Run ML Inference
    try:
        result = ml_service.predict_single(request.features)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ML Inference failed: {str(e)}")
        
    # Get model version
    mv = get_or_create_model_version(db, ml_service.version_tag)
    
    # Save Prediction to DB
    pred = Prediction(
        student_id=student_id,
        model_version_id=mv.id,
        predicted_score=result["predicted_score"],
        predicted_category=result["predicted_category"],
        input_features=request.features
    )
    db.add(pred)
    db.commit()
    db.refresh(pred)
    
    return {
        "prediction_id": pred.id,
        "predicted_score": pred.predicted_score,
        "predicted_category": pred.predicted_category,
        "confidence": result["confidence"]
    }

@router.get("/history")
def get_prediction_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_student)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    preds = db.query(Prediction).filter(Prediction.student_id == student.id).order_by(Prediction.predicted_at.desc()).limit(10).all()
    
    return [
        {
            "id": p.id,
            "predicted_score": p.predicted_score,
            "predicted_category": p.predicted_category,
            "predicted_at": p.predicted_at
        } for p in preds
    ]
