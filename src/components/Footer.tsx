import React from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/images/logo_squared.png";
import { Bold } from "lucide-react";

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
    color: "#6366f1",
    textDecoration: "none"
  };

  const onEnter = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.color = "#5153be";
  };

  const onLeave = (e: React.MouseEvent<HTMLElement>) => {
    (e.currentTarget as HTMLElement).style.color = "#6366f1";
  };

  return (
    <motion.footer
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="relative backdrop-blur-xl border-top border-white/10"
    >
      <div className="container px-4 py-2">
        <div className="row g-4 text-center align-items-center">
          <div className="col" style={{maxWidth: '150px'}}>
            <img src={logo} alt="Deepiri logo" className="deepiri-heroLogoFooter" draggable={false}/>
          </div>
          {!isAuthenticated && (
            <>
              <div className="col" style={{maxWidth: '150px'}}>
                <Link
                  to="/login"
                  className="font-black no-underline transition-colors duration-300"
                  style={linkBaseStyle}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  Sign In
                </Link>
              </div>
              <div className="col" style={{maxWidth: '150px'}}>
                <Link
                  to="/register"
                  className="font-black no-underline transition-colors duration-300"
                  style={linkBaseStyle}
                  onMouseEnter={onEnter}
                  onMouseLeave={onLeave}
                >
                  Create Account
                </Link>
              </div>
            </>
          )}
          {[
            { label: "Contact Us", to: "/contact" },
            { label: "Privacy Policy", to: "/privacy" },
            { label: "Terms of Service", to: "/terms" },
          ].map((item, index) => (
            <div className="col" style={{maxWidth: '150px'}}>
              <Link
                to={item.to}
                className="font-black no-underline transition-colors duration-300"
                style={linkBaseStyle}
                onMouseEnter={onEnter}
                onMouseLeave={onLeave}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div variants={itemVariants} className="mt-3 p-4 card-modern bg-white">
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
        <motion.div variants={itemVariants} className="border-top border-white/10 mt-4 pt-4 pb-4" style={{ color: "#33373b"}}>
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-md-between">
            <div className="d-flex align-items-center gap-3 mb-3 mb-md-0">
              <p className="small mb-0">
                © {new Date().getFullYear()} Deepiri. All rights reserved.
              </p>

              <div className="d-flex align-items-center gap-2 small">
                <span>Built with</span>
                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                  ❤️
                </motion.span>
                <span>for researchers &amp; builders</span>
              </div>
            </div>

            <div className="d-flex align-items-center gap-3 small">
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
