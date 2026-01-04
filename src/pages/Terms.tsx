import React from "react";

const Terms: React.FC = () => {
  return (
    <div className="container px-4 py-5">
      <h1 className="font-black" style={{ color: "#fff", fontSize: "clamp(28px, 3.2vw, 44px)" }}>
        Terms of Service
      </h1>

      <p style={{ color: "#a8b3c7", maxWidth: 900, lineHeight: 1.7 }}>
        This is a placeholder Terms of Service page. Replace this content with your official terms.
      </p>

      <div
        className="card-modern p-4 p-md-5 mt-4"
        style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.10)" }}
      >
        <h2 className="font-black" style={{ color: "#fff", fontSize: 22 }}>
          Basic usage
        </h2>
        <ul style={{ color: "#94a3b8", lineHeight: 1.9, marginTop: 10 }}>
          <li>Use the service lawfully and respectfully.</li>
          <li>Do not attempt to disrupt or exploit the platform.</li>
          <li>We may update features as research and development evolves.</li>
        </ul>
      </div>
    </div>
  );
};

export default Terms;
