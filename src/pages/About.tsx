import React from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import logo from "../assets/images/logo_squared.png";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { y: 12, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const About: React.FC = () => {
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
          minHeight: "100vh",
          display: "flex",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(rgba(183, 0, 255, 0.15) 1px, transparent 1px),
              linear-gradient(90deg, rgba(183, 0, 255,0.15) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-pulse 4s ease-in-out infinite',
            zIndex: 5,
            pointerEvents: 'none',
          }}
        />

        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            variants={itemVariants}
            style={{ paddingTop: '2rem' }} 
            className="deepiri-heroLogoWrap"
          >
            <img src={logo} alt="Deepiri logo" className="deepiri-heroLogo" draggable={false} style={{ width: '35%', height: '35%', zIndex: 0 }} />
          </motion.div>
          <motion.h1
            initial={{ y: -30 }}
            style={{
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
            About Deepiri
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-center deepiri-heroSubtitle text-black"
            initial={{y: -20}}
            style={{
              color: "white",
              maxWidth: 900,
              lineHeight: 1.55
            }}
          >
            Deepiri is an independent AI R&amp;D collective focused on understanding
            how work actually happens. We build research-driven systems that model
            engagement, consistency, and adaptation—using behavioral signals instead
            of task checklists.
          </motion.p>
          <motion.p
            variants={itemVariants}
            className="text-center deepiri-heroSubtitle text-black"
            initial={{y: -20}}
            style={{
              color: "white",
              maxWidth: 900,
              lineHeight: 1.55
            }}
          >
            We're building an intelligence layer for productivity: collecting signals, interpreting patterns, 
            and producing decision-ready insight designed for further iteration and long-term evolution.
          </motion.p>
          <motion.div className='row'>
            {["Researchers", "Builders", "Operators", "Platform Teams", "Labs"].map(
              (label) => (
                <div 
                  key={label}
                  className="deepiri-heroSubtitle col rounded m-2"
                  style={{
                    paddingTop: "0.5rem", 
                    paddingBottom: "0.5rem", 
                    maxWidth: 400, 
                    lineHeight: 2, 
                    color: "white", 
                    background: 'linear-gradient(to bottom, #6366f1, #8b5cf6, rgb(255,255,255,0))'
                  }}
                >
                  {label}
                </div>
              )
            )}
          </motion.div>
          <motion.div className='grid !grid-cols-2 gap-4' style={{paddingTop: '2rem', display: "grid", gridTemplateColumns: "repeat(2, 1fr)"}}>
            {[
              {
                title: "Behavioral intelligence",
                body: "Capture engagement, consistency, and change over time.",
              },
              {
                title: "Signal pipelines",
                body: "Turn raw activity into interpretable, decision-ready insight.",
              },
              {
                title: "Research layer",
                body: "Designed for iteration, evaluation, and model evolution.",
              },
              {
                title: "Privacy-conscious by design",
                body: "Minimize exposure, keep principles explicit, and log responsibly.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center rounded" style={{paddingBottom: "2rem", background: "linear-gradient(to bottom, #e2e2e2, #e9e9e9, rgb(255,255,255,0))"}}>
                <div>
                  <p style={{color: "orange", paddingTop: "1rem"}} className="deepiri-heroSubtitle">{item.title}</p>
                </div>
                <div className='text-black'>
                  <p>{item.body}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default About;
