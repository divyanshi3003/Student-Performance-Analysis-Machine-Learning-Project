import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const featureImportance = [
  { name: 'Coding Rating', importance: 0.35 },
  { name: 'Study Hours', importance: 0.25 },
  { name: 'Previous GPA', importance: 0.15 },
  { name: 'Attendance', importance: 0.10 },
  { name: 'Projects', importance: 0.08 },
  { name: 'Hackathons', importance: 0.05 },
  { name: 'Other', importance: 0.02 },
];

const performanceTrend = [
  { hours: 5, score: 55 },
  { hours: 10, score: 65 },
  { hours: 15, score: 75 },
  { hours: 20, score: 82 },
  { hours: 25, score: 88 },
  { hours: 30, score: 92 },
];

export default function Insights() {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Model Insights</h2>
        <p className="text-gray-600 mb-6">Understanding which factors most influence student success.</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="h-80">
            <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">Feature Importance (Random Forest)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureImportance} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip formatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Bar dataKey="importance" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="h-80">
            <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">Expected Score vs. Study Hours</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hours" label={{ value: 'Study Hours / Wk', position: 'insideBottomRight', offset: -10 }} />
                <YAxis label={{ value: 'Final Score', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    </div>
  );
}
