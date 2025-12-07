import React from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';

const Footer: React.FC = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  return (
    <motion.footer 
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative glass-dark backdrop-blur-xl border-top border-white/10"
    >
      <div className="container px-4 py-5">
        <div className="row g-4 row-cols-1 row-cols-md-4">
          {/* Brand */}
          <motion.div variants={itemVariants} className="col-md-6">
            <div className="mb-8">
              <div>
                <span className="text-4xl font-bold gradient-text">Deepiri</span>
                <br />
                <span className="text-xl gradient-text-secondary font-medium">Productivity Playground</span>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              Your AI-powered digital productivity playground. Gamify your tasks, 
              earn rewards, and boost your productivity with adaptive challenges.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="col">
            <h3 className="text-xl font-black mb-6 gradient-text" style={{ fontFamily: 'Poppins, sans-serif' }}>Quick Links</h3>
            <ul className="space-y-3">
              {[
                { to: '/adventure/generate', label: 'Generate Adventure' },
                { to: '/events', label: 'Browse Events' },
                { to: '/friends', label: 'Find Friends' },
                { to: '/leaderboard', label: 'Leaderboard' },
                { to: '/agent', label: 'AI Assistant' }
              ].map((link, index) => (
                <motion.li
                  key={link.to}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link 
                    to={link.to} 
                    className="font-black no-underline transition-colors duration-300 group"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      color: '#4f46e5'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#4f46e5'}
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants} className="col">
            <h3 className="text-xl font-black mb-6 gradient-text-secondary" style={{ fontFamily: 'Poppins, sans-serif' }}>Support</h3>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', href: '#' },
                { label: 'Contact Us', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Terms of Service', href: '#' },
                { label: 'Bug Reports', href: '#' }
              ].map((item, index) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <a 
                    href={item.href} 
                    className="font-black no-underline transition-colors duration-300 group"
                    style={{ 
                      fontFamily: 'Poppins, sans-serif',
                      color: '#4f46e5'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#6366f1'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#4f46e5'}
                  >
                    {item.label}
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Signup */}
        <motion.div 
          variants={itemVariants}
          className="mt-5 p-4 glass rounded-4 border border-white/10"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 gradient-text-accent">
              Stay Updated with New Adventures
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Get the latest adventure recommendations, exclusive events, and community updates delivered to your inbox.
            </p>
            <div className="d-flex flex-column flex-sm-row gap-3 container-narrow">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-modern flex-1"
              />
              <motion.button
                className="btn-modern btn-primary px-6 py-3 glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div 
          variants={itemVariants}
          className="border-top border-white/10 mt-4 pt-4"
        >
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
            <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
              <p className="text-gray-400 small mb-0">
                © 2024 Deepiri. All rights reserved.
              </p>
              <div className="d-flex align-items-center gap-2 small text-gray-400">
                <span>Made with</span>
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  ❤️
                </motion.span>
                <span>for adventure seekers</span>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-3 small text-gray-400">
              <span>Available worldwide</span>
              <span>Secure & Private</span>
              <span>Lightning Fast</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;

