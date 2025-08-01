import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api/axios'; // ✅ Use custom axios instance
import { UserPlus } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schema
const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
  role: z.enum(['advocate', 'paralegal'], { required_error: "Please select a role" }),
});

export default function Register() {
  const navigate = useNavigate();
  const [apiError, setApiError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data) => {
    setApiError(null);
    try {
      await API.post('/api/auth/register', data, { withCredentials: true });
      navigate('/login');
    } catch (err) {
      console.error("Registration failed:", err);
      setApiError(
        err.response?.data?.error || err.message || "An unexpected error occurred."
      );
    }
  };

  return (
    <div className="register-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h1>Create Account</h1>
          <p>Join the Justice App platform</p>
        </div>

        <div className="form-card">
          <form onSubmit={handleSubmit(onSubmit)} className="form-body">
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input id="name" type="text" {...register("name")} placeholder="John Doe" />
              {errors.name && <p className="error-msg">{errors.name.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input id="email" type="email" {...register("email")} placeholder="you@example.com" />
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" {...register("role")}>
                <option value="">Select a role...</option>
                <option value="advocate">Advocate</option>
                <option value="paralegal">Paralegal</option>
              </select>
              {errors.role && <p className="error-msg">{errors.role.message}</p>}
            </div>

            {apiError && (
              <div className="error-box">
                <p>{apiError}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating Account..." : (
                <>
                  <UserPlus size={18} style={{ marginRight: 6 }} />
                  Register
                </>
              )}
            </button>
          </form>
        </div>

        <p className="login-prompt">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <style jsx>{`
        .register-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #eef2f7;
          padding: 2rem;
        }

        .form-wrapper {
          width: 100%;
          max-width: 420px;
        }

        .form-header {
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .form-header h1 {
          font-size: 2rem;
          font-weight: bold;
          color: #1d3557;
        }

        .form-header p {
          font-size: 0.95rem;
          color: #6c757d;
        }

        .form-card {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.06);
          padding: 2rem;
        }

        .form-body {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .form-group input,
        .form-group select {
          padding: 0.6rem 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background-color: #f9fafb;
          font-size: 0.95rem;
        }

        .form-group input:focus,
        .form-group select:focus {
          border-color: #2563eb;
          outline: none;
          box-shadow: 0 0 0 1px #2563eb;
        }

        .error-msg {
          color: #dc2626;
          font-size: 0.85rem;
          margin-top: 0.3rem;
        }

        .error-box {
          background: #fee2e2;
          color: #b91c1c;
          padding: 0.75rem;
          border-radius: 6px;
          text-align: center;
        }

        button {
          background-color: #2563eb;
          color: #fff;
          padding: 0.65rem;
          border: none;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        button:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-prompt {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .login-prompt a {
          color: #2563eb;
          font-weight: 500;
          text-decoration: none;
        }

        .login-prompt a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
