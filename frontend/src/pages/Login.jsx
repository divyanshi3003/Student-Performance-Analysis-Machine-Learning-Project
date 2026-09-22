import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // UI only states for tabs
  const [activeTab, setActiveTab] = useState('login');
  const [activeRole, setActiveRole] = useState('student');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      if (activeTab === 'signup') {
        await signup(email, password, activeRole);
        setMessage("Signup successful! You can now log in.");
        setActiveTab('login');
      } else {
        const data = await login(email, password);
        // Supabase returns data.user and data.session
        const role = data?.user?.user_metadata?.role || activeRole;
        if (role === 'teacher' || role === 'admin') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* LEFT PANEL / BOTTOM PANEL (Mobile) - Branding */}
      <div className="order-2 md:order-1 flex-1 bg-primary-600 md:bg-primary-50 p-8 md:p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden text-white md:text-text-main">
        
        {/* Logo - Hidden on mobile in this panel, shown on top panel instead */}
        <div className="hidden md:flex items-center gap-2 text-primary-600 mb-16">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">
            EM
          </div>
          <span className="font-bold text-lg text-text-main">EduMetrics ML</span>
        </div>

        <div className="max-w-md z-10">
          <p className="text-xs font-bold tracking-widest text-primary-200 md:text-primary-600 uppercase mb-4">
            AI-Powered Student Intelligence
          </p>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 md:leading-tight">
            {window.innerWidth < 768 ? 'Understand what drives your next result.' : 'See the signals behind every student outcome.'}
          </h1>
          <p className="text-primary-100 md:text-text-muted mb-12 hidden md:block">
            Explainable predictions turn attendance, academics, and daily habits into timely, actionable support.
          </p>
          
          {/* Faux Chart Graphic */}
          <div className="bg-white/10 md:bg-white p-6 rounded-2xl md:shadow-surface flex items-end gap-3 h-48 w-full md:w-[110%]">
            {[40, 55, 60, 85, 65, 90, 100].map((height, i) => (
              <div 
                key={i} 
                className={`flex-1 rounded-t-md opacity-80 ${i < 3 ? 'bg-emerald-400' : 'bg-primary-400'}`}
                style={{ height: `${height}%` }}
              ></div>
            ))}
          </div>
        </div>
        
        <div className="absolute bottom-8 left-8 text-xs text-primary-200 md:text-text-muted hidden md:block">
          Trusted predictions • Explainable factors • Role-based privacy
        </div>
      </div>

      {/* RIGHT PANEL / TOP PANEL (Mobile) - Auth Form */}
      <div className="order-1 md:order-2 flex-1 bg-surface p-8 md:p-12 lg:p-24 flex flex-col justify-center">
        
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">
            EM
          </div>
          <span className="font-bold text-lg text-text-main">EduMetrics ML</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          <h2 className="text-3xl font-bold text-text-main mb-2">Welcome back</h2>
          <p className="text-text-muted mb-8">Sign in or create your EduMetrics account.</p>

          {/* Login / Signup Tabs */}
          <div className="flex p-1 bg-app-bg rounded-lg mb-6">
            <button 
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'login' ? 'bg-surface shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
              onClick={() => setActiveTab('login')}
            >
              Log In
            </button>
            <button 
              type="button"
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'signup' ? 'bg-surface shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
              onClick={() => setActiveTab('signup')}
            >
              Sign Up
            </button>
          </div>

          {/* Role Toggle (Only show on Signup) */}
          {activeTab === 'signup' && (
            <div className="flex gap-2 mb-6">
              <button 
                type="button"
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${activeRole === 'student' ? 'bg-primary-100 text-primary-700' : 'text-text-muted hover:bg-app-bg'}`}
                onClick={() => setActiveRole('student')}
              >
                Student
              </button>
              <button 
                type="button"
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${activeRole === 'teacher' ? 'bg-primary-100 text-primary-700' : 'text-text-muted hover:bg-app-bg'}`}
                onClick={() => setActiveRole('teacher')}
              >
                Teacher
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-status-error-bg border border-status-error-border text-status-error-text px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-6 bg-status-success-bg border border-status-success-border text-status-success-text px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Email address</label>
              <Input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.morgan@university.edu"
                className="w-full"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-text-muted">Password</label>
              <Input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full ${error ? 'border-status-error-border focus:ring-status-error-border' : ''}`}
              />
              {error && <p className="text-[10px] text-status-error-text mt-1">Example: password must contain at least 8 characters</p>}
            </div>

            <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
              {loading ? 'Authenticating...' : (activeTab === 'login' ? 'Log In Securely' : 'Sign Up')}
            </Button>
            
            <div className="mt-6 flex items-center justify-center text-xs text-text-muted gap-1">
              <Lock className="w-3 h-3 text-status-success-border" />
              <span>Protected by secure Supabase authentication.</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
