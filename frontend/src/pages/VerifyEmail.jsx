import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, Mail, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { resendVerification } = useAuth();

  const status = searchParams.get('insforge_status');
  const type = searchParams.get('insforge_type');
  const errorParam = searchParams.get('insforge_error');

  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(null);
  const [resendError, setResendError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  const isSuccess = status === 'success';
  const isError = status === 'error' || Boolean(errorParam);

  // Auto redirect countdown on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/login?verified=true');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSuccess, navigate]);

  // Resend cooldown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail) return;
    setResending(true);
    setResendSuccess(null);
    setResendError(null);

    try {
      await resendVerification(resendEmail);
      setResendSuccess(`A new verification link has been sent to ${resendEmail}. Please check your Gmail inbox or spam folder.`);
      setCountdown(60);
    } catch (err) {
      setResendError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-surface border border-border-default p-8 text-center">
        {/* Branding */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center text-white font-bold">
            EM
          </div>
          <span className="font-bold text-lg text-text-main">EduMetrics ML</span>
        </div>

        {isSuccess ? (
          <div>
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-text-main mb-2">Email Verified!</h1>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">
              Your email address has been successfully verified. Your account is now fully active.
            </p>

            <div className="bg-emerald-50/60 border border-emerald-200 text-emerald-800 text-xs py-2.5 px-4 rounded-lg mb-6">
              Redirecting to login in <span className="font-semibold">{redirectCountdown}s</span>...
            </div>

            <Button
              className="w-full flex items-center justify-center gap-2 py-3"
              onClick={() => navigate('/login?verified=true')}
            >
              <span>Continue to Log In</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        ) : isError ? (
          <div>
            <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-text-main mb-2">Verification Failed</h1>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">
              {errorParam
                ? decodeURIComponent(errorParam)
                : 'The verification link is invalid, expired, or has already been used.'}
            </p>

            {resendSuccess && (
              <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-lg text-left">
                {resendSuccess}
              </div>
            )}
            {resendError && (
              <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-lg text-left">
                {resendError}
              </div>
            )}

            <form onSubmit={handleResend} className="space-y-3 mb-6 text-left">
              <label className="text-xs font-medium text-text-muted">Resend verification link</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  placeholder="your.email@gmail.com"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button
                  type="submit"
                  disabled={resending || countdown > 0}
                  className="whitespace-nowrap text-xs px-3 py-2 flex items-center gap-1"
                >
                  {resending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : countdown > 0 ? (
                    `${countdown}s`
                  ) : (
                    'Resend'
                  )}
                </Button>
              </div>
            </form>

            <Link
              to="/login"
              className="inline-block text-xs font-medium text-primary-600 hover:text-primary-700 underline"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-text-main mb-2">Email Verification</h1>
            <p className="text-text-muted text-sm mb-6 leading-relaxed">
              Please click the verification link sent to your registered email address to verify your account.
            </p>
            <Button
              className="w-full py-3"
              onClick={() => navigate('/login')}
            >
              Go to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
