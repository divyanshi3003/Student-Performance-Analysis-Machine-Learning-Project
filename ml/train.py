import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.pipeline import Pipeline
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.linear_model import LinearRegression, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier, GradientBoostingRegressor, GradientBoostingClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, accuracy_score, classification_report

def create_pipeline(num_features, cat_features, model):
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_features),
            ('cat', cat_transformer, cat_features)
        ])
        
    return Pipeline(steps=[('preprocessor', preprocessor), ('model', model)])

def main():
    data_path = os.path.join(os.path.dirname(__file__), '../data/student_performance_v2.csv')
    df = pd.read_csv(data_path)
    
    # Drop targets and identifiers
    X = df.drop(columns=['student_id', 'final_score', 'productivity_index', 'performance_category'])
    y_reg = df['final_score']
    
    # Encode classification target
    le = LabelEncoder()
    y_clf = le.fit_transform(df['performance_category'])
    
    cat_features = X.select_dtypes(include=['object', 'category']).columns.tolist()
    num_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    X_train, X_test, yr_train, yr_test, yc_train, yc_test = train_test_split(
        X, y_reg, y_clf, test_size=0.2, random_state=42, stratify=y_clf
    )
    
    artifacts_dir = os.path.join(os.path.dirname(__file__), 'artifacts', 'v1')
    os.makedirs(artifacts_dir, exist_ok=True)
    
    joblib.dump(le, os.path.join(artifacts_dir, 'label_encoder.joblib'))
    
    print("--- Training Regression Models ---")
    reg_models = {
        'LinearRegression': (LinearRegression(), {}),
        'RandomForestRegressor': (RandomForestRegressor(random_state=42), {'model__n_estimators': [50], 'model__max_depth': [10]}),
        'GradientBoostingRegressor': (GradientBoostingRegressor(random_state=42), {'model__n_estimators': [50], 'model__learning_rate': [0.1]})
    }
    
    best_reg_model = None
    best_r2 = -float('inf')
    
    for name, (model, params) in reg_models.items():
        print(f"Training {name}...")
        pipeline = create_pipeline(num_features, cat_features, model)
        if params:
            search = GridSearchCV(pipeline, params, cv=3, scoring='r2', n_jobs=-1)
            search.fit(X_train, yr_train)
            best_pipe = search.best_estimator_
        else:
            pipeline.fit(X_train, yr_train)
            best_pipe = pipeline
            
        preds = best_pipe.predict(X_test)
        r2 = r2_score(yr_test, preds)
        print(f"{name} R2: {r2:.4f}")
        
        if r2 > best_r2:
            best_r2 = r2
            best_reg_model = best_pipe
            
    print(f"Best Regression Model: {best_reg_model.named_steps['model'].__class__.__name__}")
    joblib.dump(best_reg_model, os.path.join(artifacts_dir, 'best_regressor.joblib'))
    
    print("\n--- Training Classification Models ---")
    clf_models = {
        'LogisticRegression': (LogisticRegression(max_iter=1000), {}),
        'RandomForestClassifier': (RandomForestClassifier(random_state=42), {'model__n_estimators': [50]}),
        'GradientBoostingClassifier': (GradientBoostingClassifier(random_state=42), {'model__n_estimators': [50]})
    }
    
    best_clf_model = None
    best_acc = -float('inf')
    
    for name, (model, params) in clf_models.items():
        print(f"Training {name}...")
        pipeline = create_pipeline(num_features, cat_features, model)
        if params:
            search = GridSearchCV(pipeline, params, cv=3, scoring='accuracy', n_jobs=-1)
            search.fit(X_train, yc_train)
            best_pipe = search.best_estimator_
        else:
            pipeline.fit(X_train, yc_train)
            best_pipe = pipeline
            
        preds = best_pipe.predict(X_test)
        acc = accuracy_score(yc_test, preds)
        print(f"{name} Accuracy: {acc:.4f}")
        
        if acc > best_acc:
            best_acc = acc
            best_clf_model = best_pipe
            
    print(f"Best Classification Model: {best_clf_model.named_steps['model'].__class__.__name__}")
    joblib.dump(best_clf_model, os.path.join(artifacts_dir, 'best_classifier.joblib'))
    
    # Save training data to be used by evaluate.py (for SHAP)
    X_train.to_csv(os.path.join(artifacts_dir, 'X_train.csv'), index=False)
    X_test.to_csv(os.path.join(artifacts_dir, 'X_test.csv'), index=False)
    yr_test.to_csv(os.path.join(artifacts_dir, 'yr_test.csv'), index=False)
    pd.Series(yc_test).to_csv(os.path.join(artifacts_dir, 'yc_test.csv'), index=False)
    print("Training complete. Artifacts saved.")

if __name__ == '__main__':
    main()
