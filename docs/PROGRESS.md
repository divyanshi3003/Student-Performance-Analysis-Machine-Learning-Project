# Project Progress

| Phase | Status | Details |
|---|---|---|
| **Phase 1: Dataset Redesign and Generation** | **Done** | Designed new schema with time features mapping to hours/minutes, categorical behavioral features, computed targets with noise. `generate_dataset.py` and `validate_dataset.py` written. Dataset `student_performance_v2.csv` validated successfully. Data dictionary stored in `DATA_DICTIONARY.md`. |
| **Phase 2: ML Model Rebuild** | **Done** | Built Pipelines separating numeric (StandardScaler, Median Imputer) and categorical (OneHotEncoder, Frequent Imputer). Trained LinearRegression, RandomForestRegressor, GradientBoostingRegressor (Regression) and LogisticRegression, RandomForestClassifier, GradientBoostingClassifier (Classification). Saved best models (`LinearRegression` for score, `LogisticRegression` for category) to `/ml/artifacts/v1`. Created `/docs/MODEL_REPORT.md`. |
| **Phase 3: PRD** | **Done** | Authored `/docs/PRD.md` containing the problem statement, user personas, MoSCoW prioritization, functional/non-functional requirements, and the release plan. |
| **Phase 4: TRD** | **Done** | Authored `/docs/TRD.md` containing system architecture (Mermaid), tech stack, ML serving design, data flow, API overview, and the final folder structure. |
| **Phase 5: UI/UX Document** | **Done** | Authored `/docs/UIUX.md` detailing user flows, sitemap, wireframes, the design system, accessibility, and strict rules for Hours/Minutes inputs. |
| **Phase 6: Backend Schema** | **Done** | Authored `/docs/BACKEND_SCHEMA.md` with ER diagram (Mermaid) and REST API contracts. Created Python SQLAlchemy ORM definitions in `/backend/app/models.py`. |
| Phase 7: Backend Project Setup | Pending | - |
| Phase 8: Authentication and Roles | Pending | - |
| Phase 9: Student Data APIs | Pending | - |
| Phase 10: ML Inference API | Pending | - |
| Phase 11: Frontend Setup and Design System | Pending | - |
| Phase 12: Student Input Form | Pending | - |
| Phase 13: Prediction Result Page | Pending | - |
| Phase 14: Student Dashboard and Analytics | Pending | - |
| Phase 15: Recommendation Engine and What-If Simulator | Pending | - |
| Phase 16: Teacher/Admin Dashboard | Pending | - |
| Phase 17: Explainability and Fairness | Pending | - |
| Phase 18: Testing | Pending | - |
| Phase 19: Deployment and CI/CD | Pending | - |
| Phase 20: Final Polish, Docs and Handover | Pending | - |
