import React from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Footer: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } },
  };

  const linkBaseStyle: React.CSSProperties = {
    fontFamily: "Poppins, sans-serif",
    color: "#f97316",
  };

  const onEnter = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.color = "#f59e0b";
  };

  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.color = "#f97316";
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
                <span className="text-xl gradient-text-secondary font-medium">
                  AI R&amp;D Collective
                </span>
              </div>
            </div>

            <p className="text-gray-300 mb-6 leading-relaxed max-w-md">
              An independent AI research collective exploring productivity intelligence through behavioral signals—turning complex activity patterns into actionable insight.
            </p>

            <div className="d-flex gap-3 flex-wrap">
              <Link
                to="/contact"
                className="font-black no-underline transition-colors duration-300"
                style={linkBaseStyle}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                Contact
              </Link>

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="font-black no-underline transition-colors duration-300"
                    style={linkBaseStyle}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="font-black no-underline transition-colors duration-300"
                    style={linkBaseStyle}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants} className="col">
            <h3 className="text-xl font-black mb-6 gradient-text" style={{ fontFamily: "Poppins, sans-serif" }}>
              Quick Links
            </h3>

            <ul className="space-y-3">
              {[
                { to: "/", label: "Home", show: true },
                { to: "/about", label: "About", show: true },
                { to: "/contact", label: "Contact", show: true },
                { to: "/dashboard", label: "Dashboard", show: isAuthenticated },
                { to: "/analytics", label: "Analytics", show: isAuthenticated },
                { to: "/agent", label: "AI Assistant", show: isAuthenticated },
              ]
                .filter((l) => l.show)
                .map((link, index) => (
                  <motion.li
                    key={link.to}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.to}
                      className="font-black no-underline transition-colors duration-300 group"
                      style={linkBaseStyle}
                      onMouseEnter={onEnter}
                      onMouseLeave={onLeave}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={itemVariants} className="col">
            <h3 className="text-xl font-black mb-6 gradient-text-secondary" style={{ fontFamily: "Poppins, sans-serif" }}>
              Support
            </h3>

            <ul className="space-y-3">
              {[
                { label: "Contact Us", to: "/contact" },
                { label: "Privacy Policy", to: "/privacy" },
                { label: "Terms of Service", to: "/terms" },
              ].map((item, index) => (
                <motion.li
                  key={item.label}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.to}
                    className="font-black no-underline transition-colors duration-300 group"
                    style={linkBaseStyle}
                    onMouseEnter={onEnter}
                    onMouseLeave={onLeave}
                  >
                    {item.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Newsletter */}
        <motion.div variants={itemVariants} className="mt-5 p-4 glass rounded-4 border border-white/10">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 gradient-text-accent">
              Research &amp; Platform Updates
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Occasional updates on research progress, collaboration opportunities, and major platform milestones.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-3 container-narrow">
              <input type="email" placeholder="Enter your email" className="input-modern flex-1" />
              <motion.button
                className="btn-modern btn-primary px-6 py-3 glow"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
              >
                Subscribe
              </motion.button>
            </div>

            <div className="mt-3 small" style={{ color: "#94a3b8" }}>
              Low volume • No spam • Unsubscribe anytime
            </div>
          </div>
        </motion.div>

        {/* Bottom */}
        <motion.div variants={itemVariants} className="border-top border-white/10 mt-4 pt-4">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
            <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
              <p className="text-gray-400 small mb-0">
                © {new Date().getFullYear()} Deepiri. All rights reserved.
              </p>

              <div className="d-flex align-items-center gap-2 small text-gray-400">
                <span>Built with</span>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  ❤️
                </motion.span>
                <span>for researchers &amp; builders</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 small text-gray-400">
              <span>Research-first</span>
              <span>Privacy-conscious</span>
              <span>Built to evolve</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
