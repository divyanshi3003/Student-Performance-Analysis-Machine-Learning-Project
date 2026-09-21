import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function Simulator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState(null);
  
  const [baseData, setBaseData] = useState(null);
  const [originalScore, setOriginalScore] = useState(null);
  
  // What-If Sliders state
  const [simData, setSimData] = useState({
    study_minutes_per_day: 0,
    attendance_percentage: 0,
    sleep_quality: 'Average',
    projects_completed: 0
  });
  
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    // 1. Fetch the student's latest profile
    api.get('/students/me')
      .then(res => {
        const data = res.data;
        const features = {
          ...data.profile,
          ...data.academics,
          ...data.activities
        };
        setBaseData(features);
        
        // Initialize sim state
        setSimData({
          study_minutes_per_day: features.study_minutes_per_day,
          attendance_percentage: features.attendance_percentage,
          sleep_quality: features.sleep_quality,
          projects_completed: features.projects_completed
        });

        // 2. Get baseline score
        return api.post('/predict/single', { features });
      })
      .then(res => {
        setOriginalScore(res.data.predicted_score);
        setSimResult(res.data);
      })
      .catch(err => {
        setError("Failed to load baseline data. Please ensure you have completed an assessment.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSimulate = async () => {
    setSimulating(true);
    
    // Merge base data with simulated overrides
    const features = {
      ...baseData,
      ...simData
    };

    try {
      const res = await api.post('/predict/single', { features });
      setSimResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const getDiff = () => {
    if (!originalScore || !simResult) return 0;
    return simResult.predicted_score - originalScore;
  };

  if (loading) return <div className="text-center py-20">Loading Simulator...</div>;
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>;

  const diff = getDiff();

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">What-If Simulator</h1>
        <p className="text-gray-500">Tweak your habits below to see how they impact your predicted final score.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Simulation Variables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Study Time (Hours/Day)</span>
                <span>{(simData.study_minutes_per_day / 60).toFixed(1)} hrs</span>
              </label>
              <input 
                type="range" min="0" max="840" step="30" // 840 mins = 14 hours
                value={simData.study_minutes_per_day} 
                onChange={e => setSimData({...simData, study_minutes_per_day: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Attendance (%)</span>
                <span>{simData.attendance_percentage}%</span>
              </label>
              <input 
                type="range" min="0" max="100" step="1"
                value={simData.attendance_percentage} 
                onChange={e => setSimData({...simData, attendance_percentage: parseFloat(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                <span>Projects Completed</span>
                <span>{simData.projects_completed}</span>
              </label>
              <input 
                type="range" min="0" max="10" step="1"
                value={simData.projects_completed} 
                onChange={e => setSimData({...simData, projects_completed: parseInt(e.target.value)})}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sleep Quality
              </label>
              <select 
                value={simData.sleep_quality}
                onChange={e => setSimData({...simData, sleep_quality: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Poor">Poor</option>
                <option value="Average">Average</option>
                <option value="Good">Good</option>
              </select>
            </div>

            <Button onClick={handleSimulate} disabled={simulating} className="w-full mt-4">
              {simulating ? 'Calculating...' : 'Run Simulation'}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="flex flex-col justify-center text-center">
          <CardContent>
            <h3 className="text-gray-500 font-medium uppercase tracking-wider text-sm mb-4">Simulated Final Score</h3>
            
            <div className="text-7xl font-bold tracking-tight text-indigo-600 mb-2">
              {simResult.predicted_score.toFixed(1)}<span className="text-3xl opacity-50">%</span>
            </div>
            
            <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${
              simResult.predicted_category === 'Excellent' || simResult.predicted_category === 'Good' 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : simResult.predicted_category === 'Average' 
                ? 'bg-amber-100 text-amber-800 border-amber-300' 
                : 'bg-red-100 text-red-800 border-red-300'
            }`}>
              {simResult.predicted_category}
            </span>

            <div className="mt-8 pt-8 border-t border-gray-100">
              <p className="text-gray-500 mb-2">Compared to your real baseline score ({originalScore.toFixed(1)}%)</p>
              {diff > 0.1 ? (
                <div className="inline-flex items-center text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-md">
                  <span className="mr-1">↑</span> +{diff.toFixed(1)}% Improvement
                </div>
              ) : diff < -0.1 ? (
                <div className="inline-flex items-center text-red-600 font-medium bg-red-50 px-3 py-1 rounded-md">
                  <span className="mr-1">↓</span> {diff.toFixed(1)}% Decline
                </div>
              ) : (
                <div className="inline-flex items-center text-gray-600 font-medium bg-gray-50 px-3 py-1 rounded-md">
                  No significant change
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
