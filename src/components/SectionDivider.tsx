import React from 'react';

const SectionDivider: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="section-divider">
      <div className="section-divider-line"></div>
      {text && <span className="section-divider-text">{text}</span>}
      <div className="section-divider-line"></div>
    </div>
  );
};

export default SectionDivider;
