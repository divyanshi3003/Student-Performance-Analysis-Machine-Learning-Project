import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/predict/history')
      .then(res => {
        // Reverse history so oldest is first on the chart
        const sortedData = res.data.reverse().map(item => ({
          date: new Date(item.predicted_at).toLocaleDateString(),
          score: parseFloat(item.predicted_score.toFixed(1)),
          category: item.predicted_category
        }));
        setHistory(sortedData);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Calculate aggregates
  const latestScore = history.length > 0 ? history[history.length - 1].score : null;
  const avgScore = history.length > 0 
    ? (history.reduce((acc, curr) => acc + curr.score, 0) / history.length).toFixed(1) 
    : null;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.email.split('@')[0]}!</h1>
          <p className="text-gray-500">Track your academic progress and predictions.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/student/simulate')}>What-If Simulator</Button>
          <Button onClick={() => navigate('/student/predict')}>Take New Assessment</Button>
        </div>
      </div>

      {history.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No predictions yet</h3>
            <p className="text-gray-500 mb-6">Take your first assessment to see where you stand and track your progress.</p>
            <Button onClick={() => navigate('/student/predict')}>Start Assessment</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="py-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Latest Predicted Score</p>
                <div className="text-3xl font-bold text-indigo-600">{latestScore}%</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="py-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Average Score</p>
                <div className="text-3xl font-bold text-gray-900">{avgScore}%</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6">
                <p className="text-sm font-medium text-gray-500 mb-1">Total Assessments</p>
                <div className="text-3xl font-bold text-gray-900">{history.length}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Score Progression Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dy={10}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#6B7280', fontSize: 12 }}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value}%`, 'Score']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#4F46E5" 
                      strokeWidth={3}
                      dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                      activeDot={{ r: 6, fill: '#4F46E5', stroke: '#fff', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
