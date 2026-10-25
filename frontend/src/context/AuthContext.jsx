import React, { createContext, useContext, useState, useEffect } from 'react';
import { insforge } from '../services/insforge';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session on page load/refresh
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const { data, error } = await insforge.auth.getCurrentUser();
          if (data?.user) {
            // Block unverified users from restoring session
            if (data.user.emailVerified === false) {
              await insforge.auth.signOut();
              localStorage.removeItem('token');
              localStorage.removeItem('user_role');
              setUser(null);
              return;
            }

            let role = localStorage.getItem('user_role') || 'student';
            // Verify and sync with backend
            try {
              const res = await api.get('/auth/me');
              if (res.data?.role) {
                role = res.data.role;
                localStorage.setItem('user_role', role);
              }
            } catch (err) {
              // Token might be expired or backend syncing
            }

            setUser({
              email: data.user.email,
              role: role,
              id: data.user.id,
              name: data.user.profile?.name || data.user.email.split('@')[0],
            });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user_role');
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Session restore error:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      const isUnverified = error.statusCode === 403 || 
                           error.message?.toLowerCase().includes("verif") || 
                           (error.nextActions && String(error.nextActions).toLowerCase().includes("verif"));
      const err = new Error(
        isUnverified
          ? "Please verify your email address before logging in. Check your inbox for the verification link."
          : (error.message || "Invalid email or password")
      );
      err.isUnverified = isUnverified;
      err.email = email;
      throw err;
    }

    if (data?.user?.emailVerified === false) {
      await insforge.auth.signOut();
      localStorage.removeItem('token');
      const err = new Error("Your email address is not verified yet. Please check your inbox for the verification link.");
      err.isUnverified = true;
      err.email = email;
      throw err;
    }

    if (data?.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }

    // Check if there was a pending role selected during signup
    const pendingRole = localStorage.getItem(`pending_role_${email.toLowerCase()}`);
    let role = pendingRole || localStorage.getItem('user_role') || 'student';
    
    if (pendingRole) {
      try {
        await api.put('/auth/me', { role: pendingRole });
        localStorage.setItem('user_role', pendingRole);
        localStorage.removeItem(`pending_role_${email.toLowerCase()}`);
      } catch (err) {
        console.warn("Could not sync pending role to backend", err);
      }
    }

    // Sync with backend to get role
    try {
      const res = await api.get('/auth/me');
      if (res.data?.role) {
        role = res.data.role;
        localStorage.setItem('user_role', role);
      }
    } catch (err) {
      console.warn("Could not fetch user role from backend", err);
    }

    const userData = {
      email: data.user.email,
      role: role,
      id: data.user.id,
      name: data.user.profile?.name || data.user.email.split('@')[0],
    };

    setUser(userData);
    return { user: userData, accessToken: data.accessToken };
  };

  const signup = async (email, password, role = 'student') => {
    // Preserve requested role for when they log in after email verification
    localStorage.setItem(`pending_role_${email.toLowerCase()}`, role);
    localStorage.setItem('user_role', role);

    const redirectUrl = `${window.location.origin}/verify-email`;
    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name: email.split('@')[0],
      redirectTo: redirectUrl,
    });

    if (error) {
      throw new Error(error.message || "Signup failed. Please try again.");
    }

    // If email verification is required or user is not yet verified
    if (data?.requireEmailVerification || !data?.accessToken || data?.user?.emailVerified === false) {
      return {
        requireEmailVerification: true,
        email: data?.user?.email || email,
        data,
      };
    }

    if (data?.accessToken) {
      localStorage.setItem('token', data.accessToken);
      // Immediately set user role on backend
      try {
        await api.put('/auth/me', { role });
      } catch (err) {
        console.warn("Role update failed:", err);
      }

      setUser({
        email: data.user.email,
        role: role,
        id: data.user.id,
        name: data.user.profile?.name || email.split('@')[0],
      });
    }

    return data;
  };

  const resendVerification = async (emailToResend) => {
    const redirectUrl = `${window.location.origin}/verify-email`;
    const { data, error } = await insforge.auth.resendVerificationEmail({
      email: emailToResend,
      redirectTo: redirectUrl,
    });
    if (error) {
      throw new Error(error.message || "Failed to resend verification email. Please try again later.");
    }
    return data;
  };

  const logout = async () => {
    try {
      await insforge.auth.signOut();
    } catch (err) {
      console.error("Signout error:", err);
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user_role');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, resendVerification }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
