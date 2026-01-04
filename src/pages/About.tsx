import React from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";

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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative z-10"
    >
      {/* TOP OFFSET — prevents nav overlap */}
      <section className="pt-24 pb-6 px-3">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl font-extrabold mb-3"
            style={{ color: "#e2e8f0" }}
          >
            About Deepiri
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mb-4"
            style={{
              color: "#cbd5e1",
              maxWidth: 900,
              lineHeight: 1.55,
            }}
          >
            Deepiri is an independent AI R&amp;D collective focused on understanding
            how work actually happens. We build research-driven systems that model
            engagement, consistency, and adaptation—using behavioral signals instead
            of task checklists.
          </motion.p>

          {/* Audience chips */}
          <motion.div
            variants={itemVariants}
            className="d-flex flex-wrap gap-2 mb-4"
          >
            {["Researchers", "Builders", "Operators", "Platform Teams", "Labs"].map(
              (label) => (
                <span
                  key={label}
                  className="px-3 py-1 rounded-full text-xs border border-white/10"
                  style={{ color: "#cbd5e1" }}
                >
                  {label}
                </span>
              )
            )}
          </motion.div>

          {/* What we're NOT */}
          <motion.div
            variants={itemVariants}
            className="mb-5"
            style={{ color: "#94a3b8" }}
          >
            <strong style={{ color: "#f97316" }}>What we&rsquo;re not:</strong>{" "}
            hype decks, vanity dashboards, or &ldquo;AI magic&rdquo; claims. We
            build iteratively, measure carefully, and ship what holds up.
          </motion.div>

          {/* Core card */}
          <motion.div
            variants={itemVariants}
            className="card-modern p-4"
          >
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <h2 className="text-2xl font-bold mb-0" style={{ color: "#e2e8f0" }}>
                What we&rsquo;re building{" "}
                <span style={{ color: "#f97316" }}>(research-first)</span>
              </h2>

              <div className="d-flex gap-2">
                <Link
                  to="/contact"
                  className="btn-modern btn-primary px-4 py-2"
                >
                  Contact
                </Link>
                <Link
                  to="/"
                  className="btn-modern btn-glass px-4 py-2"
                >
                  Back to Home
                </Link>
              </div>
            </div>

            <p
              className="mb-4"
              style={{ color: "#cbd5e1", lineHeight: 1.55, maxWidth: 900 }}
            >
              We&rsquo;re building an intelligence layer for productivity: collect
              signals, interpret patterns, and produce decision-ready insight—
              designed for iteration and long-term evolution.
            </p>

            <div className="row g-3">
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
                  <div className="p-3 rounded-3 border border-white/10 h-100">
                    <div
                      className="text-sm font-semibold mb-1"
                      style={{ color: "#f97316" }}
                    >
                      {item.title}
                    </div>
                    <div className="text-sm text-slate-300">
                      {item.body}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm" style={{ color: "#94a3b8" }}>
              Interested in collaboration, research alignment, or early access?{" "}
              <Link to="/contact" style={{ color: "#f97316" }}>
                Reach out through Contact.
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
