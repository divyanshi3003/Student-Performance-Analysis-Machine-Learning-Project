import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

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
    if (category === 'Excellent' || category === 'Good') return 'bg-status-success-bg text-status-success-text';
    if (category === 'Average') return 'bg-status-warning-bg text-status-warning-text';
    if (category === 'Poor' || category === 'Low') return 'bg-status-error-bg text-status-error-text';
    return 'bg-app-bg text-text-muted';
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.student_identifier.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === 'At Risk') return matchesSearch && (s.latest_category === 'Poor' || s.latest_category === 'Low');
    if (filter === 'Excellent') return matchesSearch && s.latest_category === 'Excellent';
    return matchesSearch;
  });

  if (loading) return <div className="text-center py-20">Loading Teacher Dashboard...</div>;

  return (
    <Layout title="Teacher Portal" subtitle="Monitor student performance">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-main">Teacher Dashboard</h1>
          <p className="text-text-muted">Monitor student performance and identify at-risk individuals early.</p>
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
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-default bg-surface text-xs font-semibold text-text-muted uppercase tracking-wider">
                    <th className="py-4 px-6">Student ID</th>
                    <th className="py-4 px-6">Department</th>
                    <th className="py-4 px-6">Sem</th>
                    <th className="py-4 px-6 text-right">Latest Predicted Score</th>
                    <th className="py-4 px-6">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-default">
                  {filteredStudents.length > 0 ? filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-surface-hover transition-colors">
                      <td className="py-4 px-6 font-medium text-text-main flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary-500"></div>
                        {student.student_identifier}
                      </td>
                      <td className="py-4 px-6 text-text-muted">{student.department}</td>
                      <td className="py-4 px-6 text-text-muted">{student.semester}</td>
                      <td className="py-4 px-6 text-right font-medium text-text-main">
                        {student.latest_score !== null ? (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-app-bg rounded-full overflow-hidden">
                              <div className="h-full bg-primary-500 rounded-full" style={{ width: `${student.latest_score}%` }}></div>
                            </div>
                            <span>{student.latest_score.toFixed(1)}%</span>
                          </div>
                        ) : 'No Data'}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getCategoryBadge(student.latest_category)}`}>
                          {student.latest_category}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-text-muted text-sm">No students match the criteria.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
      </Card>
    </div>
    </Layout>
  );
}
