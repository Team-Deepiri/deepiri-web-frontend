import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gamificationApi, BoostProfile } from '../../api/gamificationApi';
import toast from 'react-hot-toast';

interface BoostCardProps {
  boostType: 'focus' | 'velocity' | 'clarity' | 'debug' | 'cleanup';
  userId: string;
  boostProfile: BoostProfile;
  onActivate?: () => void;
}

const BoostCard: React.FC<BoostCardProps> = ({
  boostType,
  userId,
  boostProfile,
  onActivate
}) => {
  const [costs, setCosts] = useState<{ costs: Record<string, number>; durations: Record<string, number> } | null>(null);
  const [loading, setLoading] = useState(false);

  const boostInfo = {
    focus: { icon: '🎯', name: 'Focus Boost', description: 'Hide all notifications for 60 minutes' },
    velocity: { icon: '⚡', name: 'Velocity Boost', description: 'AI autocompletes 2 tasks for you' },
    clarity: { icon: '💡', name: 'Clarity Boost', description: 'AI rewrites your specs' },
    debug: { icon: '🐛', name: 'Debug Boost', description: 'AI fixes one bug instantly' },
    cleanup: { icon: '🧹', name: 'Cleanup Boost', description: 'AI cleans docs + structure' }
  };

  const info = boostInfo[boostType];
  const activeBoost = boostProfile.activeBoosts.find(b => b.boostType === boostType);
  const isActive = activeBoost && new Date(activeBoost.expiresAt) > new Date();

  useEffect(() => {
    gamificationApi.getBoostCosts().then(result => {
      if (result.success) setCosts(result.data);
    });
  }, []);

  const handleActivate = async () => {
    if (isActive) {
      toast.error('This boost is already active!');
      return;
    }

    if (boostProfile.boostCredits < (costs?.costs[boostType] || 0)) {
      toast.error('Insufficient boost credits!');
      return;
    }

    setLoading(true);
    try {
      await gamificationApi.activateBoost(userId, boostType, 'purchased');
      toast.success(`${info.name} activated! 🚀`);
      if (onActivate) onActivate();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to activate boost');
    } finally {
      setLoading(false);
    }
  };

  const timeRemaining = activeBoost
    ? Math.max(0, Math.floor((new Date(activeBoost.expiresAt).getTime() - Date.now()) / 1000 / 60))
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg shadow-md p-4 border-2 ${
        isActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
      } hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{info.icon}</span>
          <div>
            <h3 className="font-semibold text-gray-800">{info.name}</h3>
            <p className="text-xs text-gray-600">{info.description}</p>
          </div>
        </div>
      </div>

      {isActive ? (
        <div className="bg-purple-100 rounded p-2 mb-3">
          <div className="text-sm font-semibold text-purple-800">Active!</div>
          <div className="text-xs text-purple-600">{timeRemaining} minutes remaining</div>
        </div>
      ) : (
        <div className="mb-3">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">Cost:</span>
            <span className="font-semibold">{costs?.costs[boostType] || 0} credits</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Duration:</span>
            <span className="font-semibold">{costs?.durations[boostType] || 0} min</span>
          </div>
        </div>
      )}

      <button
        onClick={handleActivate}
        disabled={loading || isActive || boostProfile.boostCredits < (costs?.costs[boostType] || 0)}
        className={`w-full py-2 rounded-lg font-semibold transition-colors ${
          isActive
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : boostProfile.boostCredits < (costs?.costs[boostType] || 0)
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
      >
        {loading ? 'Activating...' : isActive ? 'Active' : 'Activate Boost'}
      </button>
    </motion.div>
  );
};

export default BoostCard;

