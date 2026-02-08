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
        border: `1px solid ${isHovered ? '#a855f7' : '#1f2937'}`,
        padding: '2rem',
        borderRadius: '1.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: isHovered ? '0 0 30px rgba(168, 85, 247, 0.15)' : 'none',
        transform: isHovered ? 'translateY(-5px)' : 'none',
        width: '100%',
        maxWidth: '100%', // Prevents the card from ever being wider than its parent
        boxSizing: 'border-box', // Includes padding in the width calculation
        overflow: 'hidden' // Keeps content inside
      }}
    >
      {label && (
        <span style={{
          color: '#f97316',
          fontSize: '10px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          marginBottom: '1rem',
          display: 'block'
        }}>
          {label}
        </span>
      )}
      <h3 style={{
        color: isHovered ? '#c084fc' : 'white',
        fontSize: '1.5rem',
        fontWeight: 'bold',
        margin: '0 0 1rem 0'
      }}>
        {title}
      </h3>
      <p style={{
        color: '#9ca3af',
        fontSize: '0.9rem',
        lineHeight: '1.6',
        margin: '0'
      }}>
        {description}
      </p>
    </div>
  );
};

export default Card;
