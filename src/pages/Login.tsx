import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
    } catch(error){
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes grid-pulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.6; }
        }
          

        @media (min-width: 768px) {
          .deepiri-image-side-login {
            display: flex !important;
          }
          .deepiri-form-side-login {
            width: 50% !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          background: '#09090b',
          overflow: 'hidden'
        }}
      >
        {/* Left Side */}
        <div
          className="deepiri-form-side-login"
          style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          background: 'rgba(9, 9, 11, 0.8)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 2
          }}
        >
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ textAlign: 'center', marginBottom: '2rem' }}
            >
              <h1
                style={{
                  fontSize: '2.25rem',
                  fontWeight: 'bold',
                  background:
                    'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0
                }}
              >
                Log in to Deepiri
              </h1>
            </motion.div>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label style={{ color: 'white', fontSize: '0.875rem' }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ash@deepiri.app"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '0.5rem',
                    color: 'white'
                  }}
                />
              </div>

              <div>
                <label style={{ color: 'white', fontSize: '0.875rem' }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      paddingRight: '4rem',
                      background: '#18181b',
                      border: '1px solid #27272a',
                      borderRadius: '0.5rem',
                      color: 'white'
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '1rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#71717a',
                      cursor: 'pointer',
                      fontSize: '0.75rem'
                    }}
                  >
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                </div>

                <Link to="/forgot" style={{ marginTop: '0.5rem' }}>
                  <span style={{ color: '#60a5fa', fontSize: '0.875rem' }}>
                    Forgot your password?
                  </span>
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem',
                  borderRadius: '9999px',
                  background: '#0ea5e9',
                  color: 'white',
                  fontWeight: 600,
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = '#38bdf8';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = '#0ea5e9';
                }}
              >
                {loading ? 'Logging in…' : 'Log in'}
              </button>
            </motion.form>

            {/* Footer */}
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: 0 }}>
                Need an account?{' '}
                <Link
                  to="/register"
                  style={{ color: '#60a5fa', textDecoration: 'underline' }}
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div
          className="deepiri-image-side-login"
          style={{
            display: 'none',
            width: '50%',
            position: 'relative',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            background:
              'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0f0a1f 50%, #1a0a2e 75%, #0a0a1a 100%)',
            backgroundSize: '400% 400%',
            animation: 'gradient-shift 15s ease infinite'
          }}
        >
          {/* Grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(0,212,255,0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,212,255,0.15) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-pulse 4s ease-in-out infinite',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />

          {/* Logo */}
          <div style={{ 
            position: 'relative', 
            textAlign: 'center',
            zIndex: 10
            }}>
            <h1 style={{
              fontSize: '80px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 3s ease infinite',
              letterSpacing: '2px',
              margin: 0
              }}
            >
              Deepiri
            </h1>
           
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
