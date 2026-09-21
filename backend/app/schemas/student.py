from pydantic import BaseModel, Field, model_validator
from typing import Optional

class TimeInput(BaseModel):
    hours: int = Field(ge=0)
    minutes: int = Field(ge=0, le=59)
    
    def total_minutes(self) -> int:
        return self.hours * 60 + self.minutes

class StudentProfileBase(BaseModel):
    student_identifier: str
    department: str
    semester: int = Field(ge=1, le=8)
    gender: str
    hostel_or_dayscholar: str
    study_time_preference: str
    learning_style: str
    sleep_quality: str
    stress_level: str
    internet_access_quality: str
    part_time_job: str
    mentor_support: str
    placement_status: str

class AcademicRecordBase(BaseModel):
    attendance_percentage: float = Field(ge=0.0, le=100.0)
    previous_year_score: float = Field(ge=0.0, le=100.0)
    previous_semester_gpa: float = Field(ge=0.0, le=10.0)
    backlogs_count: int = Field(ge=0)
    internal_marks: int = Field(ge=0, le=50)

class StudyLogBase(BaseModel):
    study_time_daily: TimeInput
    material_prep_weekly: TimeInput
    extracurricular_weekly: TimeInput
    skill_dev_weekly: TimeInput
    
    projects_completed: int = Field(ge=0)
    hackathons_participated: int = Field(ge=0)
    internships_completed: int = Field(ge=0)
    certifications_count: int = Field(ge=0)
    coding_problems_solved: int = Field(ge=0)
    coding_platform_rating: int = Field(ge=500)

class StudentDataUpdate(BaseModel):
    profile: StudentProfileBase
    academics: AcademicRecordBase
    activities: StudyLogBase

    @model_validator(mode='after')
    def check_24_hour_limit(self):
        study_mins = self.activities.study_time_daily.total_minutes()
        mat_mins_daily = self.activities.material_prep_weekly.total_minutes() / 7
        extra_mins_daily = self.activities.extracurricular_weekly.total_minutes() / 7
        skill_mins_daily = self.activities.skill_dev_weekly.total_minutes() / 7
        
        total_daily_mins = study_mins + mat_mins_daily + extra_mins_daily + skill_mins_daily
        
        # Max 14 hours (840 minutes) of active work a day to allow for 8 hours sleep + 2 hours life
        if total_daily_mins > 840:
            raise ValueError(f"Total active daily hours cannot exceed 14 hours. Currently at {total_daily_mins / 60:.2f} hours.")
            
        return self

class StudentDataResponse(BaseModel):
    profile: dict
    academics: dict
    activities: dict
