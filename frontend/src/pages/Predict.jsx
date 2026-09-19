import React, { useState } from 'react';
import { Upload, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [mode, setMode] = useState('single'); // 'single' | 'batch'
  
  // Single prediction state
  const [formData, setFormData] = useState(INITIAL_STATE);
  const [prediction, setPrediction] = useState(null);
  
  // Batch prediction state
  const [file, setFile] = useState(null);
  const [batchResults, setBatchResults] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Single Prediction Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSingleSubmit = async (e) => {
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
      toast.success('Prediction generated and saved to history!');
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Batch Prediction Handlers ---
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setBatchResults(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/predict/batch', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok || data.error) throw new Error(data.error || "Failed to process batch");
      
      setBatchResults(data);
      toast.success(`Successfully processed ${data.length} records!`);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!batchResults || batchResults.length === 0) return;
    
    // Create CSV string
    const headers = Object.keys(batchResults[0]);
    const csvContent = [
      headers.join(','),
      ...batchResults.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    // Create a blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "predictions_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-200 p-1 rounded-lg inline-flex">
          <button
            className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${mode === 'single' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => { setMode('single'); setError(null); }}
          >
            Single Prediction
          </button>
          <button
            className={`px-6 py-2 rounded-md font-medium text-sm transition-colors ${mode === 'batch' ? 'bg-white shadow text-indigo-600' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => { setMode('batch'); setError(null); }}
          >
            Batch Upload (CSV)
          </button>
        </div>
      </div>

      {mode === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Profile</h2>
            <form onSubmit={handleSingleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Study Hours / Week</label>
                  <input type="number" step="0.1" required name="study_hours_per_week" value={formData.study_hours_per_week} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Attendance %</label>
                  <input type="number" step="0.1" required name="attendance_percentage" value={formData.attendance_percentage} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Material Prep Hours</label>
                  <input type="number" step="0.1" required name="material_prep_hours" value={formData.material_prep_hours} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Extracurricular Hours</label>
                  <input type="number" step="0.1" required name="extracurricular_hours" value={formData.extracurricular_hours} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skill Dev Hours</label>
                  <input type="number" step="0.1" required name="skill_dev_hours" value={formData.skill_dev_hours} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Coding Platform Rating</label>
                  <input type="number" step="0.1" required name="coding_platform_rating" value={formData.coding_platform_rating} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous GPA</label>
                  <input type="number" step="0.01" required name="previous_gpa" value={formData.previous_gpa} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Projects Completed</label>
                  <input type="number" required name="projects_completed" value={formData.projects_completed} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Hackathons</label>
                  <input type="number" required name="hackathons_participated" value={formData.hackathons_participated} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Internship Experience</label>
                  <select name="internship_experience" value={formData.internship_experience} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm">
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
            {error && <div className="bg-red-50 text-red-700 p-4 rounded-md mb-4 text-sm">{error}</div>}
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
            ) : (!error && <div className="text-center py-10 text-gray-500">Fill out the form to see predictions.</div>)}
          </div>
        </div>
      )}

      {mode === 'batch' && (
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Batch Predictions</h2>
          <p className="text-gray-600 mb-6">Upload a CSV file containing student data to get predictions for all records at once.</p>
          
          <form onSubmit={handleBatchSubmit} className="mb-8">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">CSV up to 10MB</p>
              </div>
            </div>
            {file && <p className="mt-2 text-sm text-gray-600">Selected file: <span className="font-semibold">{file.name}</span></p>}
            
            {error && <div className="mt-4 bg-red-50 text-red-700 p-4 rounded-md text-sm">{error}</div>}

            <button disabled={loading || !file} type="submit" className="mt-6 w-full sm:w-auto flex justify-center items-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
              <Upload className="w-4 h-4 mr-2" />
              {loading ? 'Processing...' : 'Process Batch'}
            </button>
          </form>

          {batchResults && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Results ({batchResults.length} records)</h3>
                <button onClick={exportCSV} className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </button>
              </div>
              
              <div className="overflow-x-auto border border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student ID</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase tracking-wider">Pred Final Score</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase tracking-wider">Pred Prod. Index</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Study Hours</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GPA</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {batchResults.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.student_id || `Row ${idx+1}`}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-900">{row.predicted_final_score}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-900">{row.predicted_productivity_index}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.study_hours_per_week}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.previous_gpa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {batchResults.length > 5 && (
                  <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-500">
                    Showing 5 of {batchResults.length} records. Export to view all.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
