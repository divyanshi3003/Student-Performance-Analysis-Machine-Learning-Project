import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, signup, resendVerification } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // UI states for tabs and roles
  const [activeTab, setActiveTab] = useState('login');
  const [activeRole, setActiveRole] = useState('student');

  // Verification states
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState(null);

  // Check URL parameters on mount
  useEffect(() => {
    const verified = searchParams.get('verified');
    const status = searchParams.get('insforge_status');
    const errorParam = searchParams.get('insforge_error');

    if (verified === 'true' || status === 'success') {
      setMessage('Your email has been verified successfully! You can now log in.');
      setActiveTab('login');
    } else if (status === 'error' || errorParam) {
      setError(errorParam ? decodeURIComponent(errorParam) : 'Verification failed or link expired. Please log in or request a new link.');
    }
  }, [searchParams]);

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setUnverifiedEmail(null);
    setResendMessage(null);
    
    try {
      if (activeTab === 'signup') {
        const res = await signup(email, password, activeRole);
        if (res?.requireEmailVerification) {
          setVerificationEmail(res.email || email);
          setIsVerificationSent(true);
          setResendCooldown(60);
          return;
        }
        setMessage("Signup successful! You can now log in.");
        setActiveTab('login');
      } else {
        const data = await login(email, password);
        const role = data?.user?.role || activeRole;
        if (role === 'teacher' || role === 'admin') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      if (err.isUnverified) {
        setUnverifiedEmail(err.email || email);
      }
      setError(err.message || "Failed to authenticate. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async (targetEmail) => {
    const emailToUse = targetEmail || verificationEmail || email;
    if (!emailToUse || resendCooldown > 0 || resending) return;
    
    setResending(true);
    setResendMessage(null);
    try {
      await resendVerification(emailToUse);
      setResendMessage(`Verification email resent to ${emailToUse}. Please check your Gmail inbox or spam folder.`);
      setResendCooldown(60);
    } catch (err) {
      setError(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      {/* LEFT PANEL / BOTTOM PANEL (Mobile) - Branding */}
      <div className="order-2 md:order-1 flex-1 bg-primary-600 md:bg-primary-50 p-8 md:p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden text-white md:text-text-main">
        
        {/* Logo */}
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
            See the signals behind every student outcome.
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

      {/* RIGHT PANEL / TOP PANEL (Mobile) - Auth Form / Email Verification */}
      <div className="order-1 md:order-2 flex-1 bg-surface p-8 md:p-12 lg:p-24 flex flex-col justify-center">
        
        {/* Mobile Logo */}
        <div className="md:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">
            EM
          </div>
          <span className="font-bold text-lg text-text-main">EduMetrics ML</span>
        </div>

        <div className="w-full max-w-md mx-auto">
          {/* CASE 1: VERIFICATION EMAIL SENT SCREEN */}
          {isVerificationSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold text-text-main mb-3">Check your email</h2>
              <p className="text-text-muted text-sm mb-4 leading-relaxed">
                We've sent a verification link to:
              </p>
              <div className="bg-app-bg text-text-main font-semibold text-sm py-2 px-4 rounded-lg inline-block mb-6 border border-border-default break-all">
                {verificationEmail}
              </div>
              <p className="text-text-muted text-xs mb-8 leading-relaxed">
                Please click the link in your email to verify your Gmail address and activate your account. Be sure to check your spam or promotions folder if you don't see it within a minute.
              </p>

              {resendMessage && (
                <div className="mb-6 bg-status-success-bg border border-status-success-border text-status-success-text px-4 py-3 rounded-md text-xs text-left">
                  {resendMessage}
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  type="button" 
                  variant="secondary"
                  className="w-full py-3 flex items-center justify-center gap-2 text-sm"
                  disabled={resending || resendCooldown > 0}
                  onClick={() => handleResendVerification(verificationEmail)}
                >
                  {resending ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Resending email...</span>
                    </>
                  ) : resendCooldown > 0 ? (
                    <span>Resend email in {resendCooldown}s</span>
                  ) : (
                    <span>Resend Verification Email</span>
                  )}
                </Button>

                <button
                  type="button"
                  className="w-full py-2.5 text-xs text-text-muted hover:text-text-main flex items-center justify-center gap-1 transition-colors"
                  onClick={() => {
                    setIsVerificationSent(false);
                    setActiveTab('login');
                  }}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </button>
              </div>
            </div>
          ) : (
            /* CASE 2: REGULAR LOGIN / SIGNUP FORM */
            <div>
              <h2 className="text-3xl font-bold text-text-main mb-2">
                {activeTab === 'login' ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-text-muted mb-8">
                {activeTab === 'login' ? 'Sign in to access your EduMetrics dashboard.' : 'Sign up to get AI-powered academic insights.'}
              </p>

              {/* Login / Signup Tabs */}
              <div className="flex p-1 bg-app-bg rounded-lg mb-6">
                <button 
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'login' ? 'bg-surface shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                  onClick={() => {
                    setActiveTab('login');
                    setError(null);
                    setMessage(null);
                    setUnverifiedEmail(null);
                  }}
                >
                  Log In
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === 'signup' ? 'bg-surface shadow-sm text-text-main' : 'text-text-muted hover:text-text-main'}`}
                  onClick={() => {
                    setActiveTab('signup');
                    setError(null);
                    setMessage(null);
                    setUnverifiedEmail(null);
                  }}
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

              {/* Error Alert */}
              {error && (
                <div className="mb-6 bg-status-error-bg border border-status-error-border text-status-error-text px-4 py-3 rounded-md text-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p>{error}</p>
                      {unverifiedEmail && (
                        <div className="mt-2 pt-2 border-t border-status-error-border/30 flex items-center justify-between">
                          <span className="text-xs">Need another link?</span>
                          <button
                            type="button"
                            disabled={resending || resendCooldown > 0}
                            onClick={() => handleResendVerification(unverifiedEmail)}
                            className="text-xs font-semibold underline hover:opacity-80 disabled:opacity-50"
                          >
                            {resending ? 'Sending...' : resendCooldown > 0 ? `Wait ${resendCooldown}s` : 'Resend link'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Message Alert */}
              {message && (
                <div className="mb-6 bg-status-success-bg border border-status-success-border text-status-success-text px-4 py-3 rounded-md text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{message}</span>
                </div>
              )}

              {/* Resend success alert */}
              {resendMessage && (
                <div className="mb-6 bg-status-success-bg border border-status-success-border text-status-success-text px-4 py-3 rounded-md text-sm flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{resendMessage}</span>
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
                    className="w-full"
                  />
                  {activeTab === 'signup' && (
                    <p className="text-[10px] text-text-muted mt-1">Must be at least 6 characters</p>
                  )}
                </div>

                <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
                  {loading 
                    ? 'Processing...' 
                    : (activeTab === 'login' ? 'Log In Securely' : 'Sign Up with Verification')}
                </Button>
                
                <div className="mt-6 flex items-center justify-center text-xs text-text-muted gap-1">
                  <Lock className="w-3 h-3 text-status-success-border" />
                  <span>Protected by InsForge verified authentication.</span>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
