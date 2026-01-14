import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  // Define any props if needed in the future
  title?: string;
  content?: string;
  icon?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, content, icon }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-modern"
    >
      {icon && <div className="mb-4">{icon}</div>}
      <h2 className="text-2xl font-bold text-white mb-4">
        {title || "New Component 🆕"}
      </h2>
      <p className="text-gray-300">
        {content || "This is a placeholder component. You can customize it as needed."}
      </p>
    </motion.div>
  );
};

export default Card;