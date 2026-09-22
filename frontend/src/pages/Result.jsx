import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import Layout from '../components/Layout';

export default function Result() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Fetch the student's latest profile
    api.get('/students/me')
      .then(res => {
        const studentData = res.data;
        // Flatten the data for the ML payload
        const features = {
          ...studentData.profile,
          ...studentData.academics,
          ...studentData.activities
        };
        
        // 2. Call the prediction API
        return api.post('/predict/single', { features });
      })
      .then(res => {
        setResult(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.detail || "Failed to generate prediction. Did you fill out the form?");
        setLoading(false);
      });
  }, []);

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Excellent':
      case 'Good':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Average':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Low':
      case 'Poor':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-10 px-4 text-center">
        <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">{error}</div>
        <Button onClick={() => navigate('/student/predict')}>Return to Form</Button>
      </div>
    );
  }

  return (
    <Layout title="Result" subtitle="Your predicted performance">
      <div className="max-w-2xl mx-auto py-10 px-4 space-y-6">
        <Card className="overflow-hidden border-0 shadow-surface ring-1 ring-border-default">
          <div className="bg-primary-600 px-6 py-10 text-center text-white">
            <h2 className="text-xl font-medium opacity-90 mb-2">Predicted Final Score</h2>
            <div className="text-7xl font-bold tracking-tight">
              {result.predicted_score.toFixed(1)}<span className="text-3xl opacity-75">%</span>
            </div>
          </div>
        
        <CardContent className="pt-8">
          <div className="flex flex-col items-center space-y-4">
            <h3 className="text-gray-500 font-medium uppercase tracking-wider text-sm">Performance Category</h3>
            <span className={`px-5 py-2 rounded-full text-lg font-semibold border ${getCategoryColor(result.predicted_category)}`}>
              {result.predicted_category}
            </span>
            <p className="text-sm text-gray-400 mt-2">Model Confidence: {(result.confidence * 100).toFixed(1)}%</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Drivers (Feature Impact)</CardTitle>
          <p className="text-sm text-gray-500">What influenced your score the most?</p>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {result.feature_drivers && result.feature_drivers.length > 0 ? (
              result.feature_drivers.map((driver, idx) => {
                const isPositive = driver.impact > 0;
                return (
                  <li key={idx} className={`flex items-center justify-between p-3 rounded-md ${isPositive ? 'bg-emerald-50' : 'bg-amber-50'}`}>
                    <span className={isPositive ? 'text-emerald-800' : 'text-amber-800'}>
                      {isPositive ? '✅' : '⚠️'} {driver.feature}
                    </span>
                    <span className={`text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isPositive ? '+' : ''}{driver.impact.toFixed(2)} Impact
                    </span>
                  </li>
                );
              })
            ) : (
              <li className="text-gray-500 text-sm p-3">Feature drivers currently unavailable.</li>
            )}
          </ul>
        </CardContent>
      </Card>

      <div className="flex gap-4 pt-4">
        <Button variant="secondary" className="flex-1" onClick={() => navigate('/student/predict')}>
          Edit My Data
        </Button>
        <Button variant="primary" className="flex-1" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
    </Layout>
  );
}
