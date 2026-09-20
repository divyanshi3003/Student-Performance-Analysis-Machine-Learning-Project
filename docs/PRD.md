# Product Requirements Document (PRD)
**Project Name:** EduMetrics ML (Student Performance Analysis)
**Phase:** 3

## 1. Problem Statement
Academic institutions currently lack proactive, data-driven tools to identify students at risk of underperforming. Existing systems only report grades *after* the fact. Students and teachers need a predictive, personalized analytics platform that evaluates daily study habits, attendance, and extracurricular involvement to forecast academic outcomes and suggest actionable improvements before final exams.

## 2. Target Users
- **Students:** Seeking personalized feedback and "What-If" scenarios to optimize their study habits and boost their GPA/Placement chances.
- **Teachers / Mentors:** Need high-level analytics to identify at-risk students early and provide targeted interventions.
- **Admins:** Oversee department-level performance trends and manage dataset updates.

## 3. Goals and Non-Goals
### Goals
- Accurately predict a student's `final_score` and `performance_category` using a Machine Learning pipeline.
- Provide a responsive, accessible Web App for users to input data and view predictions.
- Deliver actionable insights via a "What-If" simulation engine.
- Provide aggregate class-level dashboards for teachers.

### Non-Goals
- We will not integrate directly with existing university ERP systems (e.g., Blackboard, Canvas) in this release.
- We will not handle real-time automatic tracking of student attendance or internet usage (data is self-reported).
- We will not provide an automated tutoring or chat-bot system.

## 4. User Personas
- **"Struggling Sam" (Student):** A 3rd-semester student who has high stress and poor sleep. He uses the app to see how fixing his sleep and doing 1 more project can raise his category from "Average" to "Good".
- **"Proactive Priya" (Teacher):** A CSE mentor monitoring 60 students. She logs in to quickly filter for students predicted to score "Low" to schedule 1-on-1 counseling.

## 5. User Stories
- *As a student, I want to input my weekly study hours (in Hours + Minutes) so that I can see my predicted final score.*
- *As a student, I want to tweak my inputs in a "What-If" simulator so that I can figure out the easiest way to improve my grade.*
- *As a teacher, I want to view a dashboard of my entire class so that I can export a CSV of at-risk students.*

## 6. Functional Requirements
- **FR1:** The system shall authenticate users into Role-Based Access Controls (Student, Teacher, Admin).
- **FR2:** The system shall provide a multi-step input form validating time features strictly as Hours + Minutes (preventing >24h daily totals).
- **FR3:** The system shall pass validated inputs to the ML Inference API and return a predicted score (0-100) and category.
- **FR4:** The system shall log all predictions to a database for historical tracking.
- **FR5:** The system shall provide an interactive "What-If" simulation tool.
- **FR6:** The system shall provide a Teacher Dashboard with filtering, sorting, and CSV export capabilities.

## 7. Non-Functional Requirements
- **NFR1 (Performance):** The ML Inference API must return a prediction in under 500ms.
- **NFR2 (Usability):** The frontend must be fully responsive (Mobile, Tablet, Desktop) using Tailwind CSS.
- **NFR3 (Security):** JWT tokens must be used for all API endpoints. Passwords must be hashed using bcrypt.
- **NFR4 (Reliability):** The backend must have >80% test coverage.

## 8. Feature List (MoSCoW Priority)
### Must Have (M)
- ML Model inference endpoint.
- User Authentication (JWT).
- Student Prediction Form (Hours + Minutes inputs).
- Prediction Results Page with SHAP/Feature drivers.
- Database schema for saving predictions and profiles.

### Should Have (S)
- Student Historical Dashboard (trend charts).
- Teacher / Admin Dashboard with filtering.
- What-If Simulator with sliders.

### Could Have (C)
- Explainability and Fairness bias checks report.
- PDF Export of student predictions.

### Won't Have (W)
- Real-time ERP integration.
- Single Sign-On (SSO) via Google/Microsoft.

## 9. Success Metrics
- **Model Accuracy:** R2 > 0.85 on Regression; Accuracy > 85% on Classification.
- **User Engagement:** > 70% of students use the "What-If" simulator after getting an initial prediction.
- **Performance:** 95th percentile latency of the `/predict` endpoint is < 200ms.

## 10. Risks & Assumptions
- **Risk:** Students may lie on self-reported metrics (e.g., claiming 10 hours of daily study).
  - *Mitigation:* Add strict frontend validation caps.
- **Assumption:** The synthetic dataset correctly mimics the real-world statistical distribution of the target university.

## 11. Release Plan
- **Milestone 1 (Backend Core):** Database schema, Auth, and ML Inference API (Phases 6-10).
- **Milestone 2 (Frontend Core):** React Setup, Input Form, and Results Page (Phases 11-13).
- **Milestone 3 (Advanced Features):** Dashboards, Simulator, and Explainability (Phases 14-17).
- **Milestone 4 (Hardening):** Testing, CI/CD, and Handover (Phases 18-20).
