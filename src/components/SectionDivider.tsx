import React from "react";

const SectionDivider: React.FC = () => {
  return (
    <div className="deepiri-divider" aria-hidden="true">
      <div className="deepiri-dividerLine" />
      <div className="deepiri-dividerGlow" />
    </div>
  );
};

export default SectionDivider;
