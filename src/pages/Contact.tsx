import React, { useState } from "react";
import { motion } from 'framer-motion';
import logo from '../assets/images/logo_squared.png';
import "./Contact.css";

const Contact: React.FC = () => {
  const [loading] = useState(false);
  // const [emailError, setEmailError] = useState('');
  
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
          .deepiri-image-side-login {
            display: flex !important;
          }
          .deepiri-form-side-login {
            width: 50% !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .deepiri-image-side-login,
          .register-logo-glow {
            animation: none !important;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: "calc(100vh - var(--deepiri-nav-h))",
          display: "flex",
          overflow: "hidden",
        }}
      >
        <div
          className="deepiri-form-side-login"
          style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 1.5rem',
          /* background: 'rgba(9, 9, 11, 0.8)', */
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 2
          }}
        >
          <div style={{ width: '100%', maxWidth: '28rem' }}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{
                marginBottom: '2rem',
                textAlign: 'center'
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
                Contact Us!
              </h1>
              <p style={{
                color: 'black',
                fontSize: '1rem',
                lineHeight: '1.5',
                margin: 0,
                marginTop: '1rem'
              }}>
                Have a question, feedback, or issue? Send us a message and we’ll get back to you.
              </p>
            </motion.div>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label style={{ color: 'black', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Joe Smith"
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
              </div>
              <div>
                <label style={{ color: 'black', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="ash@deepiri.app"
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
              </div>
              <div>
                <label style={{ color: 'black', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Topic <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: '#ffffff',
                    border: '1px solid #d0d0d6',
                    borderRadius: '0.5rem',
                    color: 'black'
                  }} 
                  onFocus={(e) => e.target.style.borderColor = '#733bf6'}
                  onBlur={(e) => e.target.style.borderColor = '#d0d0d6'}
                  required>
                  <option disabled selected>Select...</option>
                  <option value="support">Question</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ color: 'black', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.5rem' }}>
                  Message for Support <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea 
                rows={5}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#ffffff',
                  border: '1px solid #d0d0d6',
                  borderRadius: '0.5rem',
                  color: 'black',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#733bf6'}
                onBlur={(e) => e.target.style.borderColor = '#d0d0d6'}
                placeholder="Write your message here..." 
                required />
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
                Send Message
              </button>
            </motion.form>
          </div>
        </div>
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
              'linear-gradient(135deg, #ffffff 0%, #f2f2f7 25%, #e9e9f0 50%, #f2f2f7 75%, #ffffff 100%)',
            backgroundSize: '400% 400%',
            overflow: 'hidden',
            flexDirection: 'column',
            animation: 'gradient-shift 20s ease infinite',
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
            <h1
              style={{
                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                animation: 'gradient-shift 3s ease infinite',
                letterSpacing: '2px',
                margin: 0,
              }}
            >
              Deepiri
            </h1>
            <p
              style={{
                margin: 0,
                fontSize: '16px',
                color: '#8b5cf6',
                letterSpacing: '2px',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              AI R&D Collective
            </p>
          </div>
        </div>
      </div>
    </>
    /*<div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4" style={{ paddingBottom: '4rem'}}>
      <div className="w-full max-w-md space-y-8 pb-4">
        <motion.div
          initial={{ opacity: 0, y: 0}}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-black"
        >
          <motion.h1
            className="deepiri-heroTitle gradient-text-accent text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-emerald-400 bg-clip-text text-transparent"
            initial={{ opacity: 1 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="text-xl text-gray-300"
            initial={{ opacity: 1, y: -20 }}
          >
            Have a question, feedback, or issue? Send us a message and we’ll get back to you.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-modern p-8"
        >
          <form onSubmit={(e) => {
            e.preventDefault();
            alert("Your message has been sent!");
          }}
          >
            <div>
              <label className="block text-sm font-medium mb-2">
                Your Name
              </label>
              <input 
                type="text"
                name="name"
                className="input-modern"
                required
              />
            </div>
            <div className="pt-3">
              <label className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input 
                type="email"
                name="name"
                className="input-modern"
                required
              />
            </div>
            <div className="pt-3">
              <label className="block text-sm font-medium mb-2">
                Topic
              </label>
              <select className="input-modern" required>
                <option disabled selected>Select...</option>
                <option value="support">Question</option>
                <option value="feedback">Feedback</option>
                <option value="bug">Issue</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="pt-3">
              <label className="block text-sm font-medium mb-2">
                Message for Support
              </label>
              <textarea rows={5} className="input-modern" placeholder="Write your message here..." required />
            </div>
            <div className="pt-3">
              <button type="submit" className="btn-modern btn-primary w-full">
                Send Message
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>*/
  );
};

export default Contact;
