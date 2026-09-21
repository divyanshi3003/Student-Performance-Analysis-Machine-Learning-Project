import os
import joblib
import pandas as pd
import shap
from typing import Dict, Any, List

class MLService:
    def __init__(self):
        artifacts_dir = os.path.join(os.path.dirname(__file__), '../../../ml/artifacts/v1')
        self.reg_pipe = joblib.load(os.path.join(artifacts_dir, 'best_regressor.joblib'))
        self.clf_pipe = joblib.load(os.path.join(artifacts_dir, 'best_classifier.joblib'))
        self.le = joblib.load(os.path.join(artifacts_dir, 'label_encoder.joblib'))
        self.version_tag = "v1.0.0"
        
        # Initialize SHAP explainer for the regressor
        try:
            model = self.reg_pipe.named_steps['model']
            self.explainer = shap.TreeExplainer(model)
        except Exception as e:
            print(f"Failed to initialize SHAP: {e}")
            self.explainer = None

    def predict_single(self, data: Dict[str, Any]) -> Dict[str, Any]:
        df = pd.DataFrame([data])
        
        score = self.reg_pipe.predict(df)[0]
        category_encoded = self.clf_pipe.predict(df)[0]
        category = self.le.inverse_transform([category_encoded])[0]
        
        confidence = 0.95
        if hasattr(self.clf_pipe.named_steps['model'], 'predict_proba'):
            proba = self.clf_pipe.predict_proba(df)[0]
            confidence = float(max(proba))
            
        # Calculate SHAP feature importances
        feature_drivers = []
        if self.explainer:
            try:
                # Need to transform data first
                X_transformed = self.reg_pipe.named_steps['preprocessor'].transform(df)
                # Ensure it's a dense array for SHAP
                if hasattr(X_transformed, 'toarray'):
                    X_transformed = X_transformed.toarray()
                    
                shap_values = self.explainer.shap_values(X_transformed)
                # Get feature names from preprocessor
                feature_names = self.reg_pipe.named_steps['preprocessor'].get_feature_names_out()
                
                # Pair features with their SHAP value (impact)
                impacts = []
                for name, val in zip(feature_names, shap_values[0]):
                    impacts.append({
                        "feature": name.split('__')[-1], # clean up names like 'num__attendance'
                        "impact": float(val)
                    })
                
                # Sort by absolute impact to get top drivers
                impacts.sort(key=lambda x: abs(x["impact"]), reverse=True)
                feature_drivers = impacts[:5] # Top 5 drivers
            except Exception as e:
                print(f"SHAP calculation error: {e}")
                
        return {
            "predicted_score": float(score),
            "predicted_category": category,
            "confidence": confidence,
            "feature_drivers": feature_drivers
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
