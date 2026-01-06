import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface Notification {
  _id: string;
  title?: string;
  message?: string;
  type?: string;
  read?: boolean;
  sentAt?: string;
  actionUrl?: string;
  [key: string]: any;
}

// Hardcoded notifications for demo
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    _id: '1',
    title: 'New Adventure Available!',
    message: 'A new adventure "Mountain Peak Challenge" has been added to your area. Check it out now!',
    type: 'adventure_step',
    read: false,
    sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    title: 'Event Starting Soon',
    message: 'The "City Explorer Challenge" event starts in 3 hours. Don\'t miss out!',
    type: 'event_update',
    read: false,
    sentAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    title: 'Friend Request',
    message: 'Sarah Johnson wants to connect with you and share adventures together.',
    type: 'friend_request',
    read: false,
    sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    title: 'Achievement Unlocked! 🎉',
    message: 'Congratulations! You\'ve earned the "Explorer Badge" for completing 10 adventures.',
    type: 'achievement',
    read: true,
    sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '5',
    title: 'New Comment on Your Adventure',
    message: 'Mike Chen commented on your "Sunset Trail" adventure post.',
    type: 'social',
    read: true,
    sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '6',
    title: 'System Maintenance',
    message: 'Scheduled maintenance will occur tonight from 2 AM - 4 AM EST. Some features may be unavailable.',
    type: 'system',
    read: true,
    sentAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },

];
 
const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const handleMarkAsRead = (notificationId: string): void => {
    setNotifications(prev => 
      prev.map(notif => 
        notif._id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  const handleMarkAllAsRead = (): void => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getNotificationIcon = (type?: string): string => {
    switch (type) {
      case 'adventure_step': return '🗺️';
      case 'event_update': return '📅';
      case 'social': return '👥';
      case 'system': return '🔔';
      case 'achievement': return '🏆';
      case 'friend_request': return '👤';
      default: return '📢';
    }
  };

  
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'read') return notification.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent">
       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                Notifications 🔔
              </h1>
              <p className="text-gray-400 mt-2">
                Stay updated with your adventure activities
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="btn-modern btn-primary mb-3"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {/* Stats & Filters Combined */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '1rem',
                marginBottom: '1.5rem',
                width: '100%'
              }}>
                <button
                  onClick={() => setFilter('all')}
                  className={`card-modern rounded-lg p-4 shadow-sm text-center cursor-pointer ${
                    filter === 'all'
                      ? 'opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className="text-white">{notifications.length}</div>
                  <div className="text-sm text-white">Total</div>
                </button>
                
                <button
                  onClick={() => setFilter('unread')}
                  className={`card-modern rounded-lg p-4 shadow-sm text-center cursor-pointer ${
                    filter === 'unread'
                      ? 'opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className="text-white">{unreadCount}</div>
                  <div className="text-sm text-white">Unread</div>
                </button>
                
                <button
                  onClick={() => setFilter('read')}
                  className={`card-modern rounded-lg p-4 shadow-sm text-center cursor-pointer ${
                    filter === 'read'
                      ? 'opacity-100'
                      : 'opacity-50 hover:opacity-75'
                  }`}
                >
                  <div className="text-white">{notifications.length - unreadCount}</div>
                  <div className="text-sm text-white">Read</div>
                </button>
              </div>
            </motion.div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem'}}
        >
          {filteredNotifications.length > 0 ? (
            
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`card-modern rounded-xl shadow-lg p-6 ${
                  !notification.read ? 'border-l-4 border-blue-500' : ''
                } hover:shadow-xl transition-shadow duration-200`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                      !notification.read ? 'bg-blue-900/50' : 'bg-gray-800/50'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {notification.title || 'Notification'}
                          </h3>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-gray-300 mb-3">
                          {notification.message}
                        </p>
                        <p className="text-sm text-gray-500">
                          {notification.sentAt ? new Date(notification.sentAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="btn-modern btn-primary"
                          >
                            Mark as Read
                          </button>
                        )}
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="btn-modern btn-primary"
                          >
                            View
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
            
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-modern rounded-xl shadow-lg p-12 text-center"
            >
              <div className="text-6xl mb-4">🔔</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                No notifications found
              </h3>
              <p className="text-gray-400">
                {filter === 'unread' 
                  ? 'You have no unread notifications'
                  : filter === 'read'
                  ? 'You have no read notifications'
                  : 'You have no notifications yet'
                }
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Notification Settings (Coming Soon) */}
        <motion.div
        key={filter}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0}}
          transition={{ delay: 0.6 }}
          className="card-modern rounded-xl shadow-lg mt-3 mb-3 "
        >
          <h2 className="text-xl font-bold text-white mb-4">
            Notification Settings ⚙️
          </h2>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-400">
              Customize your notification preferences and delivery methods.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Notifications;