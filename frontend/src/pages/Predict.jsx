import React, { useState } from 'react';

const INITIAL_STATE = {
  study_hours_per_week: '',
  attendance_percentage: '',
  material_prep_hours: '',
  extracurricular_hours: '',
  skill_dev_hours: '',
  projects_completed: '',
  hackathons_participated: '',
  internship_experience: '0',
  coding_platform_rating: '',
  previous_gpa: ''
};

export default function Predict() {
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    
    try {
      const payload = {
        study_hours_per_week: parseFloat(formData.study_hours_per_week),
        attendance_percentage: parseFloat(formData.attendance_percentage),
        material_prep_hours: parseFloat(formData.material_prep_hours),
        extracurricular_hours: parseFloat(formData.extracurricular_hours),
        skill_dev_hours: parseFloat(formData.skill_dev_hours),
        projects_completed: parseInt(formData.projects_completed),
        hackathons_participated: parseInt(formData.hackathons_participated),
        internship_experience: parseInt(formData.internship_experience),
        coding_platform_rating: parseFloat(formData.coding_platform_rating),
        previous_gpa: parseFloat(formData.previous_gpa)
      };

      const res = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Failed to fetch prediction");
      
      const data = await res.json();
      setPrediction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white shadow sm:rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Study Hours / Week</label>
              <input type="number" step="0.1" required name="study_hours_per_week" value={formData.study_hours_per_week} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Attendance %</label>
              <input type="number" step="0.1" required name="attendance_percentage" value={formData.attendance_percentage} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Material Prep Hours</label>
              <input type="number" step="0.1" required name="material_prep_hours" value={formData.material_prep_hours} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Extracurricular Hours</label>
              <input type="number" step="0.1" required name="extracurricular_hours" value={formData.extracurricular_hours} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Skill Dev Hours</label>
              <input type="number" step="0.1" required name="skill_dev_hours" value={formData.skill_dev_hours} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Coding Platform Rating</label>
              <input type="number" step="0.1" required name="coding_platform_rating" value={formData.coding_platform_rating} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Previous GPA</label>
              <input type="number" step="0.01" required name="previous_gpa" value={formData.previous_gpa} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Projects Completed</label>
              <input type="number" required name="projects_completed" value={formData.projects_completed} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Hackathons</label>
              <input type="number" required name="hackathons_participated" value={formData.hackathons_participated} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Internship Experience</label>
              <select name="internship_experience" value={formData.internship_experience} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                <option value="0">No (0)</option>
                <option value="1">Yes (1)</option>
              </select>
            </div>

          </div>
          
          <div>
            <button disabled={loading} type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              {loading ? 'Predicting...' : 'Generate Prediction'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow sm:rounded-lg p-6 h-fit">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Results</h2>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}

        {prediction ? (
          <div className="space-y-6">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-indigo-600 mb-1">Predicted Final Score</p>
              <p className="text-3xl font-extrabold text-indigo-900">{prediction.final_score.toFixed(1)}</p>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
              <p className="text-sm font-medium text-green-600 mb-1">Productivity Index</p>
              <p className="text-3xl font-extrabold text-green-900">{prediction.productivity_index.toFixed(1)}</p>
            </div>
          </div>
        ) : (
          !error && (
            <div className="text-center py-10 text-gray-500">
              <p>Fill out the form and submit to see predictions.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
