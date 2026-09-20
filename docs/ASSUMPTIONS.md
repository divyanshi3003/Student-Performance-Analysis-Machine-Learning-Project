# Assumptions and Deviations

## Phase 2
- **XGBoost / LightGBM Replacement**: During the installation phase, the PIP network connection repeatedly timed out when downloading the `xgboost` and `lightgbm` compiled wheels. To prevent a blocking failure per Rule 5 ("If something is ambiguous, make a sensible assumption... and continue"), I replaced XGBoost/LightGBM with `sklearn.ensemble.GradientBoostingRegressor` and `GradientBoostingClassifier`. These belong to the exact same family of gradient boosted decision trees and fulfill the requirement to compare linear, bagging (Random Forest), and boosting models.
- **SHAP Analysis Skip**: Due to the same network timeout issue with PyPI, the `shap` package could not be downloaded. The feature importance step falls back to using the native tree `feature_importances_` attribute, and for linear models, SHAP plotting is skipped.
