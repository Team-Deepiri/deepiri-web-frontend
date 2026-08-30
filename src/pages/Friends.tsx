import React, { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { userApi } from '../api/userApi';
import toast from 'react-hot-toast';
/// <reference path="../types/react-hot-toast.d.ts" />

interface User {
  _id: string;
  name?: string;
  email?: string;
  adventureCount?: number;
  points?: number;
  createdAt?: string;
  [key: string]: any;
}

const Friends: React.FC = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddFriend, setShowAddFriend] = useState<boolean>(false);

  useEffect(() => {
    loadFriendsData();
  }, []);

  const loadFriendsData = async (): Promise<void> => {
    try {
      setLoading(true);
      
      const [friendsResponse, usersResponse] = await Promise.all([
        userApi.getFriends(),
        userApi.searchUsers('', 100)
      ]);

      if (friendsResponse.success || friendsResponse.data) {
        setFriends(friendsResponse.data || []);
      }

      if (usersResponse.success || usersResponse.data) {
        // Filter out current user and existing friends
        const friendIds = (friendsResponse.data || []).map((f: User) => f._id);
        const filteredUsers = (usersResponse.data || []).filter((u: User) => 
          u._id !== user?.id && !friendIds.includes(u._id)
        );
        setAllUsers(filteredUsers);
      }

    } catch (error) {
      console.error('Failed to load friends data:', error);
      toast.error('Failed to load friends data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddFriend = async (friendId: string): Promise<void> => {
    try {
      const response = await userApi.addFriend(friendId);
      if (response.success) {
        toast.success('Friend added successfully!');
        loadFriendsData(); // Reload data
      } else {
        toast.error(response.message || 'Failed to add friend');
      }
    } catch (error) {
      console.error('Failed to add friend:', error);
      toast.error('Failed to add friend');
    }
  };

  const handleRemoveFriend = async (friendId: string): Promise<void> => {
    try {
      const response = await userApi.removeFriend(friendId);
      if (response.success) {
        toast.success('Friend removed');
        loadFriendsData(); // Reload data
      } else {
        toast.error(response.message || 'Failed to remove friend');
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  const filteredUsers = allUsers.filter(userItem =>
    userItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    userItem.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container px-3 py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6 pb-4">
            <div>
              <h1
                style={{
                  fontSize: '4rem',
                  fontWeight: 'bold',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  margin: 0,
                  paddingBottom: '1rem'
                }}
              >
                Friends & Connections
              </h1>
              <motion.p className="text-lg text-black" initial={{y:-10}}>Connect with friends and discover new adventure companions</motion.p>
            </div>
            <button
              onClick={() => setShowAddFriend(!showAddFriend)}
              className="px-6 py-3 btn-modern btn-primary"
            >
              {showAddFriend ? 'Hide Add Friend' : 'Add Friend'}
            </button>
          </div>

          {/* Stats */}
          <div className="row gap-4 mb-6 pb-4">
            <div className="card-modern text-center rounded-lg p-4 shadow-sm col">
              <div className="text-2xl font-bold text-black">{friends.length}</div>
              <div className="text-sm text-black">Friends</div>
            </div>
            <div className="card-modern text-center rounded-lg p-4 shadow-sm col">
              <div className="text-2xl font-bold text-black">{allUsers.length}</div>
              <div className="text-sm text-black">Available Users</div>
            </div>
            <div className="card-modern text-center rounded-lg p-4 shadow-sm col">
              <div className="text-2xl font-bold text-black">0</div>
              <div className="text-sm text-black">Pending Requests</div>
            </div>
          </div>
        </motion.div>

        {/* Add Friend Section */}
        {showAddFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card-modern bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Add New Friends
            </h2>
            
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  style={{
                    width: '40%',
                    padding: '0.75rem 1rem',
                    background: '#ffffff',
                    border: '1px solid #d0d0d6',
                    borderRadius: '0.5rem',
                    color: 'black',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                />
              </div>
            </div>

            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((userItem) => (
                  <div
                    key={userItem._id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {userItem.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{userItem.name || 'User'}</h3>
                        <p className="text-sm text-gray-600">{userItem.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAddFriend(userItem._id)}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Add Friend
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No users found
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'All available users are already your friends!'}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Friends List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="card-modern bg-white rounded-xl shadow-lg p-6 pb-4 pt-4"
        >
          <h2 className="text-2xl font-bold text-black mb-6">
            Your Friends
          </h2>

          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {friends.map((friend) => (
                <motion.div
                  key={friend._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-xl">
                        {friend.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{friend.name || 'User'}</h3>
                      <p className="text-sm text-gray-600">{friend.email}</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-center justify-between text-sm">
                      <span className="text-black">Adventures:</span>
                      <span className="font-medium">{friend.adventureCount || 0}</span>
                    </div>
                    <div className="flex items-center text-center justify-between text-sm">
                      <span className="text-black">Points:</span>
                      <span className="font-medium">{friend.points || 0}</span>
                    </div>
                    <div className="flex items-center text-center justify-between text-sm">
                      <span className="text-black">Member since:</span>
                      <span className="font-medium">
                        {friend.createdAt ? new Date(friend.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        // Navigate to friend's profile or start a shared adventure
                        toast('Feature coming soon!');
                      }}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => handleRemoveFriend(friend._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No friends yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start building your adventure network by adding friends!
              </p>
              <button
                onClick={() => setShowAddFriend(true)}
                className="px-6 py-3 btn-modern btn-primary"
              >
                Add Your First Friend
              </button>
            </div>
          )}
        </motion.div>

        {/* Friend Activity (Coming Soon) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1}}
          transition={{ delay: 0.4 }}
          className="card-modern bg-white rounded-xl shadow-lg p-6 mt-8"
        >
          <h2 className="text-2xl font-bold text-black mb-6">
            Friend Activity
          </h2>
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-black mb-2">
              Coming Soon
            </h3>
            <p className="text-black">
              Track your friends' adventures and see what they're up to!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Friends;

