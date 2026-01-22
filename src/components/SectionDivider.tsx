import React from 'react';

const SectionDivider: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      padding: '1.5rem 0',
      alignItems: 'center',
      width: '100%'
    }}>
      <div style={{ flexGrow: 1, borderTop: '1px solid #1f2937' }}></div>
      {text && (
        <span style={{
          flexShrink: 0,
          margin: '0 1.5rem',
          color: '#9ca3af',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.4em'
        }}>
          {text}
        </span>
      )}
      <div style={{ flexGrow: 1, borderTop: '1px solid #1f2937' }}></div>
    </div>
  );
};

export default SectionDivider;
