import React, { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(formData.email, formData.password);
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
            initial={{ opacity: 1 }}
          >
            Welcome Back!
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-300"
            initial={{ opacity: 1, y: -20 }}
          >
            Sign in to continue your adventure
          </motion.p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-modern p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              {/* Linked label and input for testing/accessibility */}
              <label htmlFor="login-email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="input-modern"
                required
              />
            </div>

            <div className="pt-3">
              <label htmlFor="login-password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="input-modern"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-3 pb-4">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-purple-500 bg-white/10 border-white/20 rounded focus:ring-purple-500"
                  style={{color: "#C8C8C866"}}
                />
                <label htmlFor="remember-me" className="ml-4 block text-sm text-gray-300" style={{paddingLeft: '0.5rem'}}>
                  Remember me
                </label>
              <a href="#" className="text-sm hover:text-purple-300" style={{paddingLeft: '3rem', color: "#6366f1"}}>
                Forgot password?
              </a>
            </div>

            <div className="row">
              <div className="col-md-auto">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-modern btn-primary w-full"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
              <div className="col-md-auto">
                <button type="button" className="btn-modern btn-login flex items-center justify-center ">
                  Sign in with Google
                </button>
              </div>
              <div className="col-md-auto">
                <button type="button" className="btn-modern btn-login flex items-center justify-center">
                  Sign in with Facebook
                </button>
              </div>
            </div>
            {/*<button
              type="submit"
              disabled={loading}
              className="btn-modern btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>*/}
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center text-black pt-5"
        >
          <p className="text-gray-300">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="hover:text-purple-300 font-medium"
              style={{color: "#6366f1"}}
            >
              Sign up here
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;