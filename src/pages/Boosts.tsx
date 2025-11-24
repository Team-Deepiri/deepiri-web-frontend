import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi, BoostProfile } from '../api/gamificationApi';
import BoostCard from '../components/gamification/BoostCard';
import toast from 'react-hot-toast';

const Boosts: React.FC = () => {
  const { user } = useAuth();
  const [boostProfile, setBoostProfile] = useState<BoostProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchBoosts();
    }
  }, [user]);

  const fetchBoosts = async () => {
    try {
      setLoading(true);
      const result = await gamificationApi.getBoosts(user!.id);
      if (result.success) {
        setBoostProfile(result.data);
      }
    } catch (error) {
      toast.error('Failed to load boosts');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !boostProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const boostTypes: Array<'focus' | 'velocity' | 'clarity' | 'debug' | 'cleanup'> = [
    'focus',
    'velocity',
    'clarity',
    'debug',
    'cleanup'
  ];

  const autopilotRemaining = boostProfile.settings.maxAutopilotTimePerDay - boostProfile.settings.autopilotTimeUsedToday;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">⚡ Boosts</h1>

        {/* Boost Credits & Autopilot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {boostProfile.boostCredits}
              </div>
              <p className="text-gray-600">Boost Credits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {autopilotRemaining} min
              </div>
              <p className="text-gray-600">Autopilot Time Remaining</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {boostProfile.activeBoosts.length}
              </div>
              <p className="text-gray-600">Active Boosts</p>
            </div>
          </div>
        </motion.div>

        {/* Active Boosts */}
        {boostProfile.activeBoosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Boosts</h2>
            <div className="space-y-3">
              {boostProfile.activeBoosts.map((boost, idx) => {
                const timeRemaining = Math.max(0, Math.floor((new Date(boost.expiresAt).getTime() - Date.now()) / 1000 / 60));
                return (
                  <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 capitalize">{boost.boostType} Boost</h3>
                        <p className="text-sm text-gray-600">{timeRemaining} minutes remaining</p>
                      </div>
                      <div className="text-2xl">
                        {boost.boostType === 'focus' && '🎯'}
                        {boost.boostType === 'velocity' && '⚡'}
                        {boost.boostType === 'clarity' && '💡'}
                        {boost.boostType === 'debug' && '🐛'}
                        {boost.boostType === 'cleanup' && '🧹'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Available Boosts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Boosts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boostTypes.map((boostType) => (
              <BoostCard
                key={boostType}
                boostType={boostType}
                userId={user!.id}
                boostProfile={boostProfile}
                onActivate={fetchBoosts}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Boosts;

