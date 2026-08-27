import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, Variants, useMotionValue, useSpring } from "framer-motion";
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

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 520, damping: 32 });
  const springY = useSpring(mouseY, { stiffness: 520, damping: 32 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 10);
      mouseY.set(e.clientY - 10);
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

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
      {/* Mouse follower — driven by motion values to avoid React re-renders */}
      <motion.div
        className="fixed w-5 h-5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full pointer-events-none z-10 mix-blend-difference opacity-35"
        style={{ x: springX, y: springY }}
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

            <motion.h1 variants={itemVariants} className="deepiri-heroTitle text-black">
              Home base of our operations —{" "}
              <span
                style={{
                  background: "linear-gradient(90deg, #7c3aed, #6366f1, #0ea5e9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Deepiri Platform
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="deepiri-heroSubtitle" style={{color: '#636363'}}>
              Cloud hub for identity, org, and shared catalog. Auth, teams, projects, events,
              and artifacts live here. Cyrex and Language Intelligence run on the local control plane.
            </motion.p>

            <motion.div variants={itemVariants} className="deepiri-heroCtas">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn-modern btn-deepiri px-8 py-3">
                    Create account
                  </Link>
                  <Link to="/login" className="btn-modern btn-secondary text-black px-8 py-3">
                    Sign in
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="btn-modern btn-deepiri px-8 py-3">
                    Open Dashboard
                  </Link>
                  <Link to="/events" className="btn-modern btn-secondary text-black px-8 py-3">
                    View Events
                  </Link>
                </>
              )}
            </motion.div>

            <motion.div variants={itemVariants} className="deepiri-heroSupport">
              Cloud hub • Control plane local • One identity, many products
            </motion.div>
          </div>
        </section>

        {/* QUICK ACCESS — hub routes */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <motion.div variants={itemVariants}>
              <SectionHeader
                eyebrow="Cloud hub"
                title="Everything that lives here"
                subtitle="Identity, org, and shared catalog — the home base for Deepiri projects. Cyrex and Language Intelligence stay on the local control plane."
                align="center"
              />
              <div className="row g-3 mt-2">
                {[
                  { label: "Dashboard", to: "/dashboard", desc: "Hub overview + health", icon: "◈" },
                  { label: "Projects", to: "/dashboard", desc: "Teams, ownership, catalog", icon: "▣" },
                  { label: "People", to: "/profile", desc: "Directory + teams", icon: "◎" },
                  { label: "Events", to: "/events", desc: "Calendar + announcements", icon: "◐" },
                  { label: "Artifacts", to: "/dashboard", desc: "Datasets, docs, recordings", icon: "⬢" },
                  { label: "Announcements", to: "/events", desc: "Comms to the collective", icon: "⬣" },
                  { label: "Registry", to: "/ops/registry", desc: "Service catalog + health", icon: "⬔" },
                  { label: "Jobs", to: "/ops/jobs", desc: "Shared async work", icon: "⬕" },
                ].map((c) => (
                  <div key={c.label} className="col-6 col-md-3">
                    <Link to={c.to} className="deepiri-miniCard h-100 deepiri-cardLift text-decoration-none d-block">
                      <div className="deepiri-miniCardTitle"><span style={{marginRight: 8}}>{c.icon}</span>{c.label}</div>
                      <div className="deepiri-miniCardBody">{c.desc}</div>
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container px-3">
          <SectionDivider />
        </div>

        {/* WHAT LIVES HERE vs CONTROL PLANE */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <Panel>
              <SectionHeader
                eyebrow="Two products, two repos"
                title="Cloud hub vs local control plane"
                subtitle="Hard rule: Cyrex and Language Intelligence have zero coupling in the cloud. They exist only on the local control plane."
                align="center"
              />
              <div className="row g-4 mt-2">
                <motion.div variants={itemVariants} className="col-lg-6">
                  <div className="card-modern p-4 h-100 deepiri-cardLift" style={{borderTop: '3px solid #7c3aed'}}>
                    <h3 className="text-lg font-bold mb-2 text-black">Cloud hub (this VPS)</h3>
                    <p className="mb-2" style={{ color: "#616a77", lineHeight: 1.6, fontSize: '0.95rem' }}>
                      Always-on internal hub at <code>platform.deepiri.com</code>:
                    </p>
                    <ul className="mb-0" style={{ color: "#616a77", lineHeight: 1.7, paddingLeft: '1.2rem' }}>
                      <li>Portal frontend + nginx + certbot</li>
                      <li>auth-service (identity) + hub API</li>
                      <li>postgres <code>deepiri_hub</code> + redis + jobs</li>
                      <li>No Cyrex, no LIS, no object storage</li>
                    </ul>
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <span className="deepiri-pill">VITE_ENABLE_LIS=false</span>
                      <span className="deepiri-pill">VITE_ENABLE_CYREX=false</span>
                    </div>
                  </div>
                </motion.div>
                <motion.div variants={itemVariants} className="col-lg-6">
                  <div className="card-modern p-4 h-100 deepiri-cardLift" style={{borderTop: '3px solid #0ea5e9'}}>
                    <h3 className="text-lg font-bold mb-2 text-black">Local control plane</h3>
                    <p className="mb-2" style={{ color: "#616a77", lineHeight: 1.6, fontSize: '0.95rem' }}>
                      On-demand builder stack — <code>deepiri-control-plane</code> repo:
                    </p>
                    <ul className="mb-0" style={{ color: "#616a77", lineHeight: 1.7, paddingLeft: '1.2rem' }}>
                      <li>LIS + MinIO/S3 + document pipelines</li>
                      <li>Cyrex client wiring (owns its own DB)</li>
                      <li>Helox as library, jobs/truss as needed</li>
                      <li>May call cloud hub for auth (<code>DEEPIRI_HUB_URL</code>)</li>
                    </ul>
                    <div className="d-flex flex-wrap gap-2 mt-3">
                      <span className="deepiri-pill">STORAGE_*</span>
                      <span className="deepiri-pill">CYREX_*</span>
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

        {/* HUB DATABASE */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <Panel>
              <SectionHeader
                eyebrow="Hub Postgres"
                title="One database, four schemas"
                subtitle="Target hub DB is deepiri_hub — not the old platform_auth / platform_core / platform_intelligence split."
                align="center"
              />
              <motion.div variants={itemVariants} className="row g-3 mt-2">
                {[
                  { schema: "identity", tables: "users, sessions, api_keys, invites", purpose: "Login, tokens" },
                  { schema: "org", tables: "teams, memberships, projects, project_members", purpose: "Ownership" },
                  { schema: "comms", tables: "announcements, events, event_rsvps", purpose: "Durable posts" },
                  { schema: "catalog", tables: "artifacts, run_records", purpose: "Shared links + metadata" },
                ].map((r) => (
                  <div key={r.schema} className="col-md-6 col-lg-3">
                    <div className="deepiri-miniCard h-100">
                      <div className="deepiri-miniCardTitle" style={{fontFamily: 'monospace'}}>{r.schema}</div>
                      <div className="deepiri-miniCardBody" style={{fontSize: '0.9rem'}}>{r.tables}</div>
                      <div className="text-xs mt-2" style={{color: '#7c3aed', fontWeight: 600}}>{r.purpose}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
              <motion.div variants={itemVariants} className="d-flex flex-wrap gap-2 justify-content-center mt-4">
                <span className="deepiri-pill">deepiri_hub</span>
                <span className="deepiri-pill">No intelligence tables in hub</span>
                <span className="deepiri-pill">Helox stays a library</span>
              </motion.div>
            </Panel>
          </div>
        </section>

        <div className="container px-3">
          <SectionDivider />
        </div>

        {/* HOW TO USE THE HUB */}
        <section className="deepiri-section relative">
          <div className="container px-3">
            <Panel>
              <SectionHeader
                eyebrow="System flow"
                title="How projects tap the cloud server"
                subtitle="One identity, many products — the hub is the seam, not the whole system."
                align="center"
              />
              <motion.div variants={itemVariants} className="row g-4 mt-2">
                {[
                  { step: "01", title: "Authenticate", body: "Sign in via portal or API key. Hub issues JWT for humans and service clients.", why: "Single identity across Deepiri tools." },
                  { step: "02", title: "Use the directory", body: "Create teams, projects, and memberships. Publish artifacts and run_records.", why: "Shared catalog, not model weights in hub." },
                  { step: "03", title: "Call from control plane", body: "Local Cyrex/LIS tools call hub for auth via DEEPIRI_HUB_URL when they need shared actions.", why: "Control plane owns Cyrex/LIS, not the hub." },
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
              </motion.div>
              <motion.div variants={itemVariants} className="d-flex flex-column flex-sm-row gap-3 justify-content-center mt-4">
                <Link to="/dashboard" className="btn-modern btn-deepiri px-6 py-3">
                  Open Dashboard
                </Link>
                <Link to="/events" className="btn-modern btn-secondary text-black px-6 py-3">
                  Browse Events
                </Link>
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
