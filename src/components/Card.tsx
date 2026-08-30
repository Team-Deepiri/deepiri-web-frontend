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
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#111827',
        border: `1px solid ${isHovered ? '#7c3aed' : 'rgba(255,255,255,0.08)'}`,
        padding: '2rem',
        borderRadius: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? '0 0 25px rgba(124, 58, 237, 0.15)' : '0 20px 40px rgba(0,0,0,0.2)',
        transform: isHovered ? 'translateY(-5px)' : 'none',
        width: '100%',
        boxSizing: 'border-box',
        height: '100%'
      }}
    >
      {label && (
        <span style={{
          color: '#f97316',
          fontSize: '10px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: '1rem',
          display: 'block'
        }}>
          {label}
        </span>
      )}
      <h3 style={{
        color: '#ffffff',
        fontSize: '1.5rem',
        fontWeight: '800',
        margin: '0 0 1rem 0',
        lineHeight: '1.2'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#9ca3af',
        fontSize: '0.875rem',
        lineHeight: '1.6',
        margin: '0'
      }}>
        {description}
      </p>
    </div>
  );
};

export default Card;
