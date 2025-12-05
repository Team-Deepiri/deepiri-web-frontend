import React from 'react';
import { motion } from 'framer-motion';

interface MomentumBarProps {
  currentMomentum: number;
  momentumToNextLevel: number;
  currentLevel: number;
  className?: string;
}

const MomentumBar: React.FC<MomentumBarProps> = ({
  currentMomentum,
  momentumToNextLevel,
  currentLevel,
  className = ''
}) => {
  const percentage = Math.min(100, (currentMomentum / momentumToNextLevel) * 100);

  return (
    <div className={`${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">Level {currentLevel}</span>
          <span className="text-xs text-gray-500">⚡ Momentum</span>
        </div>
        <span className="text-sm text-gray-600">
          {currentMomentum.toLocaleString()} / {momentumToNextLevel.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] animate-gradient-x"
        />
      </div>
    </div>
  );
};

export default MomentumBar;

