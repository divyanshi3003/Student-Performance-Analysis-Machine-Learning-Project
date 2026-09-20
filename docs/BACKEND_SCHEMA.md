# Backend Schema and API Contract
**Project Name:** EduMetrics ML (Student Performance Analysis)
**Phase:** 6

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    USERS ||--o{ STUDENTS : "is a"
    USERS {
        int id PK
        string email UK
        string hashed_password
        string role "student, teacher, admin"
        datetime created_at
    }
    
    STUDENTS ||--o{ PREDICTIONS : makes
    STUDENTS {
        int id PK
        int user_id FK
        string student_identifier "STU0001"
        string department
        int semester
        string gender
        string hostel_or_dayscholar
        string study_time_preference
        string learning_style
        string sleep_quality
        string stress_level
        string internet_access_quality
        string part_time_job
        string mentor_support
        string placement_status
    }

    STUDENTS ||--o{ ACADEMIC_RECORDS : has
    ACADEMIC_RECORDS {
        int id PK
        int student_id FK
        float attendance_percentage
        float previous_year_score
        float previous_semester_gpa
        int backlogs_count
        int internal_marks
        datetime updated_at
    }
    
    STUDENTS ||--o{ STUDY_LOGS : logs
    STUDY_LOGS {
        int id PK
        int student_id FK
        int study_minutes_per_day
        int material_prep_minutes_per_week
        int extracurricular_minutes_per_week
        int skill_dev_minutes_per_week
        int projects_completed
        int hackathons_participated
        int internships_completed
        int certifications_count
        int coding_problems_solved
        int coding_platform_rating
        datetime logged_at
    }

    PREDICTIONS {
        int id PK
        int student_id FK
        int model_version_id FK
        float predicted_score
        string predicted_category
        json input_features "Snapshot of data"
        datetime predicted_at
    }
    
    MODEL_VERSIONS ||--o{ PREDICTIONS : generates
    MODEL_VERSIONS {
        int id PK
        string version_tag
        string description
        boolean is_active
        datetime deployed_at
    }
    
    PREDICTIONS ||--o{ RECOMMENDATIONS : spawns
    RECOMMENDATIONS {
        int id PK
        int prediction_id FK
        string rule_name
        string suggestion_text
        datetime created_at
    }
    
    USERS ||--o{ AUDIT_LOGS : triggers
    AUDIT_LOGS {
        int id PK
        int user_id FK
        string action
        string resource
        datetime timestamp
    }
```

## 2. Table Definitions (SQL/ORM Mapping)

### Users
- `id` (Integer, Primary Key)
- `email` (String, Unique, Index)
- `hashed_password` (String)
- `role` (Enum: student, teacher, admin)
- `created_at` (DateTime, Default: now)

### Students
- `id` (Integer, Primary Key)
- `user_id` (Integer, ForeignKey to `Users.id`, Unique)
- `student_identifier` (String, Index, e.g., 'STU0001')
- Demographic/Behavioral categorical columns directly matching Phase 1 Dataset.

### Academic_Records
- `id` (Integer, Primary Key)
- `student_id` (Integer, ForeignKey to `Students.id`)
- Numeric columns matching Phase 1 Dataset (`attendance_percentage`, `previous_year_score`, etc.)

### Study_Logs
- `id` (Integer, Primary Key)
- `student_id` (Integer, ForeignKey to `Students.id`)
- Integer columns tracking time (in minutes) and activity counts from Phase 1.

### Predictions
- `id` (Integer, Primary Key)
- `student_id` (Integer, ForeignKey to `Students.id`, Index)
- `model_version_id` (Integer, ForeignKey to `Model_Versions.id`)
- `predicted_score` (Float)
- `predicted_category` (String)
- `input_features` (JSON, preserves exact state at time of prediction)
- `predicted_at` (DateTime, Default: now)

### Model_Versions
- `id` (Integer, Primary Key)
- `version_tag` (String, Unique)
- `description` (String)
- `is_active` (Boolean, Default: True)
- `deployed_at` (DateTime)

## 3. REST API Contract

### Authentication
**POST `/api/v1/auth/login`**
- **Req:** `{"email": "...", "password": "..."}`
- **Res:** `200 OK` `{"access_token": "ey...", "token_type": "bearer", "role": "student"}`
- **Auth:** Public

### Student Profiles
**GET `/api/v1/students/me`**
- **Req:** None (Uses Token)
- **Res:** `200 OK` Returns combined JSON of `Students`, `Academic_Records`, and `Study_Logs`.
- **Auth:** Student

**PUT `/api/v1/students/me`**
- **Req:** JSON matching Demographics, Academics, and Activities schema.
- **Res:** `200 OK` `{"message": "Profile updated"}`
- **Auth:** Student

### Predictions (Inference)
**POST `/api/v1/predict/single`**
- **Req:** Combined JSON payload containing all necessary features (derived from profile state + form overrides).
- **Res:** `200 OK` `{"prediction_id": 102, "predicted_score": 82.5, "predicted_category": "Good", "recommendations": [...]}`
- **Auth:** Student, Teacher

**GET `/api/v1/predict/history`**
- **Req:** `?limit=10`
- **Res:** `200 OK` `[{"predicted_score": 82.5, "predicted_at": "2026-09-20T..."}, ...]`
- **Auth:** Student

### Teacher Dashboard
**GET `/api/v1/analytics/class`**
- **Req:** `?department=CSE&semester=6`
- **Res:** `200 OK` `{"total": 120, "at_risk": 15, "students": [...]}`
- **Auth:** Teacher, Admin
