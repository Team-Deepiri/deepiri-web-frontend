import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, Variants } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent): void => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 animated-bg opacity-90" />
      
      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: 'linear-gradient(135deg, #6366f1, #7c3aed)',
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Mouse Follower */}
      <motion.div
        className="fixed w-6 h-6 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full pointer-events-none z-10 mix-blend-difference opacity-60"
        animate={{
          x: mousePosition.x - 12,
          y: mousePosition.y - 12,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28
        }}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20"
      >
        {/* Hero Section */}
        <section className="relative min-vh-100 d-flex align-items-center justify-content-center px-3">
          <div className="container text-center">
            <motion.div variants={itemVariants} className="mb-8">
              <motion.h1 
                className="display-title mb-3" style={{ fontSize: 'clamp(42px, 6vw, 88px)' }}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <span className="gradient-text">Deepiri</span>
                <br />
                <span className="gradient-text-secondary">Productivity Playground</span>
              </motion.h1>
              
              <motion.p 
                className="subtitle mb-4 mx-auto" style={{ maxWidth: 900, fontSize: 'clamp(16px, 2.2vw, 24px)', color: '#cbd5e1' }}
                variants={itemVariants}
              >
                Your AI-powered digital productivity playground. Gamify your tasks, 
                earn rewards, and boost your productivity with adaptive challenges.
              </motion.p>
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center mb-4"
            >
              {isAuthenticated ? (
                <>
                  <Link
                    to="/adventure/generate"
                    className="btn-modern btn-primary text-lg px-8 py-4 glow"
                  >
                    <span className="text-2xl mr-2">✨</span>
                    Generate Adventure
                  </Link>
                  <Link
                    to="/dashboard"
                    className="btn-modern btn-glass text-lg px-8 py-4"
                  >
                    <span className="text-2xl mr-2">🚀</span>
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-modern btn-primary text-lg px-8 py-4 glow"
                  >
                    Start Your Journey
                  </Link>
                  <Link
                    to="/login"
                    className="btn-modern btn-glass text-lg px-8 py-4"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </motion.div>

            {/* Floating Feature Cards */}
            <motion.div 
              variants={itemVariants}
              className="row row-cols-1 row-cols-md-3 g-4 container-narrow mx-auto"
            >
              {[
                {
                  iconType: 'robot',
                  title: 'AI-Powered',
                  description: 'Adaptive challenges generated by advanced AI',
                  gradient: 'from-indigo-600 to-violet-600'
                },
                {
                  iconType: 'controller',
                  title: 'Gamified Tasks',
                  description: 'Turn boring tasks into engaging mini-games and challenges',
                  gradient: 'from-indigo-500 to-purple-600'
                },
                {
                  iconType: 'people',
                  title: 'Social Productivity',
                  description: 'Compete with friends and share achievements',
                  gradient: 'from-violet-600 to-indigo-600'
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="card-modern text-center group col lift"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div 
                    className="mb-4 flex items-center justify-center"
                    style={{ 
                      height: '80px'
                    }}
                  >
                    {feature.iconType === 'robot' ? (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="80" 
                        height="80" 
                        fill="currentColor" 
                        className="bi bi-robot" 
                        viewBox="0 0 16 16"
                        style={{ color: '#a78bfa' }}
                      >
                        <path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.135"/>
                        <path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/>
                      </svg>
                    ) : feature.iconType === 'controller' ? (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="80" 
                        height="80" 
                        fill="currentColor" 
                        className="bi bi-controller" 
                        viewBox="0 0 16 16"
                        style={{ color: '#a78bfa' }}
                      >
                        <path d="M11.5 6.027a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m2.5-.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0m-1.5 1.5a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1m-6.5-3h1v1h1v1h-1v1h-1v-1h-1v-1h1z"/>
                        <path d="M3.051 3.26a.5.5 0 0 1 .354-.613l1.932-.518a.5.5 0 0 1 .62.39c.655-.079 1.35-.117 2.043-.117.72 0 1.443.041 2.12.126a.5.5 0 0 1 .622-.399l1.932.518a.5.5 0 0 1 .306.729q.211.136.373.297c.408.408.78 1.05 1.095 1.772.32.733.599 1.591.805 2.466s.34 1.78.364 2.606c.024.816-.059 1.602-.328 2.21a1.42 1.42 0 0 1-1.445.83c-.636-.067-1.115-.394-1.513-.773-.245-.232-.496-.526-.739-.808-.126-.148-.25-.292-.368-.423-.728-.804-1.597-1.527-3.224-1.527s-2.496.723-3.224 1.527c-.119.131-.242.275-.368.423-.243.282-.494.575-.739.808-.398.38-.877.706-1.513.773a1.42 1.42 0 0 1-1.445-.83c-.27-.608-.352-1.395-.329-2.21.024-.826.16-1.73.365-2.606.206-.875.486-1.733.805-2.466.315-.722.687-1.364 1.094-1.772a2.3 2.3 0 0 1 .433-.335l-.028-.079zm2.036.412c-.877.185-1.469.443-1.733.708-.276.276-.587.783-.885 1.465a14 14 0 0 0-.748 2.295 12.4 12.4 0 0 0-.339 2.406c-.022.755.062 1.368.243 1.776a.42.42 0 0 0 .426.24c.327-.034.61-.199.929-.502.212-.202.4-.423.615-.674.133-.156.276-.323.44-.504C4.861 9.969 5.978 9.027 8 9.027s3.139.942 3.965 1.855c.164.181.307.348.44.504.214.251.403.472.615.674.318.303.601.468.929.503a.42.42 0 0 0 .426-.241c.18-.408.265-1.02.243-1.776a12.4 12.4 0 0 0-.339-2.406 14 14 0 0 0-.748-2.295c-.298-.682-.61-1.19-.885-1.465-.264-.265-.856-.523-1.733-.708-.85-.179-1.877-.27-2.913-.27s-2.063.091-2.913.27"/>
                      </svg>
                    ) : feature.iconType === 'people' ? (
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="80" 
                        height="80" 
                        fill="currentColor" 
                        className="bi bi-people" 
                        viewBox="0 0 16 16"
                        style={{ color: '#a78bfa' }}
                      >
                        <path d="M15 14s1 0 1-1-1-4-5-4-5 3-5 4 1 1 1 1zm-7.978-1L7 12.996c.001-.264.167-1.03.76-1.72C8.312 10.629 9.282 10 11 10c1.717 0 2.687.63 3.24 1.276.593.69.758 1.457.76 1.72l-.008.002-.014.002zM11 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0M6.936 9.28a6 6 0 0 0-1.23-.247A7 7 0 0 0 5 9c-4 0-5 3-5 4q0 1 1 1h4.216A2.24 2.24 0 0 1 5 13c0-1.01.377-2.042 1.09-2.904.243-.294.526-.569.846-.816M4.92 10A5.5 5.5 0 0 0 4 13H1c0-.26.164-1.03.76-1.724.545-.636 1.492-1.256 3.16-1.275ZM1.5 5.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0m3-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4"/>
                      </svg>
                    ) : null}
                  </motion.div>
                  <h3 className="text-2xl font-black mb-4 gradient-text" style={{ fontFamily: 'Poppins, sans-serif' }}>{feature.title}</h3>
                  <p className="leading-relaxed font-medium" style={{ fontFamily: 'Poppins, sans-serif', color: '#94a3b8' }}>{feature.description}</p>
                  
                  {/* Hover Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-5 relative">
          <div className="container px-3">
            <motion.div
              variants={itemVariants}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl font-bold mb-8">
                <span className="gradient-text-accent">Why Choose</span>
                <br />
                <span className="gradient-text-secondary">Deepiri?</span>
              </h2>
              <p className="text-xl max-w-4xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
                Experience the future of productivity with gamification, AI-powered challenges, 
                real-time progress tracking, and a vibrant community of achievers.
              </p>
            </motion.div>

            <div className="row g-4 align-items-center">
              <motion.div variants={itemVariants} className="col-lg-6">
                {[
                  {
                    title: 'Task Gamification',
                    description: 'Convert your tasks into engaging mini-games, quizzes, and challenges that make productivity fun.'
                  },
                  {
                    title: 'Real-Time Progress',
                    description: 'Track your efficiency, streaks, and achievements in real-time with instant feedback.'
                  },
                  {
                    title: 'Adaptive AI Challenges',
                    description: 'AI analyzes your behavior and generates personalized challenges optimized for your workflow.'
                  },
                  {
                    title: 'Rewards & Progression',
                    description: 'Earn points, badges, climb leaderboards, and unlock achievements as you complete tasks.'
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className="group mb-3"
                    whileHover={{ x: 10 }}
                  >
                    <div>
                      <h3 className="text-xl font-bold mb-2 gradient-text">{feature.title}</h3>
                      <p className="leading-relaxed" style={{ color: '#94a3b8' }}>{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div 
                variants={itemVariants}
                className="col-lg-6"
              >
                <div className="card-modern p-8 float">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold mb-4 gradient-text">Interactive Map</h3>
                    <p className="mb-6" style={{ color: '#94a3b8' }}>
                      Explore your adventure route with our interactive 3D map interface
                    </p>
                    <div className="row g-3">
                      <div className="col-6">
                        <div className="card-modern p-4 text-center">
                        <div className="text-sm font-semibold">Locations</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card-modern p-4 text-center">
                        <div className="text-sm font-semibold">Timeline</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card-modern p-4 text-center">
                        <div className="text-sm font-semibold">Weather</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="card-modern p-4 text-center">
                        <div className="text-sm font-semibold">Friends</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-5 relative">
          <div className="container text-center px-3">
            <motion.div variants={itemVariants}>
              <h2 className="text-5xl md:text-6xl font-bold mb-8">
                <span className="gradient-text">Ready to</span>
                <br />
                <span className="gradient-text-secondary">Explore?</span>
              </h2>
              <p className="text-xl mb-12 max-w-4xl mx-auto leading-relaxed" style={{ color: '#94a3b8' }}>
                Join thousands of users who are already boosting their productivity 
                with AI-powered gamification and achieving their goals faster.
              </p>
              
              {!isAuthenticated && (
                <motion.div
                  variants={itemVariants}
                  className="d-flex flex-column flex-sm-row gap-3 justify-content-center align-items-center"
                >
                  <Link
                    to="/register"
                    className="btn-modern btn-primary text-xl px-12 py-6 glow-secondary pulse"
                  >
                    Start Your Productivity Journey
                  </Link>
                  <div className="text-sm" style={{ color: '#64748b' }}>
                    Free to join • Instant setup • Boost productivity
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </motion.div>
    </div>
  );
};

export default Home;

