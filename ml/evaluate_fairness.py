import os
import pandas as pd
import numpy as np
import joblib
from sklearn.metrics import mean_absolute_error

def evaluate_fairness():
    print("Evaluating Model Fairness...")
    
    # 1. Load Data
    data_path = os.path.join(os.path.dirname(__file__), '../data/student_performance_v2.csv')
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return
        
    df = pd.read_csv(data_path)
    
    # 2. Load Model
    artifacts_dir = os.path.join(os.path.dirname(__file__), 'artifacts/v1')
    reg_path = os.path.join(artifacts_dir, 'best_regressor.joblib')
    
    if not os.path.exists(reg_path):
        print(f"Error: Model not found at {reg_path}")
        return
        
    model = joblib.load(reg_path)
    
    # 3. Predict
    # Drop targets
    X = df.drop(columns=['final_score', 'performance_category'])
    y_true = df['final_score']
    
    y_pred = model.predict(X)
    df['predicted_score'] = y_pred
    df['error'] = np.abs(df['predicted_score'] - y_true)
    
    # 4. Evaluate across Demographics
    print("\n--- Fairness by Gender ---")
    gender_metrics = df.groupby('gender')['error'].mean().reset_index()
    gender_metrics.rename(columns={'error': 'Mean Absolute Error (MAE)'}, inplace=True)
    print(gender_metrics.to_string(index=False))
    
    print("\n--- Fairness by Department ---")
    dept_metrics = df.groupby('department')['error'].mean().reset_index()
    dept_metrics.rename(columns={'error': 'Mean Absolute Error (MAE)'}, inplace=True)
    print(dept_metrics.to_string(index=False))
    
    # Analyze disparities
    max_gender_diff = gender_metrics['Mean Absolute Error (MAE)'].max() - gender_metrics['Mean Absolute Error (MAE)'].min()
    max_dept_diff = dept_metrics['Mean Absolute Error (MAE)'].max() - dept_metrics['Mean Absolute Error (MAE)'].min()
    
    print("\n--- Disparity Analysis ---")
    print(f"Maximum MAE difference across genders: {max_gender_diff:.3f}")
    print(f"Maximum MAE difference across departments: {max_dept_diff:.3f}")
    
    if max_gender_diff > 2.0 or max_dept_diff > 2.0:
        print("\nWARNING: High disparity detected. Model may be biased towards certain demographics.")
    else:
        print("\nSUCCESS: Model performs relatively fairly across evaluated demographics.")

if __name__ == "__main__":
    evaluate_fairness()
