import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center text-black"
        >
          <motion.h1 
            className="deepiri-heroTitle gradient-text-accent text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-500 to-emerald-400 bg-clip-text text-transparent"
            initial={{ opacity: 1, paddingBottom: '1rem' }}
          >
            Sign Up
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300"
            initial={{ opacity: 1, y: -30 }}
          >
            Create your account and start your day!
          </motion.p>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-modern p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="input-modern"
                required
              />
            </div>

            <div className="pt-3">
              <label className="block text-sm font-medium text-black mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-modern"
                required
              />
            </div>

            <div className="pt-3">
              <label className="block text-sm font-medium text-black mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-modern"
                required
              />
            </div>

            <div className="pt-3">
              <label className="block text-sm font-medium text-black mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="input-modern"
                required
              />
            </div>

            <div className="flex items-start pt-3 pb-4">
              <input
                type="checkbox"
                className="h-4 w-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                style={{color: "#C8C8C866"}}
                required
              />
              <label className="ml-4 block text-sm text-gray-300" style={{paddingLeft: '0.5rem'}}>
                I agree to the{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300" style={{color: "#6366f1"}}>
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-purple-400 hover:text-purple-300" style={{color: "#6366f1"}}>
                  Privacy Policy
                </a>
              </label>
            </div>
            <div className="row">
              <div className="col-md-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-modern btn-primary w-full"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
              <div className="col-md-auto">
                <button type="button" className="btn-modern btn-login flex items-center justify-center text-black">
                  <span>Sign in with Google</span>
                </button>
              </div>
              <div className="col-md-auto">
                <button type="button" className="btn-modern btn-login flex items-center justify-center text-black">
                  <span>Sign in with Facebook</span>
                </button>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-black pt-5"
        >
          <p className="text-gray-300">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-purple-400 hover:text-purple-300 font-medium"
              style={{color: "#6366f1"}}
            >
              Sign in here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

