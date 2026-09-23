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
    save: bool = True,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Get student reference
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    student_id = student.id if student else None
    
    # Run ML Inference
    try:
        result = ml_service.predict_single(request.features)
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=f"ML Validation Error: {str(ve)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"ML Inference failed: {str(e)}")
        
    if not save:
        # Just return the prediction without saving
        return {
            "prediction_id": -1, # Ephemeral
            "predicted_score": float(result["predicted_score"]),
            "predicted_category": result["predicted_category"],
            "confidence": result.get("confidence", 0.0),
            "feature_drivers": result.get("feature_drivers", [])
        }

    try:
        # Get model version
        mv = get_or_create_model_version(db, ml_service.version_tag)
        
        # Save Prediction to DB
        pred = Prediction(
            student_id=student_id,
            model_version_id=mv.id,
            predicted_score=float(result["predicted_score"]),
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
            "confidence": result.get("confidence", 0.0),
            "feature_drivers": result.get("feature_drivers", [])
        }
    except Exception as db_err:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error while saving prediction: {str(db_err)}")

@router.get("/predictions")
def get_predictions(db: Session = Depends(get_db), current_user: User = Depends(get_current_student)):
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

@router.get("/summary")
def get_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_student)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    preds = db.query(Prediction).filter(Prediction.student_id == student.id).order_by(Prediction.predicted_at.desc()).all()
    
    if not preds:
        return {
            "total_assessments": 0,
            "average_score": None,
            "highest_score": None,
            "latest_score": None,
            "latest_feature_drivers": []
        }
        
    scores = [p.predicted_score for p in preds]
    latest_pred = preds[0]
    
    # We re-run inference on the latest input features to get the feature drivers
    # since we don't store the drivers in the DB, only the features.
    drivers = []
    if latest_pred.input_features:
        try:
            result = ml_service.predict_single(latest_pred.input_features)
            drivers = result.get("feature_drivers", [])
        except Exception:
            pass # degrade gracefully
            
    return {
        "total_assessments": len(scores),
        "average_score": sum(scores) / len(scores),
        "highest_score": max(scores),
        "latest_score": latest_pred.predicted_score,
        "latest_feature_drivers": drivers
    }
