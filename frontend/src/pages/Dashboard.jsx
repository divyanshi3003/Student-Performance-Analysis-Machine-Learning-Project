import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/predict/predictions'),
      api.get('/predict/summary')
    ])
      .then(([histRes, sumRes]) => {
        const sortedData = histRes.data.reverse().map(item => ({
          date: new Date(item.predicted_at).toLocaleDateString(),
          score: parseFloat(item.predicted_score.toFixed(1)),
          category: item.predicted_category
        }));
        setHistory(sortedData);
        setSummary(sumRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Calculate aggregates
  const latestScore = summary.latest_score != null ? summary.latest_score.toFixed(1) : null;
  const avgScore = summary.average_score != null ? summary.average_score.toFixed(1) : null;

  return (
    <Layout 
      title="Overview" 
      subtitle="Student performance and prediction history"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-main">Welcome, {user?.email.split('@')[0]}!</h1>
            <p className="text-text-muted">Track your academic progress and predictions.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => navigate('/student/simulate')}>What-If Simulator</Button>
            <Button onClick={() => navigate('/student/predict')}>Take New Assessment</Button>
          </div>
        </div>

      {history.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-4">
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
              <CardContent className="py-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Latest Predicted Score</p>
                  <div className="text-3xl font-bold text-primary-600">{latestScore}%</div>
                </div>
                <div className="w-12 h-12 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="py-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Average Score</p>
                  <div className="text-3xl font-bold text-text-main">{avgScore}%</div>
                </div>
                <div className="w-12 h-12 bg-surface-hover text-text-muted rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="py-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-muted mb-1">Total Assessments</p>
                  <div className="text-3xl font-bold text-text-main">{history.length}</div>
                </div>
                <div className="w-12 h-12 bg-surface-hover text-text-muted rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-full">
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
            </div>
            
            <div className="lg:col-span-1">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Key Drivers (Latest)</CardTitle>
                </CardHeader>
                <CardContent>
                  {summary.latest_feature_drivers && summary.latest_feature_drivers.length > 0 ? (
                    <ul className="space-y-4 mt-2">
                      {summary.latest_feature_drivers.map((driver, idx) => (
                        <li key={idx} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2 last:border-0">
                          <span className="text-gray-700 capitalize">{driver.feature.replace(/_/g, ' ')}</span>
                          <span className={`font-semibold ${driver.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {driver.impact > 0 ? '+' : ''}{driver.impact.toFixed(1)}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-gray-500 py-8 text-center flex flex-col items-center">
                      <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <p>Feature drivers currently unavailable.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
      </div>
    </Layout>
  );
}
