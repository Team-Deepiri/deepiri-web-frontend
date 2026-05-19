
import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import logo from '../assets/images/logo_squared.png';

const Register = () => {
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
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

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
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

          @keyframes logo-brand-glow {
            0%, 100% {
              opacity: 0.75;
              transform: translate(-14%, 16%) scale(1);
            }
            50% {
              opacity: 1;
              transform: translate(14%, -16%) scale(1.05);
            }
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

          @media (prefers-reduced-motion: reduce) {
            .deepiri-image-side,
            .register-logo-glow {
              animation: none !important;
            }
          }
        `}</style>

      <div style={{
        minHeight: 'calc(100vh - var(--deepiri-nav-h))',
        display: 'flex',
        flexDirection: 'row',
        position: 'relative',
        overflow: 'hidden',
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
            background: 'linear-gradient(135deg, #ffffff 0%, #f2f2f7 25%, #e9e9f0 50%, #f2f2f7 75%, #ffffff 100%)',
            backgroundSize: '400% 400%',
            flexDirection: 'column',
            animation: 'gradient-shift 5.5s ease infinite'
          }}
        >
          <div
            className="register-logo-glow"
            aria-hidden
            style={{
              position: 'absolute',
              inset: '-60%',
              zIndex: 0,
              pointerEvents: 'none',
              background: `
                radial-gradient(ellipse 58% 52% at 28% 68%, rgba(59, 130, 246, 0.34) 0%, transparent 66%),
                radial-gradient(ellipse 52% 48% at 38% 62%, rgba(14, 165, 233, 0.28) 0%, transparent 64%),
                radial-gradient(ellipse 55% 50% at 35% 65%, rgba(99, 102, 241, 0.36) 0%, transparent 68%),
                radial-gradient(ellipse 42% 38% at 48% 52%, rgba(139, 92, 246, 0.3) 20%, transparent 62%),
                radial-gradient(ellipse 50% 44% at 50% 46%, rgba(236, 72, 153, 0.36) 20%, transparent 60%),
                radial-gradient(ellipse 46% 40% at 56% 40%, rgba(244, 114, 182, 0.32) 20%, transparent 62%),
                radial-gradient(ellipse 44% 38% at 62% 36%, rgba(251, 113, 133, 0.28) 20%, transparent 60%),
                radial-gradient(ellipse 50% 45% at 65% 35%, rgba(249, 115, 22, 0.34) 0%, transparent 65%),
                radial-gradient(ellipse 40% 36% at 68% 32%, rgba(251, 191, 36, 0.24) 0%, transparent 60%),
                radial-gradient(ellipse 38% 34% at 72% 28%, rgba(250, 204, 21, 0.26) 0%, transparent 62%),
                radial-gradient(ellipse 36% 32% at 76% 24%, rgba(253, 224, 71, 0.22) 0%, transparent 58%)
              `,
              animation: 'logo-brand-glow 5.5s ease-in-out infinite',
              willChange: 'opacity, transform',
            }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              zIndex: 10,
              position: 'relative',
              padding: '0 2rem',
              gap: '16px',
            }}
          >
            <img
              src={logo}
              alt="Deepiri logo"
              draggable={false}
              style={{
                display: 'block',
                width: 'auto',
                maxWidth: 'min(360px, 75%)',
                height: 'auto',
              }}
            />
            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradient-shift 20s ease infinite',
              letterSpacing: '2px',
              margin: 0
            }}>
              Deepiri
            </h1>

            <p style={{
              margin: 0,
              fontSize: '16px',
              color: '#8b5cf6',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              opacity: 0.7,
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
                color: '#000000',
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
                  color: 'black',
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
                    background: '#ffffff',
                    border: emailError ? '1px solid #ef4444' : '1px solid #d0d0d6',
                    borderRadius: '0.5rem',
                    color: 'black',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => {
                    if (!emailError) e.target.style.borderColor = '#733bf6';
                  }}
                  onBlur={(e) => {
                    if (!emailError) e.target.style.borderColor = '#d0d0d6';
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
                  color: 'black',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  marginBottom: '0.5rem'
                }}>
                  Username <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Superman23465"
                  maxLength={255}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    background: '#ffffff',
                    border: '1px solid #d0d0d6',
                    borderRadius: '0.5rem',
                    color: 'black',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                    onFocus={(e) => e.target.style.borderColor = '#733bf6'}
                    onBlur={(e) => e.target.style.borderColor = '#d0d0d6'}
                />
                <div style={{
                  textAlign: 'right',
                  color: '#71717a',
                  fontSize: '0.75rem',
                  marginTop: '0.25rem'
                }}>
                  {formData.name.length}/255
                </div>
              </div>

              <div>
                <label style={{
                  display: 'block',
                  color: 'black',
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
                    background: '#ffffff',
                    border: '1px solid #d0d0d6',
                    borderRadius: '0.5rem',
                    color: 'black',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                    onFocus={(e) => e.target.style.borderColor = '#733bf6'}
                    onBlur={(e) => e.target.style.borderColor = '#d0d0d6'}
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
                  background: '#0ea5e9',
                  color: 'white',
                  borderRadius: '9999px',
                  fontWeight: '500',
                  border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.2s',
                  opacity: loading ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = '#0ea5e9';
                }}
                onMouseLeave={(e) => {
                  if (!loading) (e.target as HTMLButtonElement).style.background = '#38bdf8';
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
                color: '#000000',
                fontSize: '0.875rem',
                margin: 0
              }}>
                Already have an account?{' '}
                <Link to="/login" 
                  style={{
                  color: '#733bf6',
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