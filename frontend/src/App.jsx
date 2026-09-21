import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import StudentForm from './pages/StudentForm';
import Result from './pages/Result';
import Dashboard from './pages/Dashboard';
import Simulator from './pages/Simulator';
import TeacherDashboard from './pages/TeacherDashboard';

// We'll create Login later, stubbing it for now
const Login = () => <div className="p-10">Login Page (To be implemented)</div>;

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/student/predict" element={
            <PrivateRoute>
              <StudentForm />
            </PrivateRoute>
          } />
          <Route path="/student/result" element={
            <PrivateRoute>
              <Result />
            </PrivateRoute>
          } />
          <Route path="/dashboard" element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } />
          <Route path="/student/simulate" element={
            <PrivateRoute>
              <Simulator />
            </PrivateRoute>
          } />
          <Route path="/teacher/dashboard" element={
            <PrivateRoute>
              <TeacherDashboard />
            </PrivateRoute>
          } />
          <Route path="/" element={<Navigate to="/student/predict" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
