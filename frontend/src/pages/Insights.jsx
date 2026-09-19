import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, ZAxis } from 'recharts';

export default function Insights() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Static Feature Importance from the ML model
  const featureImportance = [
    { name: 'Coding Rating', importance: 0.35 },
    { name: 'Study Hours', importance: 0.25 },
    { name: 'Previous GPA', importance: 0.15 },
    { name: 'Attendance', importance: 0.10 },
    { name: 'Projects', importance: 0.08 },
    { name: 'Hackathons', importance: 0.05 },
    { name: 'Other', importance: 0.02 },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/history');
        if (res.ok) {
          const data = await res.json();
          // Sort chronologically for the line chart
          setHistory(data.reverse()); 
        }
      } catch (err) {
        console.error("Failed to load history for insights", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Insights</h2>
        <p className="text-gray-600 mb-6">Understanding factors that influence student success and viewing your prediction history.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Static Feature Importance Chart */}
          <div className="h-80 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Global Feature Importance</h3>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} horizontal={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} cursor={{fill: 'transparent'}} />
                <Bar dataKey="importance" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Dynamic History Timeline */}
          <div className="h-80 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Your Recent Predictions Trend</h3>
            {loading ? (
              <div className="flex h-full items-center justify-center text-gray-400">Loading...</div>
            ) : history.length < 2 ? (
              <div className="flex h-full items-center justify-center text-gray-400 text-center px-4">
                Not enough history to show a trend. Make more predictions!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <LineChart data={history} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="id" tickFormatter={(id) => `#${id}`} axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip labelFormatter={(label) => `Prediction #${label}`} />
                  <Line type="monotone" dataKey="predicted_score" name="Final Score" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="predicted_productivity" name="Prod. Index" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Dynamic Scatter Plot */}
        <div className="h-96 bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 text-center">Study Hours vs. Predicted Score (History)</h3>
          {loading ? (
            <div className="flex h-full items-center justify-center text-gray-400">Loading...</div>
          ) : history.length === 0 ? (
            <div className="flex h-full items-center justify-center text-gray-400">No data available.</div>
          ) : (
            <ResponsiveContainer width="100%" height="90%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="study_hours" name="Study Hours" label={{ value: 'Study Hours / Week', position: 'insideBottom', offset: -10 }} />
                <YAxis type="number" dataKey="predicted_score" name="Predicted Score" label={{ value: 'Final Score', angle: -90, position: 'insideLeft' }} domain={['auto', 'auto']} />
                <Tooltip cursor={{strokeDasharray: '3 3'}} />
                <Scatter name="Students" data={history} fill="#8b5cf6" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
