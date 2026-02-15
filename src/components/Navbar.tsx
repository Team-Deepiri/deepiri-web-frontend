import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import logoIcon from "../assets/images/logo.png";
import logoSquare from "../assets/images/logo_squared.png";

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = (): void => {
    logout();
    navigate("/");
  };

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navVariants: Variants = {
    hidden: { y: -100, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const menuVariants: Variants = {
    hidden: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    visible: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  return (
    <motion.nav
      variants={navVariants}
      initial="hidden"
      animate="visible"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass-dark backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <div className="container px-4">
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ height: "5rem" }}
        >
          {/* Left: Logo */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/" className="flex items-center group no-underline">
              <motion.div
                className="relative flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  height: "3.25rem",
                  width: "3.25rem",
                  backgroundColor: "transparent",
                }}
              >
                <img
                  src={logoSquare}
                  alt="Deepiri Logo"
                  className="h-full w-full object-contain filter drop-shadow-lg group-hover:drop-shadow-xl transition-all duration-300"
                  style={{
                    maxHeight: "3.25rem",
                    maxWidth: "3.25rem",
                    backgroundColor: "transparent",
                  }}
                />
              </motion.div>

              <span className="ms-2 font-bold text-white text-xl">Deepiri</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="d-none d-lg-flex align-items-center gap-4">
            {isAuthenticated ? (
              <>
                {[
                  { to: "/dashboard", label: "Dashboard", icon: "🏠" },
                  { to: "/tasks", label: "Tasks", icon: "📋" },
                  { to: "/challenges", label: "Challenges", icon: "🎮" },
                  { to: "/gamification", label: "Progress", icon: "⭐" },
                  { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
                  { to: "/analytics", label: "Analytics", icon: "📊" },
                ].map((item, index) => (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    <Link
                      to={item.to}
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 group no-underline"
                    >
                      <span className="text-lg group-hover:scale-110 transition-transform duration-300">
                        {item.icon}
                      </span>
                      <span className="font-semibold text-lg text-white group-hover:text-orange-300 transition-colors duration-300">
                        {item.label}
                      </span>
                    </Link>
                  </motion.div>
                ))}

                {/* User Menu + Brand next to dropdown (VISIBLE EVERYWHERE ON DESKTOP) */}
                <motion.div
                  className="position-relative d-flex align-items-center gap-3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 }}
                  onMouseEnter={() => setIsDropdownOpen(true)}
                  onMouseLeave={() => setIsDropdownOpen(false)}
                >
                  {/* Deepiri label + logo next to dropdown */}
                  <div className="d-flex align-items-center gap-2 px-3 py-2 rounded-lg">
                    <img
                      src={logoIcon}
                      alt="Deepiri"
                      style={{ width: 22, height: 22, objectFit: "contain" }}
                      className="drop-shadow"
                    />
                    <span className="text-white font-bold text-lg">Deepiri</span>
                  </div>

                  <button className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-white/10 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                      {user?.name?.charAt(0).toUpperCase() || "U"}
                    </div>

                    <div className="text-left">
                      <div className="font-bold text-lg text-gray-100 group-hover:text-orange-300 transition-colors duration-300">
                        {user?.name || "User"}
                      </div>
                      <div className="text-sm text-gray-300 font-medium">
                        Adventurer
                      </div>
                    </div>

                    <motion.span
                      className="text-gray-400 group-hover:text-white transition-colors duration-300"
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                    >
                      ▼
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        className="position-absolute end-0 top-full w-56 glass rounded-2xl border border-white/20 overflow-hidden z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                      >
                        <div className="py-2">
                          {[
                            { to: "/profile", label: "Profile", icon: "👤" },
                            { to: "/notifications", label: "Notifications", icon: "🔔" },
                            { to: "/agent", label: "AI Assistant", icon: "🤖" },
                          ].map((item) => (
                            <Link
                              key={item.to}
                              to={item.to}
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200 group no-underline"
                            >
                              <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                                {item.icon}
                              </span>
                              <span className="text-white group-hover:text-orange-300 transition-colors duration-300 font-semibold text-lg">
                                {item.label}
                              </span>
                            </Link>
                          ))}
                          <div className="border-t border-white/10 my-2" />
                          <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 w-full text-left hover:bg-red-500/20 transition-colors duration-200 group"
                          >
                            <span className="text-xl group-hover:scale-110 transition-transform duration-300">
                              🚪
                            </span>
                            <span className="text-red-400 group-hover:text-red-300 transition-colors duration-300 font-semibold text-lg">
                              Sign Out
                            </span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn-modern px-8 py-3 text-lg font-bold no-underline rounded-2xl"
                  style={{
                    background: "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                    color: "white",
                    boxShadow:
                      "0 10px 15px -3px rgba(249, 115, 22, 0.35), 0 4px 6px -4px rgba(249, 115, 22, 0.35)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 20px 25px -5px rgba(249, 115, 22, 0.45), 0 8px 10px -6px rgba(249, 115, 22, 0.45)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(249, 115, 22, 0.35), 0 4px 6px -4px rgba(249, 115, 22, 0.35)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="btn-modern btn-primary px-8 py-3 text-lg font-bold glow no-underline rounded-2xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="d-lg-none">
            <motion.button
              onClick={toggleMenu}
              className="p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <motion.span
                className="text-2xl text-white"
                animate={{ rotate: isMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ☰
              </motion.span>
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="d-lg-none glass rounded-2xl mt-4 mb-4 overflow-hidden"
            >
              <div className="py-4">
                {isAuthenticated ? (
                  <>
                    {/* Mobile: Deepiri + logo visible at top */}
                    <div className="px-4 pb-3 border-b border-white/10 mb-4">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={logoIcon}
                          alt="Deepiri"
                          style={{ width: 22, height: 22, objectFit: "contain" }}
                          className="drop-shadow"
                        />
                        <span className="text-white font-bold text-lg">Deepiri</span>
                      </div>
                    </div>

                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/10 mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                          {user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-lg text-gray-100">
                            {user?.name || "User"}
                          </div>
                          <div className="text-base text-gray-300 font-medium">
                            Adventurer
                          </div>
                        </div>
                      </div>
                    </div>

                    {[
                      { to: "/dashboard", label: "Dashboard", icon: "🏠" },
                      { to: "/tasks", label: "Tasks", icon: "📋" },
                      { to: "/challenges", label: "Challenges", icon: "🎮" },
                      { to: "/gamification", label: "Progress", icon: "⭐" },
                      { to: "/leaderboard", label: "Leaderboard", icon: "🏆" },
                      { to: "/analytics", label: "Analytics", icon: "📊" },
                      { to: "/profile", label: "Profile", icon: "👤" },
                      { to: "/notifications", label: "Notifications", icon: "🔔" },
                      { to: "/agent", label: "AI Assistant", icon: "🤖" },
                    ].map((item, index) => (
                      <motion.div
                        key={item.to}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          to={item.to}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-white/10 transition-colors duration-200 group no-underline"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                            {item.icon}
                          </span>
                          <span className="text-white group-hover:text-orange-300 transition-colors duration-300 font-semibold text-lg">
                            {item.label}
                          </span>
                        </Link>
                      </motion.div>
                    ))}

                    <div className="border-t border-white/10 my-2" />
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 w-full text-left hover:bg-red-500/20 transition-colors duration-200 group"
                    >
                      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
                        🚪
                      </span>
                      <span className="text-red-400 group-hover:text-red-300 transition-colors duration-300 font-semibold text-lg">
                        Sign Out
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    {/* Mobile: Deepiri + logo visible at top */}
                    <div className="px-4 pb-3 border-b border-white/10 mb-4">
                      <div className="d-flex align-items-center gap-2">
                        <img
                          src={logoIcon}
                          alt="Deepiri"
                          style={{ width: 22, height: 22, objectFit: "contain" }}
                          className="drop-shadow"
                        />
                        <span className="text-white font-bold text-lg">Deepiri</span>
                      </div>
                    </div>

                    <Link
                      to="/login"
                      className="btn-modern px-4 py-3 rounded-2xl font-bold text-lg text-white no-underline mx-4"
                      style={{
                        background:
                          "linear-gradient(135deg, #f97316 0%, #f59e0b 100%)",
                        boxShadow:
                          "0 10px 15px -3px rgba(249, 115, 22, 0.35), 0 4px 6px -4px rgba(249, 115, 22, 0.35)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/register"
                      className="btn-modern btn-primary px-4 py-3 rounded-2xl font-bold text-lg no-underline mx-4 mt-2 justify-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;
