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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          overflow: "hidden"
        }}
      >
        <div className="max-w-5xl mx-auto text-center">
          <motion.div 
            variants={itemVariants}
            className="deepiri-heroLogoWrap"
          >
            <img src={logo} alt="Deepiri logo" className="deepiri-heroLogo" draggable={false} style={{ width: '25%', height: '25%', zIndex: 0 }} />
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="deepiri-heroTitle text-black text-4xl font-extrabold"
            initial={{y: -45}}
          >
            About Us
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-center deepiri-heroSubtitle text-black"
            initial={{y: -30}}
            style={{
              color: "white",
              maxWidth: 900,
              lineHeight: 1.55,
              paddingTop: '2rem'
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
              color: "black",
              maxWidth: 900,
              lineHeight: 1.55
            }}
          >
            We're building an intelligence layer for productivity: collecting signals, interpreting patterns, 
            and producing decision-ready insight designed for further iteration and long-term evolution.
          </motion.p>
          <motion.div className='row pb-4 justify-content-center'>
            {["Researchers", "Builders", "Operators", "Platform Teams", "Labs"].map(
              (label) => (
                <div 
                  key={label}
                  className="deepiri-heroSubtitle col rounded m-2"
                  style={{
                    paddingTop: "0.5rem", 
                    paddingBottom: "0.5rem", 
                    maxWidth: 200, 
                    lineHeight: 2, 
                    color: "white", 
                    background: '#6366f1'
                  }}
                >
                  {label}
                </div>
              )
            )}
          </motion.div>

          {/* What we're NOT */}
          <motion.div
            variants={itemVariants}
            className="mb-5 deepiri-heroSubtitle"
            style={{ 
              maxWidth: 900,
              lineHeight: 1.55,
              color: 'black'
            }}
          >
            <strong style={{ color: "#f97316" }}>What we&rsquo;re not:</strong>{" "}
            <span style={{ color: "#000000" }}>
            hype decks, vanity dashboards, or &ldquo;AI magic&rdquo; claims. We
            build iteratively, measure carefully, and ship what holds up.
            </span>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-5">
            <div className="max-w-5xl mx-auto text-center pb-3">
              <h1 className="deepiri-heroTitle text-black pb-3">What we&rsquo;re building</h1>
              <motion.p 
                className="text-center deepiri-heroSubtitle text-black"
                style={{
                  maxWidth: 900,
                  lineHeight: 1.55
                }}>
                Deepiri is building an intelligence layer for productivity: collecting signals, interpreting patterns, and producing decision-ready insight designed for further iteration and long-term evolution.
              </motion.p>
            </div>
            <div className="row g-3 pb-3 justify-content-center" style={{width: '70%',  margin: '0 auto'}}>
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
                <div key={item.title} className="col-md-6">
                  <div className="card-modern p-4 h-100 deepiri-cardLift" style={{backgroundColor: "#ffffff"}}>
                    <div
                      className="text-sm font-semibold mb-1"
                      style={{ color: "#f97316" }}
                    >
                      {item.title}
                    </div>
                    <div className="text-sm text-slate-300 text-black">
                      {item.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <motion.p className="deepiri-heroSubtitle text-black">If you are interested in collaborating with us on our mission, feel free to <Link to="/contact" style={{color: "#6366f1"}}>contact us!</Link></motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default About;
