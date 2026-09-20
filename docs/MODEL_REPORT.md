# Model Evaluation Report

## Regression (final_score)
- **MAE**: 1.6770
- **RMSE**: 2.1161
- **R2**: 0.9134

## Classification (performance_category)
- **Accuracy**: 0.8910

## Data Leakage Check
If R2 is near 0.99+, it could indicate leakage. In our case, the target formula explicitly uses `previous_semester_gpa`, `attendance_percentage`, and `internal_marks` with low noise, meaning high predictability is naturally expected and realistic for this mathematical setup, rather than actual target leakage.
