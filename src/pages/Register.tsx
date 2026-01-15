
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const Register = () => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'email' && emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.username || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await register(formData.username, formData.email);
    } catch (error) {
      // Error is handled in the AuthContext
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
            
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          @keyframes grid-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.6; }
          }

          @media (min-width: 768px) {
            .deepiri-image-side {
              display: flex !important;
              animation: glow 4s ease-in-out infinite;
            }
            .deepiri-form-side {
              width: 50% !important;
            }
          }
        `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'row',
        background: '#09090b',
        position: 'relative',
        overflow: 'hidden'
      }}>

        {/* Left Side */}
        <div
          className="deepiri-image-side"
          style={{
            display: 'none',
            width: '50%',
            position: 'relative',
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
            background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 25%, #0f0a1f 50%, #1a0a2e 75%, #0a0a1a 100%)',
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
                linear-gradient(rgba(0, 212, 255, 0.15) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 212, 255, 0.15) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              animation: 'grid-pulse 4s ease-in-out infinite',
              zIndex: 5,
              pointerEvents: 'none',
            }}
    />

          {/* Logo */}
          <div style={{
            textAlign: 'center',
            zIndex: 10,
            position: 'relative'
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
            }}>
              Deepiri
            </h1>

            <p style={{
              marginTop: '16px',
              fontSize: '16px',
              color: '#8b5cf6',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              opacity: 0.7
            }}>
              AI R&D Collective
            </p>
          </div>
        </div>

        {/* Right Side - Form */}
        <div 
         className="deepiri-form-side" 
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
        }}>
          <div style={{
            width: '100%',
            maxWidth: '28rem'
          }}>
            {/* Title */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                textAlign: 'center',
                marginBottom: '2rem'
              }}
            >
              <h1 style={{
                fontSize: '2.25rem',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                marginBottom: '0.75rem',
                margin: '0 0 0.75rem 0'
              }}>
                Sign up for Deepiri
              </h1>
              <p style={{
                color: '#9ca3af',
                fontSize: '1rem',
                lineHeight: '1.5',
                margin: 0
              }}>
                Welcome to Deepiri! We're so glad you're here. Enter your<br />
                email address and a username to get started.
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
              }}
            >
              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="ash@deepiri.app"
                  maxLength={255}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#18181b',
                    border: emailError ? '1px solid #ef4444' : '1px solid #27272a',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    if (!emailError) e.target.style.borderColor = '#3b82f6';
                  }}
                  onBlur={(e) => {
                    if (!emailError) e.target.style.borderColor = '#27272a';
                  }}
                />
                {emailError && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '0.875rem',
                    marginTop: '0.25rem',
                    margin: '0.25rem 0 0 0'
                  }}>{emailError}</p>
                )}
                <div style={{
                  textAlign: 'right',
                  color: '#71717a',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {formData.email.length}/255
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Username <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="Superman23465"
                  maxLength={255}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#27272a'}
                />
                <div style={{
                  textAlign: 'right',
                  color: '#71717a',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {formData.username.length}/255
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••••"
                  maxLength={255}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#18181b',
                    border: '1px solid #27272a',
                    borderRadius: '0.5rem',
                    color: 'white',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#27272a'}
                />

                <div style={{
                  textAlign: 'right',
                  color: '#71717a',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {formData.password.length}/255
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#27272a',
                  color: 'white',
                  borderRadius: '9999px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = '#3f3f46';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = '#27272a';
                }}
              >
                {loading ? 'Creating account...' : 'Next'}
              </button>
            </motion.form>
            
            {/* Footer */}
            <div style={{
              textAlign: 'center',
              marginTop: '2rem'
            }}>
              <p style={{
                color: '#9ca3af',
                fontSize: '0.875rem',
                margin: 0
              }}>
                Already have an account?{' '}
                <Link to="/login" 
                  style={{
                  color: '#60a5fa',
                  textDecoration: 'underline'
                }}>
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;