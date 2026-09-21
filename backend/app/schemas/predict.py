from pydantic import BaseModel
from typing import Dict, Any, List

class PredictionRequest(BaseModel):
    features: Dict[str, Any]

class BatchPredictionRequest(BaseModel):
    items: List[PredictionRequest]

class PredictionResponse(BaseModel):
    prediction_id: int
    predicted_score: float
    predicted_category: str
    confidence: float
    feature_drivers: List[Dict[str, Any]] = []
    
class BatchPredictionResponse(BaseModel):
    results: List[PredictionResponse]
