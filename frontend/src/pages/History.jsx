import React, { useState, useEffect } from 'react';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:8000/history');
        if (!res.ok) throw new Error("Failed to fetch history");
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Prediction History</h2>
      <p className="text-gray-600 mb-6">A log of all previous single predictions saved in the database.</p>
      
      {loading ? (
        <p className="text-gray-500">Loading history...</p>
      ) : error ? (
        <div className="bg-red-50 text-red-700 p-4 rounded-md">{error}</div>
      ) : history.length === 0 ? (
        <p className="text-gray-500 italic">No prediction history found. Make a prediction first!</p>
      ) : (
        <div className="overflow-x-auto border border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-indigo-600 uppercase">Pred Score</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-green-600 uppercase">Pred Prod</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Study Hrs</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">GPA</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((row) => (
                <tr key={row.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(row.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-900">{row.predicted_score}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-900">{row.predicted_productivity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.study_hours}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.attendance}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{row.previous_gpa}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
