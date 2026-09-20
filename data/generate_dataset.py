import pandas as pd
import numpy as np
import os
import random

def generate_dataset(num_samples=5000, seed=42):
    np.random.seed(seed)
    random.seed(seed)

    # Identifiers / Demographics
    student_ids = [f"STU{str(i).zfill(4)}" for i in range(1, num_samples + 1)]
    departments = np.random.choice(['CSE', 'CSE-AIML', 'CSE-DS', 'IT', 'ECE'], num_samples, p=[0.4, 0.2, 0.15, 0.15, 0.1])
    semesters = np.random.randint(1, 9, num_samples)
    genders = np.random.choice(['Male', 'Female', 'Other'], num_samples, p=[0.55, 0.43, 0.02])
    hostels = np.random.choice(['Hostel', 'Day Scholar'], num_samples, p=[0.6, 0.4])

    # Categorical
    study_prefs = np.random.choice(['Morning', 'Afternoon', 'Night'], num_samples, p=[0.3, 0.2, 0.5])
    learning_styles = np.random.choice(['Visual', 'Auditory', 'Kinesthetic'], num_samples)
    
    # Sleep & Stress are correlated
    base_stress = np.random.choice(['Low', 'Medium', 'High'], num_samples, p=[0.3, 0.5, 0.2])
    sleep_quality = []
    for s in base_stress:
        if s == 'High':
            sleep_quality.append(np.random.choice(['Poor', 'Average', 'Good'], p=[0.6, 0.3, 0.1]))
        elif s == 'Low':
            sleep_quality.append(np.random.choice(['Poor', 'Average', 'Good'], p=[0.1, 0.3, 0.6]))
        else:
            sleep_quality.append(np.random.choice(['Poor', 'Average', 'Good'], p=[0.2, 0.6, 0.2]))
            
    internet = np.random.choice(['Poor', 'Average', 'Good'], num_samples, p=[0.1, 0.3, 0.6])
    part_time = np.random.choice(['Yes', 'No'], num_samples, p=[0.15, 0.85])
    mentor = np.random.choice(['Yes', 'No'], num_samples, p=[0.4, 0.6])
    
    placement_status = []
    for sem in semesters:
        if sem < 6:
            placement_status.append('Not Started')
        elif sem == 6:
            placement_status.append(np.random.choice(['Not Started', 'In Progress'], p=[0.8, 0.2]))
        elif sem == 7:
            placement_status.append(np.random.choice(['In Progress', 'Placed'], p=[0.6, 0.4]))
        else: # sem 8
            placement_status.append(np.random.choice(['In Progress', 'Placed'], p=[0.3, 0.7]))

    # Time Features
    # study minutes per day: mostly 1-5 hours (60 - 300 mins), some up to 8 hours (480 mins)
    study_mins = np.clip(np.random.normal(180, 90, num_samples), 0, 600).astype(int)
    mat_prep_mins = np.clip(np.random.normal(240, 120, num_samples), 0, 1200).astype(int)
    extra_mins = np.clip(np.random.normal(120, 100, num_samples), 0, 1200).astype(int)
    skill_dev_mins = np.clip(np.random.normal(300, 200, num_samples), 0, 1500).astype(int)
    
    # Enforce feasibility: total minutes per day max 14 hours (840 mins)
    for i in range(num_samples):
        daily_total = study_mins[i] + (mat_prep_mins[i] + extra_mins[i] + skill_dev_mins[i]) / 7
        if daily_total > 840:
            scale = 840 / daily_total
            study_mins[i] = int(study_mins[i] * scale)
            mat_prep_mins[i] = int(mat_prep_mins[i] * scale)
            extra_mins[i] = int(extra_mins[i] * scale)
            skill_dev_mins[i] = int(skill_dev_mins[i] * scale)

    # Academic
    attendance = np.clip(np.random.normal(82, 12, num_samples), 0, 100).round(1)
    # Correlation with study_mins and attendance
    prev_score_base = 40 + (attendance * 0.3) + (study_mins / 60 * 2) + np.random.normal(0, 5, num_samples)
    prev_score = np.clip(prev_score_base, 0, 100).round(1)
    
    prev_gpa = np.clip(prev_score / 10 + np.random.normal(0, 0.5, num_samples), 0, 10.0).round(2)
    
    # Backlogs inversely proportional to prev_gpa
    backlogs = np.where(prev_gpa > 8.0, 0,
               np.where(prev_gpa > 6.5, np.random.choice([0, 1, 2], num_samples, p=[0.8, 0.15, 0.05]),
               np.random.choice([0, 1, 2, 3, 4, 5], num_samples, p=[0.2, 0.3, 0.2, 0.15, 0.1, 0.05])))
               
    internal_marks = np.clip((prev_score / 100) * 50 + np.random.normal(0, 3, num_samples), 0, 50).astype(int)

    # Activities
    projects = np.clip(np.random.poisson(semesters * 0.8), 0, 20)
    hackathons = np.clip(np.random.poisson(semesters * 0.3), 0, 10)
    internships = np.clip(np.random.poisson((semesters - 2).clip(0) * 0.3), 0, 5)
    certs = np.clip(np.random.poisson(semesters * 0.5), 0, 10)
    
    # Coding strongly correlates with skill_dev_mins and semester
    coding_probs = np.clip((skill_dev_mins / 10) * semesters + np.random.normal(0, 50, num_samples), 0, 2000).astype(int)
    coding_rating = np.clip(1000 + coding_probs * 0.5 + np.random.normal(0, 150, num_samples), 500, 3000).astype(int)

    # Build DataFrame
    df = pd.DataFrame({
        'student_id': student_ids,
        'department': departments,
        'semester': semesters,
        'gender': genders,
        'hostel_or_dayscholar': hostels,
        'study_time_preference': study_prefs,
        'learning_style': learning_styles,
        'sleep_quality': sleep_quality,
        'stress_level': base_stress,
        'internet_access_quality': internet,
        'part_time_job': part_time,
        'mentor_support': mentor,
        'placement_status': placement_status,
        
        'study_minutes_per_day': study_mins,
        'material_prep_minutes_per_week': mat_prep_mins,
        'extracurricular_minutes_per_week': extra_mins,
        'skill_dev_minutes_per_week': skill_dev_mins,
        
        'attendance_percentage': attendance,
        'previous_year_score': prev_score,
        'previous_semester_gpa': prev_gpa,
        'backlogs_count': backlogs,
        'internal_marks': internal_marks,
        
        'projects_completed': projects,
        'hackathons_participated': hackathons,
        'internships_completed': internships,
        'certifications_count': certs,
        'coding_problems_solved': coding_probs,
        'coding_platform_rating': coding_rating
    })

    # Compute Targets
    # 1. Productivity Index
    prod_idx = 50.0 \
               + (df['study_minutes_per_day'] / 60) * 3 \
               + (df['skill_dev_minutes_per_week'] / 60) * 1.5 \
               + (df['projects_completed'] * 2) \
               + (df['coding_problems_solved'] / 100) \
               - df['stress_level'].map({'High': 10, 'Medium': 5, 'Low': 0}) \
               - df['sleep_quality'].map({'Poor': 10, 'Average': 0, 'Good': -5}) \
               + df['mentor_support'].map({'Yes': 5, 'No': 0}) \
               - df['internet_access_quality'].map({'Poor': 10, 'Average': 0, 'Good': 0})
               
    prod_idx += np.random.normal(0, 3, num_samples)
    df['productivity_index'] = np.clip(prod_idx, 0, 100).round(2)

    # 2. Final Score
    f_score = 20.0 \
              + (df['previous_semester_gpa'] * 3) \
              + (df['attendance_percentage'] * 0.2) \
              + (df['internal_marks'] * 0.4) \
              + (df['productivity_index'] * 0.1) \
              - (df['backlogs_count'] * 2) \
              - df['part_time_job'].map({'Yes': 3, 'No': 0}) \
              + np.where((df['learning_style'] == 'Kinesthetic') & (df['projects_completed'] >= 2), 2, 0)
              
    f_score += np.random.normal(0, 2, num_samples)
    df['final_score'] = np.clip(f_score, 0, 100).round(2)

    # 3. Performance Category
    conditions = [
        (df['final_score'] < 50),
        (df['final_score'] >= 50) & (df['final_score'] < 70),
        (df['final_score'] >= 70) & (df['final_score'] < 85),
        (df['final_score'] >= 85)
    ]
    choices = ['Low', 'Average', 'Good', 'Excellent']
    df['performance_category'] = np.select(conditions, choices, default='Unknown')

    # Add missing values (2% in specific cols)
    cols_to_miss = ['study_time_preference', 'internet_access_quality', 'certifications_count']
    for col in cols_to_miss:
        mask = np.random.rand(num_samples) < 0.02
        df.loc[mask, col] = np.nan

    # Save
    out_path = os.path.join(os.path.dirname(__file__), 'student_performance_v2.csv')
    df.to_csv(out_path, index=False)
    print(f"Dataset generated successfully with {num_samples} rows at {out_path}")

if __name__ == "__main__":
    generate_dataset()
