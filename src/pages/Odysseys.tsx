import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi, Odyssey, Objective } from '../api/gamificationApi';
import toast from 'react-hot-toast';

const Odysseys: React.FC = () => {
  const { user } = useAuth();
  const [odysseys, setOdysseys] = useState<Odyssey[]>([]);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOdyssey, setSelectedOdyssey] = useState<Odyssey | null>(null);
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [newOdyssey, setNewOdyssey] = useState({
    title: '',
    description: '',
    scale: 'week' as 'hours' | 'day' | 'week' | 'month' | 'custom',
    minimumHoursBeforeSelection: 0
  });
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    momentumReward: 20
  });

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [odysseysResult, objectivesResult] = await Promise.all([
        gamificationApi.getOdysseys(user!.id),
        gamificationApi.getObjectives(user!.id)
      ]);
      if (odysseysResult.success) setOdysseys(odysseysResult.data);
      if (objectivesResult.success) setObjectives(objectivesResult.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await gamificationApi.createOdyssey({
        userId: user!.id,
        ...newOdyssey
      });
      if (result.success) {
        toast.success('Odyssey created! 🏰');
        setShowCreateModal(false);
        setNewOdyssey({ title: '', description: '', scale: 'week', minimumHoursBeforeSelection: 0 });
        fetchData();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create odyssey');
    }
  };

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOdyssey) return;
    try {
      await gamificationApi.addMilestone(
        selectedOdyssey._id,
        newMilestone.title,
        newMilestone.description,
        newMilestone.momentumReward
      );
      toast.success('Milestone added! 🎯');
      setShowMilestoneModal(false);
      setNewMilestone({ title: '', description: '', momentumReward: 20 });
      fetchData();
    } catch (error: any) {
      toast.error('Failed to add milestone');
    }
  };

  const handleCompleteMilestone = async (odysseyId: string, milestoneId: string) => {
    try {
      await gamificationApi.completeMilestone(odysseyId, milestoneId);
      toast.success('Milestone completed! 🎉');
      fetchData();
    } catch (error) {
      toast.error('Failed to complete milestone');
    }
  };

  const handleAddObjective = async (odysseyId: string, objectiveId: string) => {
    try {
      await gamificationApi.addObjectiveToOdyssey(odysseyId, objectiveId);
      toast.success('Objective added to odyssey!');
      fetchData();
    } catch (error) {
      toast.error('Failed to add objective');
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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🏰 Odysseys</h1>
            <p className="text-gray-600">Multi-task project workflows with milestones</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            + New Odyssey
          </button>
        </div>

        {odysseys.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🏰</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No odysseys yet</h3>
            <p className="text-gray-600 mb-4">Create your first odyssey to start your journey!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Odyssey
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {odysseys.map((odyssey) => (
              <motion.div
                key={odyssey._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{odyssey.title}</h2>
                    {odyssey.description && (
                      <p className="text-gray-600 mb-3">{odyssey.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full font-medium ${
                        odyssey.status === 'completed' ? 'bg-green-100 text-green-800' :
                        odyssey.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {odyssey.status}
                      </span>
                      <span className="text-gray-600">Scale: {odyssey.scale}</span>
                      <span className="text-gray-600">
                        {new Date(odyssey.startDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOdyssey(odyssey);
                      setShowMilestoneModal(true);
                    }}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium"
                  >
                    + Milestone
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span>{odyssey.progress.progressPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all"
                      style={{ width: `${odyssey.progress.progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>Objectives: {odyssey.progress.objectivesCompleted}/{odyssey.progress.totalObjectives}</span>
                    <span>Milestones: {odyssey.progress.milestonesCompleted}/{odyssey.progress.totalMilestones}</span>
                  </div>
                </div>

                {/* Milestones */}
                {odyssey.milestones.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Milestones</h3>
                    <div className="space-y-2">
                      {odyssey.milestones.map((milestone) => (
                        <div
                          key={milestone.id}
                          className={`p-3 rounded-lg border ${
                            milestone.completed
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={milestone.completed}
                                  onChange={() => !milestone.completed && handleCompleteMilestone(odyssey._id, milestone.id)}
                                  className="rounded"
                                />
                                <span className={`font-medium ${milestone.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {milestone.title}
                                </span>
                              </div>
                              {milestone.description && (
                                <p className="text-sm text-gray-600 ml-6">{milestone.description}</p>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-purple-600">
                              +{milestone.momentumReward} ⚡
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Objectives */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Linked Objectives ({odyssey.objectives.length})</h3>
                  {odyssey.objectives.length === 0 && (
                    <p className="text-sm text-gray-600">No objectives linked yet</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Odyssey Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-2xl font-bold mb-4">Create Odyssey</h2>
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newOdyssey.title}
                      onChange={(e) => setNewOdyssey({ ...newOdyssey, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newOdyssey.description}
                      onChange={(e) => setNewOdyssey({ ...newOdyssey, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Scale</label>
                    <select
                      value={newOdyssey.scale}
                      onChange={(e) => setNewOdyssey({ ...newOdyssey, scale: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="hours">Hours</option>
                      <option value="day">Day</option>
                      <option value="week">Week</option>
                      <option value="month">Month</option>
                      <option value="custom">Custom</option>
                    </select>
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

        {/* Add Milestone Modal */}
        {showMilestoneModal && selectedOdyssey && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-2xl font-bold mb-4">Add Milestone</h2>
              <form onSubmit={handleAddMilestone}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Momentum Reward</label>
                    <input
                      type="number"
                      min="1"
                      value={newMilestone.momentumReward}
                      onChange={(e) => setNewMilestone({ ...newMilestone, momentumReward: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                  >
                    Add Milestone
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowMilestoneModal(false);
                      setSelectedOdyssey(null);
                    }}
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

export default Odysseys;

