import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi, Season } from '../api/gamificationApi';
import toast from 'react-hot-toast';

const Seasons: React.FC = () => {
  const { user } = useAuth();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSeason, setNewSeason] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    sprintCycle: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchSeasons();
    }
  }, [user]);

  const fetchSeasons = async () => {
    try {
      setLoading(true);
      const result = await gamificationApi.getSeasons(user!.id);
      if (result.success) {
        setSeasons(result.data);
      }
    } catch (error) {
      toast.error('Failed to load seasons');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await gamificationApi.createSeason({
        userId: user!.id,
        ...newSeason
      });
      if (result.success) {
        toast.success('Season created! ⏳');
        setShowCreateModal(false);
        setNewSeason({ name: '', description: '', startDate: '', endDate: '', sprintCycle: '' });
        fetchSeasons();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create season');
    }
  };

  const handleGenerateHighlights = async (seasonId: string) => {
    try {
      await gamificationApi.generateHighlights(seasonId);
      toast.success('Highlights generated! 🎬');
      fetchSeasons();
    } catch (error) {
      toast.error('Failed to generate highlights');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">⏳ Seasons</h1>
            <p className="text-gray-600">Sprint cycles with boosts and highlights</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            + New Season
          </button>
        </div>

        {seasons.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No seasons yet</h3>
            <p className="text-gray-600 mb-4">Create your first season to track sprint cycles!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Season
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {seasons.map((season) => {
              const startDate = new Date(season.startDate);
              const endDate = new Date(season.endDate);
              const now = new Date();
              const duration = endDate.getTime() - startDate.getTime();
              const elapsed = now.getTime() - startDate.getTime();
              const progress = Math.min(100, Math.max(0, (elapsed / duration) * 100));

              return (
                <motion.div
                  key={season._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">{season.name}</h2>
                      {season.description && (
                        <p className="text-gray-600 mb-3">{season.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`px-2 py-1 rounded-full font-medium ${
                          season.status === 'completed' ? 'bg-green-100 text-green-800' :
                          season.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {season.status}
                        </span>
                        <span className="text-gray-600">
                          {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
                        </span>
                        {season.sprintCycle && (
                          <span className="text-gray-600">Sprint: {season.sprintCycle}</span>
                        )}
                      </div>
                    </div>
                    {season.status === 'completed' && (
                      <button
                        onClick={() => handleGenerateHighlights(season._id)}
                        className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                      >
                        🎬 Generate Highlights
                      </button>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {season.status === 'active' && (
                    <div className="mb-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">Season Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Season Boosts */}
                  {season.seasonBoosts.enabled && (
                    <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <h3 className="font-semibold text-purple-900 mb-2">🚀 Season Boost Active</h3>
                      <div className="flex items-center gap-4 text-sm">
                        {season.seasonBoosts.boostType && (
                          <span className="text-purple-700">Type: {season.seasonBoosts.boostType}</span>
                        )}
                        {season.seasonBoosts.multiplier && (
                          <span className="text-purple-700 font-semibold">
                            {season.seasonBoosts.multiplier}x Multiplier
                          </span>
                        )}
                      </div>
                      {season.seasonBoosts.description && (
                        <p className="text-sm text-purple-600 mt-2">{season.seasonBoosts.description}</p>
                      )}
                    </div>
                  )}

                  {/* Highlights */}
                  {season.highlights.totalMomentumEarned > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {season.highlights.totalMomentumEarned.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Total Momentum</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {season.highlights.objectivesCompleted}
                        </div>
                        <div className="text-sm text-gray-600">Objectives Completed</div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {season.highlights.odysseysCompleted}
                        </div>
                        <div className="text-sm text-gray-600">Odysseys Completed</div>
                      </div>
                    </div>
                  )}

                  {/* Top Contributors */}
                  {season.highlights.topContributors.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">🏆 Top Contributors</h3>
                      <div className="space-y-2">
                        {season.highlights.topContributors.slice(0, 5).map((contributor, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : '🏅'}
                              </span>
                              <span className="font-medium">{contributor.name || `User ${contributor.userId}`}</span>
                            </div>
                            <span className="font-semibold text-purple-600">
                              {contributor.momentum.toLocaleString()} ⚡
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights Reel */}
                  {season.highlights.highlightsReel && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🎬</span>
                        <span className="font-semibold text-gray-900">Highlights Reel</span>
                      </div>
                      <p className="text-sm text-gray-700">Generated on {new Date(season.highlights.generatedAt!).toLocaleDateString()}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Create Season Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-2xl font-bold mb-4">Create Season</h2>
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      required
                      value={newSeason.name}
                      onChange={(e) => setNewSeason({ ...newSeason, name: e.target.value })}
                      placeholder="Q4 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newSeason.description}
                      onChange={(e) => setNewSeason({ ...newSeason, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      required
                      value={newSeason.startDate}
                      onChange={(e) => setNewSeason({ ...newSeason, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input
                      type="date"
                      required
                      value={newSeason.endDate}
                      onChange={(e) => setNewSeason({ ...newSeason, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Cycle (optional)</label>
                    <input
                      type="text"
                      value={newSeason.sprintCycle}
                      onChange={(e) => setNewSeason({ ...newSeason, sprintCycle: e.target.value })}
                      placeholder="2 weeks"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Seasons;

