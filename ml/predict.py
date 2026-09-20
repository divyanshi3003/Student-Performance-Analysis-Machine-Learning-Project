import os
import joblib
import pandas as pd

def predict_student(data_dict):
    artifacts_dir = os.path.join(os.path.dirname(__file__), 'artifacts', 'v1')
    
    reg_pipe = joblib.load(os.path.join(artifacts_dir, 'best_regressor.joblib'))
    clf_pipe = joblib.load(os.path.join(artifacts_dir, 'best_classifier.joblib'))
    le = joblib.load(os.path.join(artifacts_dir, 'label_encoder.joblib'))
    
    df = pd.DataFrame([data_dict])
    
    score = reg_pipe.predict(df)[0]
    category_encoded = clf_pipe.predict(df)[0]
    category = le.inverse_transform([category_encoded])[0]
    
    return {
        "predicted_final_score": float(score),
        "predicted_performance_category": category
    }

if __name__ == '__main__':
    # Sample Test
    sample = {
        'department': 'CSE',
        'semester': 6,
        'gender': 'Female',
        'hostel_or_dayscholar': 'Hostel',
        'study_time_preference': 'Night',
        'learning_style': 'Visual',
        'sleep_quality': 'Good',
        'stress_level': 'Low',
        'internet_access_quality': 'Good',
        'part_time_job': 'No',
        'mentor_support': 'Yes',
        'placement_status': 'In Progress',
        'study_minutes_per_day': 180,
        'material_prep_minutes_per_week': 200,
        'extracurricular_minutes_per_week': 120,
        'skill_dev_minutes_per_week': 300,
        'attendance_percentage': 85.5,
        'previous_year_score': 80.0,
        'previous_semester_gpa': 8.5,
        'backlogs_count': 0,
        'internal_marks': 45,
        'projects_completed': 3,
        'hackathons_participated': 1,
        'internships_completed': 1,
        'certifications_count': 2,
        'coding_problems_solved': 150,
        'coding_platform_rating': 1600
    }
    res = predict_student(sample)
    print("Sample Prediction:", res)
