import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi, StreakData } from '../api/gamificationApi';
import StreakCard from '../components/gamification/StreakCard';
import toast from 'react-hot-toast';

const Streaks: React.FC = () => {
  const { user } = useAuth();
  const [streaks, setStreaks] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchStreaks();
    }
  }, [user]);

  const fetchStreaks = async () => {
    try {
      setLoading(true);
      const result = await gamificationApi.getStreaks(user!.id);
      if (result.success) {
        setStreaks(result.data);
      }
    } catch (error) {
      toast.error('Failed to load streaks');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !streaks) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">🔥 Streaks</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StreakCard
            type="daily"
            current={streaks.daily.current}
            longest={streaks.daily.longest}
            canCashIn={streaks.daily.canCashIn}
            userId={user!.id}
            onCashIn={fetchStreaks}
          />
          <StreakCard
            type="weekly"
            current={streaks.weekly.current}
            longest={streaks.weekly.longest}
            canCashIn={streaks.weekly.canCashIn}
            userId={user!.id}
            onCashIn={fetchStreaks}
          />
          <StreakCard
            type="project"
            current={streaks.project.current}
            longest={streaks.project.longest}
            canCashIn={streaks.project.canCashIn}
            userId={user!.id}
            onCashIn={fetchStreaks}
          />
          <StreakCard
            type="pr"
            current={streaks.pr.current}
            longest={streaks.pr.longest}
            canCashIn={streaks.pr.canCashIn}
            userId={user!.id}
            onCashIn={fetchStreaks}
          />
          <StreakCard
            type="healthy"
            current={streaks.healthy.current}
            longest={streaks.healthy.longest}
            canCashIn={streaks.healthy.canCashIn}
            userId={user!.id}
            onCashIn={fetchStreaks}
          />
        </div>

        {/* Cashed In History */}
        {streaks.cashedInStreaks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cashed In History</h2>
            <div className="space-y-2">
              {streaks.cashedInStreaks.slice(0, 10).map((cashIn, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium capitalize">{cashIn.streakType} streak</span>
                    <span className="text-gray-600 ml-2">({cashIn.streakValue} days/weeks)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-purple-600">+{cashIn.boostCreditsEarned} credits</div>
                    <div className="text-xs text-gray-500">
                      {new Date(cashIn.cashedAt).toLocaleDateString()}
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

export default Streaks;

