from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, JSON, Numeric
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime
import uuid

Base = declarative_base()

# --- SUPABASE INTEGRATION: Replaced Integer ID with UUID and removed hashed_password ---
class User(Base):
    __tablename__ = 'users'
    # Supabase auth.users.id is UUID
    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="student") # student, teacher, admin
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship("Profile", back_populates="user", uselist=False)
    student_profile = relationship("Student", back_populates="user", uselist=False)
    audit_logs = relationship("AuditLog", back_populates="user")
    courses_taught = relationship("Course", back_populates="teacher")
    enrollments = relationship("CourseEnrollment", back_populates="student")
    submissions = relationship("Submission", back_populates="student")
    messages_sent = relationship("Message", foreign_keys="[Message.sender_id]", back_populates="sender")
    messages_received = relationship("Message", foreign_keys="[Message.receiver_id]", back_populates="receiver")
    grades_given = relationship("Grade", back_populates="grader")


class Profile(Base):
    __tablename__ = 'profiles'
    id = Column(String, ForeignKey('users.id', ondelete="CASCADE"), primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    avatar_url = Column(String)
    department = Column(String)
    bio = Column(String)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")


# --- LMS Core Models ---
class Course(Base):
    __tablename__ = 'courses'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    teacher_id = Column(String, ForeignKey('users.id', ondelete="CASCADE"))
    title = Column(String, nullable=False)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    teacher = relationship("User", back_populates="courses_taught")
    enrollments = relationship("CourseEnrollment", back_populates="course")
    assignments = relationship("Assignment", back_populates="course")


class CourseEnrollment(Base):
    __tablename__ = 'course_enrollments'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id = Column(String, ForeignKey('users.id', ondelete="CASCADE"))
    course_id = Column(String, ForeignKey('courses.id', ondelete="CASCADE"))
    enrolled_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Assignment(Base):
    __tablename__ = 'assignments'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    course_id = Column(String, ForeignKey('courses.id', ondelete="CASCADE"))
    title = Column(String, nullable=False)
    description = Column(String)
    due_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="assignments")
    submissions = relationship("Submission", back_populates="assignment")


class Submission(Base):
    __tablename__ = 'submissions'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    assignment_id = Column(String, ForeignKey('assignments.id', ondelete="CASCADE"))
    student_id = Column(String, ForeignKey('users.id', ondelete="CASCADE"))
    content_url = Column(String, nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", back_populates="submissions")
    grade = relationship("Grade", back_populates="submission", uselist=False)


class Grade(Base):
    __tablename__ = 'grades'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    submission_id = Column(String, ForeignKey('submissions.id', ondelete="CASCADE"), unique=True)
    grade_value = Column(Numeric(5, 2), nullable=False)
    feedback = Column(String)
    graded_by = Column(String, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="grade")
    grader = relationship("User", back_populates="grades_given")


class Message(Base):
    __tablename__ = 'messages'
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = Column(String, ForeignKey('users.id', ondelete="CASCADE"))
    receiver_id = Column(String, ForeignKey('users.id', ondelete="CASCADE"))
    course_id = Column(String, ForeignKey('courses.id', ondelete="SET NULL"), nullable=True)
    content = Column(String, nullable=False)
    read_status = Column(Boolean, default=False)
    sent_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="messages_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="messages_received")


# --- Existing ML/Student Performance Models ---

class Student(Base):
    __tablename__ = 'students'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, ForeignKey('users.id'), unique=True) # Updated to String for Supabase UUID
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
    mentor_id = Column(String, ForeignKey('users.id', ondelete="SET NULL"), nullable=True)
    
    user = relationship("User", foreign_keys=[user_id], back_populates="student_profile")
    mentor = relationship("User", foreign_keys=[mentor_id])
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
    user_id = Column(String, ForeignKey('users.id')) # Updated to String
    action = Column(String)
    resource = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="audit_logs")
