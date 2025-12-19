import logo from "../assets/images/logo.png";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 18, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 animated-bg opacity-90" />

      {/* Floating particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: "linear-gradient(135deg, #7c3aed, #f97316)",
            }}
            animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Mouse glow */}
      <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-purple-500 to-orange-500 rounded-full pointer-events-none z-10 mix-blend-difference opacity-60"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      />

      {/* Main */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20"
      >
        {/* HERO */}
        <section className="relative min-h-screen flex justify-center px-3">
          <div className="max-w-5xl w-full mx-auto text-center">
            {/* Spacer to push logo down from navbar */}
            <div style={{ height: 200 }} />

            {/* LOGO */}
            <motion.div variants={itemVariants} className="flex justify-center mb-12">
              <img
                src={logo}
                alt="Deepiri Logo"
                className="w-56 sm:w-64 md:w-72 lg:w-80 h-auto drop-shadow-2xl mx-auto"
              />
            </motion.div>

            {/* TITLE */}
            <motion.div variants={itemVariants} className="mb-10">
              <motion.h1
                className="display-title mb-4"
                style={{ fontSize: "clamp(42px, 6vw, 88px)" }}
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
              >
                <span className="gradient-text">Deepiri</span>
                <br />
                <span className="gradient-text-secondary">AI Productivity Hub</span>
              </motion.h1>

              <motion.p
                className="subtitle mx-auto"
                style={{
                  maxWidth: 900,
                  fontSize: "clamp(16px, 2.2vw, 24px)",
                  color: "#cbd5e1",
                }}
              >
                Stay organized, track progress, and turn goals into wins with AI-powered
                challenges and rewards.
              </motion.p>
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="btn-modern btn-primary text-lg px-10 py-4 glow"
                >
                  🚀 Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="btn-modern btn-primary text-lg px-10 py-4 glow"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-modern btn-glass text-lg px-10 py-4"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </motion.div>

            {/* BIG breathing room before features (inside hero) */}
            <div className="h-24 md:h-32 lg:h-40" />
          </div>
        </section>

        {/* FEATURES (separate section so spacing works reliably) */}
        <section className="relative px-3 pb-24">
          <div className="max-w-5xl w-full mx-auto">
            <motion.div
              variants={itemVariants}
              className="row row-cols-1 row-cols-md-2 g-5 container-narrow mx-auto"
            >
              {[
                { title: "AI-Powered", desc: "Adaptive challenges generated by advanced AI" },
                { title: "Gamified Tasks", desc: "Turn tasks into engaging challenges and quick wins" },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="card-modern text-center col lift p-6"
                  whileHover={{ scale: 1.03 }}
                >
                  <h3 className="text-2xl font-black mb-3 gradient-text">{f.title}</h3>
                  <p className="text-slate-400">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* WHY SECTION (keeps page longer + separates from footer) */}
        <section className="py-24 relative px-3">
          <div className="container px-3 max-w-5xl mx-auto">
            <motion.div variants={itemVariants} className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="gradient-text-accent">Why Choose</span>
                <br />
                <span className="gradient-text-secondary">Deepiri?</span>
              </h2>
              <p
                className="text-xl leading-relaxed mx-auto"
                style={{ color: "#94a3b8", maxWidth: 900 }}
              >
                A focused productivity experience with gamification, progress tracking,
                and AI-powered challenges.
              </p>
            </motion.div>

            <div className="grid gap-6">
              {[
                {
                  title: "Task Gamification",
                  description:
                    "Convert your tasks into engaging challenges that make progress feel rewarding.",
                },
                {
                  title: "Real-Time Progress",
                  description: "Track your streaks, goals, and wins with clear feedback.",
                },
                {
                  title: "Adaptive AI Challenges",
                  description: "AI helps tailor challenges to your workflow and momentum.",
                },
                {
                  title: "Rewards & Progression",
                  description: "Earn points and unlock achievements as you complete tasks.",
                },
              ].map((feature, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="card-modern p-6 text-center"
                  whileHover={{ scale: 1.01 }}
                >
                  <h3 className="text-xl font-bold mb-2 gradient-text">{feature.title}</h3>
                  <p className="leading-relaxed" style={{ color: "#94a3b8" }}>
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Extra room before footer */}
            <div className="h-24" />
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Home;
