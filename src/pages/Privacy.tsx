import React from "react";

const Privacy: React.FC = () => {
  return (
    <div className="container px-4 py-5">
      <h1 className="font-black" style={{ color: "#fff", fontSize: "clamp(28px, 3.2vw, 44px)" }}>
        Privacy Policy
      </h1>

      <p style={{ color: "#a8b3c7", maxWidth: 900, lineHeight: 1.7 }}>
        This is a placeholder privacy policy page. Replace this content with your official policy.
      </p>

      <div
        className="card-modern p-4 p-md-5 mt-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        <h2 className="font-black" style={{ color: "#fff", fontSize: 22 }}>
          Privacy-first principles
        </h2>
        <ul style={{ color: "#94a3b8", lineHeight: 1.9, marginTop: 10 }}>
          <li>Collect only what’s necessary for functionality and improvement.</li>
          <li>Secure data in transit and at rest (where applicable).</li>
          <li>Respect user control and transparency.</li>
        </ul>
      </div>
    </div>
  );
};

export default Privacy;
