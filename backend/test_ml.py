import sys
import os
sys.path.append(os.path.abspath('.'))

from app.services.ml_service import ml_service

payload = {
    'student_identifier': 'STU001',
    'department': 'CSE',
    'semester': 1,
    'gender': 'Male',
    'hostel_or_dayscholar': 'Dayscholar',
    'study_time_preference': 'Morning',
    'learning_style': 'Visual',
    'sleep_quality': 'Average',
    'stress_level': 'Medium',
    'internet_access_quality': 'Good',
    'part_time_job': 'No',
    'mentor_support': 'Yes',
    'placement_status': 'Not Started',
    'attendance_percentage': 80.0,
    'previous_year_score': 85.0,
    'previous_semester_gpa': 8.5,
    'backlogs_count': 0,
    'internal_marks': 40,
    'study_minutes_per_day': 120,
    'material_prep_minutes_per_week': 60,
    'extracurricular_minutes_per_week': 30,
    'skill_dev_minutes_per_week': 60,
    'projects_completed': 1,
    'hackathons_participated': 0,
    'internships_completed': 0,
    'certifications_count': 1,
    'coding_problems_solved': 50,
    'coding_platform_rating': 1200
}

try:
    result = ml_service.predict_single(payload)
    print("Success:", result)
except Exception as e:
    print("Error:", e)
