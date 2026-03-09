import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ForgotPassword = () => {
  const { /* reset */ } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email');
      return;
    }

    setLoading(true);
   /* try {
      await reset(email);
      toast.success('Password reset link sent!');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }*/
  };

  return (
    <>
      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes grid-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.6; }
        }

        @media (min-width: 768px) {
          .deepiri-image-side {
            display: flex !important;
          }
          .deepiri-form-side {
            width: 50% !important;
          }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        background: '#09090b'
      }}>

        {/* Left Side */}
        <div
          className="deepiri-image-side"
          style={{
            display: 'none',
            width: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0a0a1a, #1a0a2e, #0a0a1a)',
            backgroundSize: '400% 400%',
            animation: 'gradient-shift 15s ease infinite',
            position: 'relative'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `
                linear-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 255, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-pulse 4s ease-in-out infinite'
            }}
          />

          <h1 style={{
            fontSize: '80px',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            zIndex: 2
          }}>
            Deepiri
          </h1>
        </div>

        {/* Right Side */}
        <div
          className="deepiri-form-side"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem 1.5rem',
            background: 'rgba(9, 9, 11, 0.8)',
            backdropFilter: 'blur(10px)'
          }}
        >
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{ textAlign: 'center', marginBottom: '2rem' }}
            >
              <h1 style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Forgot Password
              </h1>

              <p style={{ color: '#9ca3af', marginTop: '0.75rem' }}>
                Enter your email and we’ll send you a reset link.
              </p>
            </motion.div>

            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label style={{
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  display: 'block'
                }}>
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                  placeholder="ash@deepiri.app"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '0.5rem',
                    color: 'white',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#27272a'}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.75rem',
                  background: '#27272a',
                  color: 'white',
                  borderRadius: '9999px',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.5 : 1,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.background = '#3f3f46';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.background = '#27272a';
                }}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </button>
            </motion.form>

            <p style={{
              textAlign: 'center',
              marginTop: '2rem',
              color: '#9ca3af',
              fontSize: '0.875rem'
            }}>
              Remembered your password?{' '}
              <Link to="/login" style={{ color: '#60a5fa', textDecoration: 'underline' }}>
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;