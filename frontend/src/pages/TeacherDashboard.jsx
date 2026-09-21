import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    api.get('/students/all')
      .then(res => {
        setStudents(res.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const getCategoryBadge = (category) => {
    if (category === 'Excellent' || category === 'Good') return 'bg-emerald-100 text-emerald-800';
    if (category === 'Average') return 'bg-amber-100 text-amber-800';
    if (category === 'Poor' || category === 'Low') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.student_identifier.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'At Risk') return matchesSearch && (s.latest_category === 'Poor' || s.latest_category === 'Low');
    if (filter === 'Excellent') return matchesSearch && s.latest_category === 'Excellent';
    return matchesSearch;
  });

  if (loading) return <div className="text-center py-20">Loading Teacher Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
        <p className="text-gray-500">Monitor student performance and identify at-risk individuals early.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="py-4">
            <p className="text-sm font-medium text-gray-500">Total Students</p>
            <div className="text-2xl font-bold text-gray-900">{students.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-sm font-medium text-gray-500">At Risk</p>
            <div className="text-2xl font-bold text-red-600">
              {students.filter(s => s.latest_category === 'Poor' || s.latest_category === 'Low').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Roster</CardTitle>
          <div className="flex gap-4">
            <input 
              type="text"
              placeholder="Search ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            />
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="All">All Students</option>
              <option value="At Risk">At Risk Only</option>
              <option value="Excellent">Excellent Only</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b text-sm font-medium text-gray-500">
                  <th className="py-3 px-4">Student ID</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Sem</th>
                  <th className="py-3 px-4 text-right">Latest Predicted Score</th>
                  <th className="py-3 px-4">Category</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">{student.student_identifier}</td>
                    <td className="py-3 px-4 text-gray-600">{student.department}</td>
                    <td className="py-3 px-4 text-gray-600">{student.semester}</td>
                    <td className="py-3 px-4 text-right font-medium">
                      {student.latest_score !== null ? `${student.latest_score.toFixed(1)}%` : 'No Data'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryBadge(student.latest_category)}`}>
                        {student.latest_category}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">No students match the criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
