import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { gamificationApi, Objective } from '../api/gamificationApi';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const Objectives: React.FC = () => {
  const { user } = useAuth();
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'draft' | 'active' | 'completed'>('all');
  const [newObjective, setNewObjective] = useState({
    title: '',
    description: '',
    momentumReward: 10,
    deadline: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchObjectives();
    }
  }, [user, filter]);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const status = filter === 'all' ? undefined : filter;
      const result = await gamificationApi.getObjectives(user!.id, status);
      if (result.success) {
        setObjectives(result.data);
      }
    } catch (error: any) {
      toast.error('Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await gamificationApi.createObjective({
        userId: user!.id,
        ...newObjective,
        deadline: newObjective.deadline ? new Date(newObjective.deadline).toISOString() : undefined
      });
      if (result.success) {
        toast.success('Objective created! 🎯');
        setShowCreateModal(false);
        setNewObjective({ title: '', description: '', momentumReward: 10, deadline: '' });
        fetchObjectives();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create objective');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const result = await gamificationApi.completeObjective(id, false);
      if (result.success) {
        toast.success('Objective completed! 🎉');
        fetchObjectives();
      }
    } catch (error: any) {
      toast.error('Failed to complete objective');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this objective?')) return;
    try {
      await gamificationApi.deleteObjective(id);
      toast.success('Objective deleted');
      fetchObjectives();
    } catch (error: any) {
      toast.error('Failed to delete objective');
    }
  };

  const filteredObjectives = objectives;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">🗡️ Objectives</h1>
            <p className="text-gray-600">Your tasks with momentum rewards</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            + New Objective
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'draft', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-purple-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Objectives List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredObjectives.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">🗡️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No objectives yet</h3>
            <p className="text-gray-600 mb-4">Create your first objective to start earning momentum!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Create Objective
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredObjectives.map((objective) => (
              <motion.div
                key={objective._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{objective.title}</h3>
                    {objective.description && (
                      <p className="text-sm text-gray-600 mb-3">{objective.description}</p>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      objective.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : objective.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {objective.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Momentum Reward:</span>
                    <span className="font-semibold text-purple-600">+{objective.momentumReward} ⚡</span>
                  </div>
                  {objective.deadline && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Deadline:</span>
                      <span className="font-medium">
                        {new Date(objective.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {objective.completionData && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Earned:</span>
                      <span className="font-semibold text-green-600">
                        {objective.completionData.momentumEarned} ⚡
                      </span>
                    </div>
                  )}
                </div>

                {objective.subtasks && objective.subtasks.length > 0 && (
                  <div className="mb-4">
                    <div className="text-xs font-semibold text-gray-600 mb-2">Subtasks:</div>
                    <div className="space-y-1">
                      {objective.subtasks.map((subtask, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={subtask.completed}
                            readOnly
                            className="rounded"
                          />
                          <span className={subtask.completed ? 'line-through text-gray-400' : 'text-gray-700'}>
                            {subtask.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  {objective.status !== 'completed' && (
                    <button
                      onClick={() => handleComplete(objective._id)}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                      Complete
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(objective._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <h2 className="text-2xl font-bold mb-4">Create Objective</h2>
              <form onSubmit={handleCreate}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={newObjective.title}
                      onChange={(e) => setNewObjective({ ...newObjective, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={newObjective.description}
                      onChange={(e) => setNewObjective({ ...newObjective, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Momentum Reward</label>
                    <input
                      type="number"
                      min="1"
                      value={newObjective.momentumReward}
                      onChange={(e) => setNewObjective({ ...newObjective, momentumReward: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (optional)</label>
                    <input
                      type="datetime-local"
                      value={newObjective.deadline}
                      onChange={(e) => setNewObjective({ ...newObjective, deadline: e.target.value })}
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

export default Objectives;

