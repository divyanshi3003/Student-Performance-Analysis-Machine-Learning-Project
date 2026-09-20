import pandas as pd
import numpy as np

def validate_dataset():
    df = pd.read_csv('student_performance_v2.csv')
    
    print("="*50)
    print("DATASET VALIDATION REPORT")
    print("="*50)
    
    passed_all = True
    
    # 1. Duplicates
    num_duplicates = df.duplicated(subset=['student_id']).sum()
    if num_duplicates == 0:
        print("[PASS] No duplicate student_ids found.")
    else:
        print(f"[FAIL] Found {num_duplicates} duplicate student_ids.")
        passed_all = False
        
    # 2. Feasibility logic rules
    # Check max daily hours
    total_mins_daily = df['study_minutes_per_day'] + (df['material_prep_minutes_per_week'] + df['extracurricular_minutes_per_week'] + df['skill_dev_minutes_per_week']) / 7
    if (total_mins_daily <= 840).all():
        print("[PASS] All students have feasible daily schedules (<= 14 hours).")
    else:
        print("[FAIL] Some students exceed 14 hours of daily activities.")
        passed_all = False
        
    # 3. Ranges
    if (df['attendance_percentage'] >= 0).all() and (df['attendance_percentage'] <= 100).all():
        print("[PASS] Attendance is within 0-100.")
    else:
        print("[FAIL] Attendance out of bounds.")
        passed_all = False
        
    if (df['final_score'] >= 0).all() and (df['final_score'] <= 100).all():
        print("[PASS] Final Score is within 0-100.")
    else:
        print("[FAIL] Final Score out of bounds.")
        passed_all = False

    # 4. Missing values
    missing_cols = ['study_time_preference', 'internet_access_quality', 'certifications_count']
    has_missing = all(df[col].isna().sum() > 0 for col in missing_cols)
    if has_missing:
        print("[PASS] Correct columns have injected missing values.")
    else:
        print("[FAIL] Missing values not injected correctly.")
        passed_all = False
        
    # 5. Class balance
    print("\n--- Class Balances ---")
    cat_cols = ['performance_category', 'placement_status', 'sleep_quality']
    for col in cat_cols:
        print(f"\n{col.upper()}:")
        print(df[col].value_counts(normalize=True).round(3) * 100)
        
    # 6. Basic Correlations
    print("\n--- Key Correlations ---")
    # numeric only
    num_df = df.select_dtypes(include=[np.number])
    corr_matrix = num_df.corr()
    
    corr_study_prod = corr_matrix.loc['study_minutes_per_day', 'productivity_index']
    corr_att_score = corr_matrix.loc['attendance_percentage', 'final_score']
    corr_prev_score = corr_matrix.loc['previous_semester_gpa', 'final_score']
    
    print(f"Study Mins vs Productivity Index: {corr_study_prod:.2f}")
    print(f"Attendance vs Final Score: {corr_att_score:.2f}")
    print(f"Prev Semester GPA vs Final Score: {corr_prev_score:.2f}")
    
    if corr_study_prod > 0.1 and corr_att_score > 0.05 and corr_prev_score > 0.1:
        print("[PASS] Logical correlations are present.")
    else:
        print("[WARNING] Expected correlations are weak.")
        
    print("="*50)
    if passed_all:
        print("OVERALL RESULT: PASS")
    else:
        print("OVERALL RESULT: FAIL")
    print("="*50)

if __name__ == "__main__":
    validate_dataset()
