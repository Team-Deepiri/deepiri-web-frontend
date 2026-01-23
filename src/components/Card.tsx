import React from 'react';

interface CardProps {
    title: string;
    description: string;
    label?: string;
}

const Card: React.FC<CardProps> = ({ title, description, label }) => {
    return (
        <div className="component-card">
            {label && <span className="component-card-label">{label}</span>}
            <h3 className="component-card-title">{title}</h3>
            <p className="component-card-description">{description}</p>
        </div>
    );
};

export default Card;
