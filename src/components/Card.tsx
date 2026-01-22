import React, { useState } from 'react';

interface CardProps {
  title: string;
  description: string;
  label?: string;
}

const Card: React.FC<CardProps> = ({ title, description, label }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: '#111827',
        border: `1px solid ${isHovered ? '#a855f7' : '#1f2937'}`,
        padding: '2.5rem',
        borderRadius: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered 
          ? '0 0 30px rgba(168, 85, 247, 0.25), 0 10px 25px rgba(0, 0, 0, 0.3)' 
          : '0 4px 6px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)',
        transform: isHovered ? 'translateY(-6px)' : 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {label && (
        <span style={{
          color: '#f97316',
          fontSize: '11px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.25em',
          display: 'block',
          marginBottom: '1rem'
        }}>
          {label}
        </span>
      )}
      <h3 style={{
        color: isHovered ? '#c084fc' : '#ffffff',
        fontSize: '1.75rem',
        fontWeight: '700',
        margin: '0 0 1rem 0',
        transition: 'color 0.3s ease',
        lineHeight: '1.3'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#d1d5db',
        fontSize: '1rem',
        lineHeight: '1.6',
        margin: '0'
      }}>
        {description}
      </p>
    </div>
  );
};

export default Card;
