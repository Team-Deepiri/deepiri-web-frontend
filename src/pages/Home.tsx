import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import logo from "../assets/images/logo_squared.png";
import SectionDivider from "../components/SectionDivider";

const SectionHeader: React.FC<{
  eyebrow: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
}> = ({ eyebrow, title, subtitle, align = "left" }) => {
  const isCenter = align === "center";
  return (
    <div className={`deepiri-sectionHeader ${isCenter ? "is-center" : ""}`}>
      <div className="deepiri-eyebrow">{eyebrow}</div>
      <h2 className="deepiri-sectionTitle">{title}</h2>
      {subtitle ? <p className="deepiri-sectionSubtitle">{subtitle}</p> : null}
    </div>
  );
};

const Panel: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="deepiri-panel is-soft">{children}</div>;
};

const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
  };

  const itemVariants: Variants = {
    hidden: { y: 12, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.55, ease: "easeOut" } },
  };

  return (
    <div className="relative">
      {/* Mouse follower */}
      <motion.div
        className="fixed w-5 h-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full pointer-events-none z-10 mix-blend-difference opacity-35"
        animate={{ x: mousePosition.x - 10, y: mousePosition.y - 10 }}
        transition={{ type: "spring", stiffness: 520, damping: 32 }}
      />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="relative z-20">
        {/* HERO */}
        <section className="deepiri-hero">
          <div className="deepiri-heroInner">
            <motion.div variants={itemVariants} className="deepiri-heroLogoWrap">
              <img src={logo} alt="Deepiri logo" className="deepiri-heroLogo" draggable={false} />
            </motion.div>

            <motion.div variants={itemVariants} className="deepiri-heroEyebrow">
              Deepiri — AI R&amp;D Collective
            </motion.div>

            <motion.h1 variants={itemVariants} className="deepiri-heroTitle">
              Productivity analytics, grounded in{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #f97316, #f59e0b)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                behavior.
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="deepiri-heroSubtitle">
              Turn behavioral signals into decision-ready insight—so teams can reason about momentum,
              consistency, and adaptation instead of counting output.
            </motion.p>

            <motion.div variants={itemVariants} className="deepiri-heroCtas">
              {!isAuthenticated ? (
                <>
                  <Link to="/contact" className="btn-modern btn-deepiri px-8 py-3">
                    Talk to the Collective
                  </Link>
                  <Link to="/about" className="btn-modern btn-glass px-8 py-3">
                    Explore the Research
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="btn-modern btn-deepiri px-8 py-3">
                    Go to Dashboard
                  </Link>
                  <Link to="/analytics" className="btn-modern btn-glass px-8 py-3">
                    View Analytics
                  </Link>
                </>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="deepiri-heroSupport">
              Research-first • Platform-aware • Privacy-conscious by design
            </motion.div>
          </div>
        </section>

        {/* Proof strip */}
        <section className="deepiri-section-sm relative">
          <div className="container px-3">
            <motion.div
              variants={itemVariants}
              className="d-flex flex-wrap align-items-center justify-content-center gap-2 text-xs text-slate-200"
            >
              <span className="fw-semibold text-slate-300">Trusted by operators who need clarity:</span>
              {["Growth", "Ops", "Eng", "Analytics"].map((pill) => (
                <span key={pill} className="deepiri-pill">
                  {pill}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        <div className="container px-3">
          <SectionDivider />
        </div>

        {/* WHO IT’S FOR */}
        <section className="deepiri-section-sm relative">
          <div className="container px-3">
            <motion.div variants={itemVariants} className="d-flex flex-wrap gap-2 justify-content-center">
              {["Researchers", "Builders", "Operators", "Platform Teams", "Labs"].map((label) => (
                <span key={label} className="deepiri-pill">
                  {label}
                </span>
              ))}
            </motion.div>
          </div>
        </section>

        {/* PLATFORM SNAPSHOT */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <motion.div variants={itemVariants} className="deepiri-highlightRow">
              {[
                {
                  title: "Behavioral clarity",
                  body: "Translate raw events into momentum, consistency, and adaptation signals.",
                },
                {
                  title: "Signal quality guardrails",
                  body: "Research-grade assumptions and checkpoints to avoid vanity metrics.",
                },
                {
                  title: "Enterprise-ready UX",
                  body: "Readable, explainable panels that keep operators and leaders aligned.",
                },
              ].map((h) => (
                <div key={h.title} className="deepiri-highlightCard deepiri-cardLift">
                  <div className="pill-dot" />
                  <div className="title">{h.title}</div>
                  <div className="body">{h.body}</div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="deepiri-panel text-center">
              <SectionHeader
                eyebrow="Platform view"
                title="See patterns, not just activity logs"
                subtitle="A research-grade snapshot that blends behavioral signals with clean, interpretable visuals."
                align="center"
              />
              <div className="deepiri-platformFrame deepiri-cardLift">
                <div className="deepiri-platformCaption">
                  <span className="dot" />
                  Live signals
                </div>
                <div className="deepiri-platformBars">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="deepiri-platformGrid">
                  <div className="deepiri-platformTile is-metric">
                    <div className="label">Momentum</div>
                    <div className="value">+18%</div>
                    <div className="sub">vs last week</div>
                  </div>
                  <div className="deepiri-platformTile is-metric">
                    <div className="label">Consistency</div>
                    <div className="value">92%</div>
                    <div className="sub">signal quality</div>
                  </div>
                  <div className="deepiri-platformTile is-chart">
                    <div className="chart-fill" />
                    <div className="chart-fill alt" />
                  </div>
                  <div className="deepiri-platformTile is-list">
                    <div className="list-row">• Behavioral intelligence</div>
                    <div className="list-row">• Signals → insight</div>
                    <div className="list-row">• Privacy-conscious by default</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* METRICS STRIP */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <motion.div variants={itemVariants} className="deepiri-panel">
              <SectionHeader
                eyebrow="Research + Platform"
                title="Built for signal quality—not vanity metrics"
                subtitle="Clear outcomes, credible constraints, and interpretable results."
                align="left"
              />

              <div className="row g-4 mt-3">
                {[
                  {
                    icon: "📈",
                    value: "Decision-ready",
                    label: "Signal → Insight",
                    body: "Interpretable outputs like momentum, consistency, and adaptation—not just activity volume.",
                  },
                  {
                    icon: "🧪",
                    value: "Research-first",
                    label: "Iteration + evaluation",
                    body: "Designed for experiments, checkpoints, and evolving models with clear assumptions.",
                  },
                  {
                    icon: "🔒",
                    value: "Privacy-conscious",
                    label: "Platform-aware by default",
                    body: "Respects data boundaries and minimizes sensitive exposure while staying useful to teams.",
                  },
                ].map((c) => (
                  <div key={c.value} className="col-md-4">
                    <div className="deepiri-metricCard deepiri-cardLift">
                      <div className="deepiri-metricIcon">{c.icon}</div>
                      <div className="deepiri-metricValue">{c.value}</div>
                      <div className="deepiri-metricLabel">{c.label}</div>
                      <div className="deepiri-metricBody">{c.body}</div>
                    </div>
                  </div>
                ))}
              </div>

              {!isAuthenticated && (
                <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                  <Link to="/about" className="btn-modern btn-glass px-6 py-3">
                    Explore the Research
                  </Link>
                  <Link to="/contact" className="btn-modern btn-deepiri px-6 py-3">
                    Talk to the Collective
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <div className="container px-3">
          <SectionDivider />
        </div>

        {/* PROBLEM + PILLARS */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <Panel>
              <SectionHeader
                eyebrow="Problem"
                title="Why productivity analytics keeps missing the point"
                subtitle="Most tools measure output. Deepiri models behavior—engagement, consistency, and adaptation over time."
              />

              <div className="row g-4 align-items-stretch mt-3">
                <motion.div variants={itemVariants} className="col-lg-5">
                  <div className="card-modern p-4 h-100 deepiri-cardLift">
                    <div className="deepiri-accentBar" />
                    <h3 className="text-2xl font-bold mb-2 text-white">
                      Productivity is poorly understood.
                    </h3>
                    <p className="mb-0" style={{ color: "#94a3b8", lineHeight: 1.65 }}>
                      Most tools measure output, not behavior. Deepiri models engagement, consistency,
                      and adaptation over time—so teams can reason about momentum, not just completed tasks.
                    </p>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="col-lg-7">
                  <div className="card-modern p-4 h-100 deepiri-cardLift">
                    <div className="row g-3">
                      {[
                        { title: "Behavioral intelligence", body: "See how work happens—beyond what gets done." },
                        { title: "Signals → insight", body: "Turn patterns into interpretable guidance." },
                        { title: "Designed for research", body: "Built for iteration, evaluation, and model evolution." },
                        { title: "Credibility over hype", body: "Clear claims. Clean, enterprise-ready UX." },
                      ].map((item) => (
                        <div key={item.title} className="col-md-6">
                          <div className="deepiri-miniCard h-100">
                            <div className="deepiri-miniCardTitle">{item.title}</div>
                            <div className="deepiri-miniCardBody">{item.body}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </Panel>
          </div>
        </section>

        <div className="container px-3">
          <SectionDivider />
        </div>

        {/* HOW IT WORKS */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <Panel>
              <SectionHeader
                eyebrow="System flow"
                title="From signals to decision-ready insight"
                subtitle="A research-first pipeline that stays measurable and iteration-friendly."
              />

              <motion.div variants={itemVariants} className="card-modern p-5 mt-3 deepiri-cardLift">
                <div className="row g-4">
                  {[
                    {
                      step: "01",
                      title: "Collect signals",
                      body: "Capture behavioral signals from real workflows—beyond task lists.",
                      why: "Basis for momentum and consistency scores.",
                    },
                    {
                      step: "02",
                      title: "Interpret patterns",
                      body: "Model engagement, consistency, and adaptation over time.",
                      why: "Translate raw events into decision-ready metrics.",
                    },
                    {
                      step: "03",
                      title: "Deliver guidance",
                      body: "Turn patterns into interpretable insight for teams and platforms.",
                      why: "Surface clear, actionable cues to keep teams aligned.",
                    },
                  ].map((s) => (
                    <div key={s.step} className="col-md-4">
                      <div className="deepiri-stepCard h-100">
                        <div className="deepiri-stepNum">{s.step}</div>
                        <div className="deepiri-stepTitle">{s.title}</div>
                        <div className="deepiri-stepBody">{s.body}</div>
                        <div className="deepiri-stepWhy">{s.why}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {!isAuthenticated && (
                <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
                  <Link to="/about" className="btn-modern btn-glass px-6 py-3">
                    Read the approach
                  </Link>
                    <Link to="/contact" className="btn-modern btn-deepiri px-6 py-3">
                      Talk to the Collective
                    </Link>
                  </div>
                )}
              </motion.div>
            </Panel>
          </div>
        </section>

        <div className="container px-3">
          <SectionDivider />
        </div>

        {/* ABOUT */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <Panel>
              <SectionHeader
                eyebrow="Developer-first R&D"
                title="Built by people who ship systems"
                subtitle="No hype decks. No “AI magic.” Iteration, measurement, and honest claims."
              />

              <motion.div variants={itemVariants} className="card-modern p-5 mt-3 deepiri-cardLift">
                <p style={{ color: "#cbd5e1", lineHeight: 1.65, maxWidth: 980 }}>
                  Deepiri is an independent R&amp;D collective focused on how work actually happens.
                  We build research-driven systems that model engagement, consistency, and adaptation—
                  using behavioral signals instead of task checklists.
                </p>

                <div className="d-flex flex-wrap gap-2 mt-3">
                  <span className="deepiri-pill">Research-first instrumentation</span>
                  <span className="deepiri-pill">Privacy-conscious by design</span>
                  <span className="deepiri-pill">Designed to evolve</span>
                </div>

                {!isAuthenticated && (
                  <div className="d-flex flex-column flex-sm-row gap-2 mt-4">
                    <Link to="/contact" className="btn-modern btn-deepiri px-6 py-3">
                      Talk to the Collective
                    </Link>
                    <Link to="/register" className="btn-modern btn-glass px-6 py-3">
                      Request Early Access
                    </Link>
                  </div>
                )}
              </motion.div>
            </Panel>
          </div>
        </section>

        <div className="pb-8" />
      </motion.div>
    </div>
  );
};

export default Home;
