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

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users & Profiles
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Courses
CREATE POLICY "Courses are viewable by everyone" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Teachers can insert/update courses" ON public.courses 
    FOR ALL USING (auth.uid() = teacher_id AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'teacher'));

-- Course Enrollments
CREATE POLICY "View enrollments" ON public.course_enrollments FOR SELECT 
    USING (student_id = auth.uid() OR EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND teacher_id = auth.uid()));

-- Assignments
CREATE POLICY "View assignments" ON public.assignments FOR SELECT 
    USING (
        EXISTS (SELECT 1 FROM public.course_enrollments WHERE course_id = public.assignments.course_id AND student_id = auth.uid()) 
        OR 
        EXISTS (SELECT 1 FROM public.courses WHERE id = public.assignments.course_id AND teacher_id = auth.uid())
    );

-- Submissions
CREATE POLICY "Students manage own submissions" ON public.submissions FOR ALL 
    USING (student_id = auth.uid());
CREATE POLICY "Teachers view submissions" ON public.submissions FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.assignments a 
        JOIN public.courses c ON a.course_id = c.id 
        WHERE a.id = public.submissions.assignment_id AND c.teacher_id = auth.uid()
    ));

-- Grades
CREATE POLICY "Students view own grades" ON public.grades FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = public.grades.submission_id AND student_id = auth.uid()));
CREATE POLICY "Teachers manage grades" ON public.grades FOR ALL 
    USING (graded_by = auth.uid());

-- Messages
CREATE POLICY "View own messages" ON public.messages FOR SELECT 
    USING (sender_id = auth.uid() OR receiver_id = auth.uid());
CREATE POLICY "Insert own messages" ON public.messages FOR INSERT 
    WITH CHECK (sender_id = auth.uid());

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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
