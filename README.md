# EduMetrics ML (Student Performance Analysis)

## Description
EduMetrics ML is an end-to-end data science and full-stack web application designed to predict a student's final academic score and performance category based on their study habits, attendance, extracurricular involvement, and other metrics. The system uses a Machine Learning backend pipeline powered by `scikit-learn` (Linear/Logistic regression, Gradient Boosting) served via a high-performance `FastAPI` REST server.

## Features
- **Predictive Analytics**: Inputs user behaviors to instantly forecast academic scores.
- **What-If Simulator**: Allows students to see how changing their habits (e.g., sleeping more, studying more) affects their score.
- **Teacher Dashboard**: Provides an aggregated view of student performance to identify at-risk individuals early.
- **Secure Authentication**: Role-Based Access Control (RBAC) via JWTs for Students, Teachers, and Admins.

## Repository Structure
- `/backend`: FastAPI Python server containing API routing, SQLAlchemy models, and ML Serving services.
- `/data`: Scripts for generating and validating the synthetic dataset used for training.
- `/ml`: Model training, hyperparameter tuning, and evaluation scripts saving artifacts to `.joblib`.
- `/frontend`: React + Tailwind single-page application for the user interface.
- `/docs`: Project documentation including PRD, TRD, UI/UX designs, and the Data Dictionary.

## Installation & Setup

### Prerequisites
- Python 3.11+
- Node.js 18+ (for frontend)
- Git

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run database migrations:
   ```bash
   alembic upgrade head
   ```
5. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## Running Tests
To execute the backend testing suite via Pytest:
```bash
cd backend
pytest tests/ -v
```

## Authors
- Divyanshi Sharma (iamdivya3003@gmail.com)
