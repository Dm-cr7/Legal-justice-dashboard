import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import API from '../api/axios';
import { LogIn } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// Validation schema
const loginSchema = z.object({
  email: z.string().email({ message: 'Enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function Login() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      const res = await API.post('/api/auth/login', data); // assumes correct API prefix
      const { token, user } = res.data;

      const role = user?.role;
      if (!role) throw new Error('No role assigned.');

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      navigate(role === 'advocate' ? '/dashboard/advocate' : '/dashboard/paralegal');
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Login failed.';
      setApiError(errorMsg);
    }
  };

  return (
    <div className="login-page">
      <div className="branding">
        <img src="/logo.png" alt="App Logo" className="logo" />
        <h2 className="title">Sign in</h2>
      </div>

      <Motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="form-container"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="form">
          <div>
            <label htmlFor="email" className="label">Email address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
              className="input"
            />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
              className="input"
            />
            {errors.password && <p className="error">{errors.password.message}</p>}
          </div>

          <AnimatePresence>
            {apiError && (
              <Motion.div
                key="apiError"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="api-error"
              >
                {apiError}
              </Motion.div>
            )}
          </AnimatePresence>

          <button type="submit" disabled={isSubmitting} className="submit-btn">
            {isSubmitting ? 'Signing in...' : (
              <>
                <LogIn size={20} /> Sign In
              </>
            )}
          </button>
        </form>

        <p className="footer-link">
          Don’t have an account? <Link to="/register">Register here</Link>
        </p>
      </Motion.div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(to bottom right, #cbd5e1, #e2e8f0);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }
        .branding {
          margin-bottom: 2rem;
          text-align: center;
        }
        .logo {
          height: 48px;
          margin-bottom: 0.5rem;
        }
        .title {
          font-size: 2rem;
          font-weight: 600;
          color: #1e293b;
        }
        .form-container {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .label {
          font-size: 0.875rem;
          color: #334155;
          margin-bottom: 0.25rem;
        }
        .input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: #f8fafc;
          font-size: 1rem;
        }
        .input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
        }
        .error {
          color: #dc2626;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }
        .api-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          padding: 0.75rem;
          border-radius: 8px;
          color: #b91c1c;
          font-size: 0.875rem;
        }
        .submit-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: #2563eb;
          color: white;
          font-weight: 500;
          border: none;
          border-radius: 6px;
          cursor: pointer;
        }
        .submit-btn:hover {
          background: #1d4ed8;
        }
        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .footer-link {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.875rem;
          color: #64748b;
        }
        .footer-link a {
          color: #2563eb;
          text-decoration: none;
        }
        .footer-link a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
