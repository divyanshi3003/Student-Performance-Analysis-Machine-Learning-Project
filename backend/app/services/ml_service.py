import os
import joblib
import pandas as pd
from typing import Dict, Any, List

class MLService:
    def __init__(self):
        artifacts_dir = os.path.join(os.path.dirname(__file__), '../../../ml/artifacts/v1')
        self.reg_pipe = joblib.load(os.path.join(artifacts_dir, 'best_regressor.joblib'))
        self.clf_pipe = joblib.load(os.path.join(artifacts_dir, 'best_classifier.joblib'))
        self.le = joblib.load(os.path.join(artifacts_dir, 'label_encoder.joblib'))
        self.version_tag = "v1.0.0"

    def predict_single(self, data: Dict[str, Any]) -> Dict[str, Any]:
        df = pd.DataFrame([data])
        
        score = self.reg_pipe.predict(df)[0]
        category_encoded = self.clf_pipe.predict(df)[0]
        category = self.le.inverse_transform([category_encoded])[0]
        
        # Calculate a pseudo-confidence score for classification based on decision function if available
        # But we'll just use a mock logic for now since LogisticRegression has predict_proba
        confidence = 0.95
        if hasattr(self.clf_pipe.named_steps['model'], 'predict_proba'):
            proba = self.clf_pipe.predict_proba(df)[0]
            confidence = float(max(proba))
            
        return {
            "predicted_score": float(score),
            "predicted_category": category,
            "confidence": confidence
        }
        
    def predict_batch(self, data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        df = pd.DataFrame(data_list)
        
        scores = self.reg_pipe.predict(df)
        categories_encoded = self.clf_pipe.predict(df)
        categories = self.le.inverse_transform(categories_encoded)
        
        results = []
        for i in range(len(data_list)):
            results.append({
                "predicted_score": float(scores[i]),
                "predicted_category": categories[i],
                "confidence": 0.95 # Simplified batch confidence
            })
            
        return results

ml_service = MLService()
