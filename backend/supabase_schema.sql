-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM for User Roles
CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');

-- 1. Users (Extends auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'student',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles (Detailed user information)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    department TEXT,
    bio TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Courses
CREATE TABLE public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Course Enrollments
CREATE TABLE public.course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, course_id)
);

-- 5. Assignments
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Submissions
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    content_url TEXT NOT NULL,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, student_id)
);

-- 7. Grades
CREATE TABLE public.grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
    grade_value NUMERIC(5,2) NOT NULL,
    feedback TEXT,
    graded_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    read_status BOOLEAN DEFAULT FALSE,
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- ML & Analytics Tables (EduMetrics Core)
-- ==========================================

-- 9. Students (ML Profile)
CREATE TABLE public.students (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
    student_identifier TEXT UNIQUE,
    department TEXT,
    semester INTEGER,
    gender TEXT,
    hostel_or_dayscholar TEXT,
    study_time_preference TEXT,
    learning_style TEXT,
    sleep_quality TEXT,
    stress_level TEXT,
    internet_access_quality TEXT,
    part_time_job TEXT,
    mentor_support TEXT,
    placement_status TEXT
);
CREATE INDEX idx_students_user_id ON public.students(user_id);
CREATE INDEX idx_students_identifier ON public.students(student_identifier);

-- 10. Academic Records
CREATE TABLE public.academic_records (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
    attendance_percentage NUMERIC(5,2),
    previous_year_score NUMERIC(5,2),
    previous_semester_gpa NUMERIC(4,2),
    backlogs_count INTEGER,
    internal_marks INTEGER,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Study Logs
CREATE TABLE public.study_logs (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES public.students(id) ON DELETE CASCADE UNIQUE,
    study_minutes_per_day INTEGER,
    material_prep_minutes_per_week INTEGER,
    extracurricular_minutes_per_week INTEGER,
    skill_dev_minutes_per_week INTEGER,
    projects_completed INTEGER,
    hackathons_participated INTEGER,
    internships_completed INTEGER,
    certifications_count INTEGER,
    coding_problems_solved INTEGER,
    coding_platform_rating INTEGER,
    logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Model Versions
CREATE TABLE public.model_versions (
    id SERIAL PRIMARY KEY,
    version_tag TEXT UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    deployed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Predictions
CREATE TABLE public.predictions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES public.students(id) ON DELETE CASCADE,
    model_version_id INTEGER REFERENCES public.model_versions(id) ON DELETE SET NULL,
    predicted_score NUMERIC(5,2),
    predicted_category TEXT,
    input_features JSONB,
    predicted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Recommendations
CREATE TABLE public.recommendations (
    id SERIAL PRIMARY KEY,
    prediction_id INTEGER REFERENCES public.predictions(id) ON DELETE CASCADE,
    rule_name TEXT,
    suggestion_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Audit Logs
CREATE TABLE public.audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT,
    resource TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on ML Tables
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Basic Policies for ML Tables
CREATE POLICY "Students can view and update own profile" ON public.students FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Students can view and update own academic record" ON public.academic_records FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND user_id = auth.uid()));
CREATE POLICY "Students can view and update own study log" ON public.study_logs FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND user_id = auth.uid()));
CREATE POLICY "Students can view own predictions" ON public.predictions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.students WHERE id = student_id AND user_id = auth.uid()));
CREATE POLICY "System can insert predictions" ON public.predictions FOR INSERT WITH CHECK (true); -- Usually restricted to service role in prod


-- ==========================================
-- Triggers
-- ==========================================

-- Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'role', 'student')::user_role);
  
  INSERT INTO public.profiles (id, first_name, last_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'first_name', ''), COALESCE(new.raw_user_meta_data->>'last_name', ''));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
