import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import Card, { CardHeader, CardTitle, CardContent } from './ui/Card';

export default function StudentDetailModal({ studentId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [profileRes, predsRes] = await Promise.all([
          api.get(`/students/mentees/${studentId}`),
          api.get(`/students/mentees/${studentId}/predictions`)
        ]);
        
        setData({
          profile: profileRes.data,
          predictions: predsRes.data
        });
      } catch (err) {
        setError('Failed to load student details.');
      } finally {
        setLoading(false);
      }
    }
    if (studentId) loadData();
  }, [studentId]);

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-app-bg w-full max-w-5xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
        
        <div className="flex items-center justify-between p-6 border-b border-border-default bg-surface">
          <h2 className="text-xl font-bold text-text-main">Student Drill-down</h2>
          <button onClick={onClose} className="p-2 text-text-muted hover:text-text-main rounded-full hover:bg-surface-hover">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-20 text-text-muted">Loading details...</div>
          ) : error ? (
            <div className="text-center py-20 text-status-error-text">{error}</div>
          ) : data ? (
            <div className="space-y-6">
              
              {/* Top Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-surface">
                  <CardContent className="p-4">
                    <p className="text-xs text-text-muted">Identifier</p>
                    <p className="text-lg font-semibold text-text-main">{data.profile.profile.student_identifier}</p>
                  </CardContent>
                </Card>
                <Card className="bg-surface">
                  <CardContent className="p-4">
                    <p className="text-xs text-text-muted">Department</p>
                    <p className="text-lg font-semibold text-text-main">{data.profile.profile.department}</p>
                  </CardContent>
                </Card>
                <Card className="bg-surface">
                  <CardContent className="p-4">
                    <p className="text-xs text-text-muted">Average Score</p>
                    <p className="text-lg font-semibold text-text-main">
                      {data.predictions.summary.average_score?.toFixed(1) || 'N/A'}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-surface">
                  <CardContent className="p-4">
                    <p className="text-xs text-text-muted">Latest Score</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {data.predictions.summary.latest_score?.toFixed(1) || 'N/A'}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Col: Trend Chart */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="h-[400px] flex flex-col bg-surface">
                    <CardHeader>
                      <CardTitle>Performance Trend</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 pb-6">
                      {data.predictions.history.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={[...data.predictions.history].reverse()}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                            <XAxis 
                              dataKey="predicted_at" 
                              tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              stroke="#9ca3af"
                              fontSize={12}
                              tickMargin={10}
                            />
                            <YAxis 
                              domain={[0, 100]} 
                              stroke="#9ca3af"
                              fontSize={12}
                              tickFormatter={(val) => `${val}%`}
                            />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                              labelFormatter={(val) => new Date(val).toLocaleString()}
                              formatter={(value) => [`${value.toFixed(1)}%`, 'Predicted Score']}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="predicted_score" 
                              stroke="#0ea5e9" 
                              strokeWidth={3}
                              dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
                              activeDot={{ r: 6, fill: "#0284c7", stroke: "#fff" }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-text-muted text-sm">
                          No assessment history available.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Col: Drivers & Details */}
                <div className="space-y-6">
                  <Card className="bg-surface">
                    <CardHeader>
                      <CardTitle>Key Drivers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {data.predictions.summary.latest_feature_drivers?.length > 0 ? (
                        <div className="space-y-3">
                          {data.predictions.summary.latest_feature_drivers.map((driver, idx) => (
                            <div key={idx} className="flex flex-col gap-1">
                              <div className="flex justify-between text-xs">
                                <span className="font-medium text-text-main truncate pr-2">{driver.feature.replace(/_/g, ' ')}</span>
                                <span className={driver.impact > 0 ? "text-status-success-text font-medium" : "text-status-error-text font-medium"}>
                                  {driver.impact > 0 ? "+" : ""}{(driver.impact * 100).toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-app-bg rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${driver.impact > 0 ? 'bg-status-success-text' : 'bg-status-error-text'}`}
                                  style={{ width: `${Math.min(Math.abs(driver.impact * 100) * 2, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted text-center py-4">Run an assessment to see feature drivers.</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-surface">
                    <CardHeader>
                      <CardTitle>Study Habits</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-text-muted">Study Time (daily)</span>
                          <span className="font-medium">{Math.round(data.profile.activities.study_minutes_per_day / 60)} hrs</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-text-muted">Attendance</span>
                          <span className="font-medium">{data.profile.academics.attendance_rate}%</span>
                        </div>
                        <div className="flex justify-between border-b pb-2">
                          <span className="text-text-muted">Sleep Hours</span>
                          <span className="font-medium">{data.profile.activities.sleep_hours_per_night} hrs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">Stress Level</span>
                          <span className="font-medium capitalize">{data.profile.activities.stress_level}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
