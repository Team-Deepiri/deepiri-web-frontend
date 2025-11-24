import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi, MomentumProfile } from '../api/gamificationApi';
import MomentumBar from '../components/gamification/MomentumBar';
import toast from 'react-hot-toast';

const Progress: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<MomentumProfile | null>(null);
  const [rank, setRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [momentumResult, rankResult] = await Promise.all([
        gamificationApi.getMomentum(user!.id),
        gamificationApi.getUserRank(user!.id)
      ]);
      if (momentumResult.success) setProfile(momentumResult.data);
      if (rankResult.success) setRank(rankResult.data.rank);
    } catch (error) {
      toast.error('Failed to load progress');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const skillEntries = Object.entries(profile.skillMastery);
  const totalSkillMomentum = skillEntries.reduce((sum, [, value]) => sum + value, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">⚡ Momentum & Progress</h1>

        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Level {profile.currentLevel}
              </h2>
              {rank && (
                <p className="text-gray-600">Rank #{rank.toLocaleString()}</p>
              )}
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {profile.totalMomentum.toLocaleString()}
              </div>
              <p className="text-gray-600">Total Momentum</p>
            </div>
          </div>
          <MomentumBar
            currentMomentum={profile.totalMomentum % profile.momentumToNextLevel}
            momentumToNextLevel={profile.momentumToNextLevel}
            currentLevel={profile.currentLevel}
          />
        </motion.div>

        {/* Skill Mastery */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Skill Mastery</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillEntries.map(([skill, value]) => {
              const percentage = totalSkillMomentum > 0 ? (value / totalSkillMomentum) * 100 : 0;
              return (
                <div key={skill} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-600 mb-2 capitalize">
                    {skill}
                  </div>
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {value.toLocaleString()}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements */}
        {profile.achievements.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Achievements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.achievements.map((achievement, idx) => (
                <div
                  key={idx}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🏆</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{achievement.name}</h3>
                      <p className="text-sm text-gray-600">{achievement.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Progress;

