# Root Cause Analysis: Assessment Prediction Failure

## Bug Description
When a student completes the assessment form, the prediction result is not generated. The frontend displays a generic error message ("Failed to generate prediction. Did you fill out the form?"), and the backend logs a bare HTTP 500 Internal Server Error with no descriptive body.

## Root Cause
The `POST /api/v1/predict/single` endpoint in `backend/app/api/routers/predict.py` has several critical flaws in its error handling and database transaction logic:

1. **Unhandled Database Exceptions (Bare 500s):** The database operations (`db.add()`, `db.commit()`, `db.refresh()`) and the model version lookup (`get_or_create_model_version`) are executed *outside* of any `try...except` block. If any database constraint is violated (e.g., foreign key violation, RLS rejection if connected via a restricted role, or serialization error), SQLAlchemy raises an exception (like `IntegrityError` or `OperationalError`). FastAPI's default exception handler converts this into a bare 500 error with no `detail` field.
2. **Frontend Error Swallowing:** Because the backend returns a 500 error without a `detail` key, the frontend (`Result.jsx`) cannot read `err.response?.data?.detail` and defaults to the generic "Did you fill out the form?" message, swallowing the actual root cause of the failure.
3. **Silent SHAP Initialization Failures:** The `ml_service.py` encounters an exception when initializing the SHAP `TreeExplainer` (since the model is a `LinearRegression`, which requires `LinearExplainer`). It catches this exception, prints it to the console, and silently disables feature drivers (returning an empty array), masking a potential feature analysis bug.

## Fix Implementation Plan
1. **Wrap DB Transactions:** Wrap the DB insert and commit in a `try...except` block catching `SQLAlchemyError`, returning an HTTP 500 with a clear detail message.
2. **Robust Inference Handling:** Ensure model validation and inference errors are caught and returned as HTTP 422 (Unprocessable Entity) or 400.
3. **Graceful Degradation:** The frontend already degrades gracefully if `feature_drivers` is empty, but the backend should properly log the SHAP failure or fix the explainer type.
