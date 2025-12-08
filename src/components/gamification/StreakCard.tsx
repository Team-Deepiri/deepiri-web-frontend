import React from 'react';
import { motion } from 'framer-motion';
import { gamificationApi } from '../../api/gamificationApi';
import toast from 'react-hot-toast';

interface StreakCardProps {
  type: 'daily' | 'weekly' | 'project' | 'pr' | 'healthy';
  current: number;
  longest: number;
  canCashIn: boolean;
  userId: string;
  onCashIn?: () => void;
}

const StreakCard: React.FC<StreakCardProps> = ({
  type,
  current,
  longest,
  canCashIn,
  userId,
  onCashIn
}) => {
  const icons = {
    daily: '🔥',
    weekly: '📅',
    project: '🏗️',
    pr: '🔀',
    healthy: '💚'
  };

  const labels = {
    daily: 'Daily Streak',
    weekly: 'Weekly Streak',
    project: 'Project Streak',
    pr: 'PR Streak',
    healthy: 'Healthy Streak'
  };

  const handleCashIn = async () => {
    try {
      const result = await gamificationApi.cashInStreak(userId, type);
      toast.success(`Cashed in ${current} ${type} streak for ${result.data.boostCreditsEarned} boost credits! 🎉`);
      if (onCashIn) onCashIn();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to cash in streak');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icons[type]}</span>
          <h3 className="font-semibold text-gray-800">{labels[type]}</h3>
        </div>
        {canCashIn && (
          <button
            onClick={handleCashIn}
            className="px-3 py-1 text-xs bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
          >
            Cash In
          </button>
        )}
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Current</span>
            <span className="font-bold text-purple-600">{current}</span>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Longest</span>
            <span className="font-semibold text-gray-800">{longest}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StreakCard;

