from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="student") # student, teacher, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    student_profile = relationship("Student", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), unique=True)
    student_identifier = Column(String, unique=True, index=True)
    department = Column(String)
    semester = Column(Integer)
    gender = Column(String)
    hostel_or_dayscholar = Column(String)
    study_time_preference = Column(String)
    learning_style = Column(String)
    sleep_quality = Column(String)
    stress_level = Column(String)
    internet_access_quality = Column(String)
    part_time_job = Column(String)
    mentor_support = Column(String)
    placement_status = Column(String)
    
    user = relationship("User", back_populates="student_profile")
    academic_record = relationship("AcademicRecord", back_populates="student", uselist=False)
    study_log = relationship("StudyLog", back_populates="student", uselist=False)
    predictions = relationship("Prediction", back_populates="student")

class AcademicRecord(Base):
    __tablename__ = 'academic_records'
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id'), unique=True)
    attendance_percentage = Column(Float)
    previous_year_score = Column(Float)
    previous_semester_gpa = Column(Float)
    backlogs_count = Column(Integer)
    internal_marks = Column(Integer)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    student = relationship("Student", back_populates="academic_record")

class StudyLog(Base):
    __tablename__ = 'study_logs'
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id'), unique=True)
    study_minutes_per_day = Column(Integer)
    material_prep_minutes_per_week = Column(Integer)
    extracurricular_minutes_per_week = Column(Integer)
    skill_dev_minutes_per_week = Column(Integer)
    projects_completed = Column(Integer)
    hackathons_participated = Column(Integer)
    internships_completed = Column(Integer)
    certifications_count = Column(Integer)
    coding_problems_solved = Column(Integer)
    coding_platform_rating = Column(Integer)
    logged_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    student = relationship("Student", back_populates="study_log")

class ModelVersion(Base):
    __tablename__ = 'model_versions'
    id = Column(Integer, primary_key=True, index=True)
    version_tag = Column(String, unique=True, index=True)
    description = Column(String)
    is_active = Column(Boolean, default=True)
    deployed_at = Column(DateTime, default=datetime.utcnow)
    
    predictions = relationship("Prediction", back_populates="model_version")

class Prediction(Base):
    __tablename__ = 'predictions'
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('students.id'))
    model_version_id = Column(Integer, ForeignKey('model_versions.id'))
    predicted_score = Column(Float)
    predicted_category = Column(String)
    input_features = Column(JSON) # Store snapshot
    predicted_at = Column(DateTime, default=datetime.utcnow)
    
    student = relationship("Student", back_populates="predictions")
    model_version = relationship("ModelVersion", back_populates="predictions")
    recommendations = relationship("Recommendation", back_populates="prediction")

class Recommendation(Base):
    __tablename__ = 'recommendations'
    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey('predictions.id'))
    rule_name = Column(String)
    suggestion_text = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    prediction = relationship("Prediction", back_populates="recommendations")

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    action = Column(String)
    resource = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="audit_logs")
