import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useAdventure } from '../contexts/AdventureContext';
import { eventApi } from '../api/eventApi';
import { externalApi } from '../api/externalApi';
import toast from 'react-hot-toast';

interface Event {
  _id?: string;
  id?: string;
  name?: string;
  description?: string;
  type?: string;
  location?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  startTime?: string;
  endTime?: string;
  maxParticipants?: number;
  participants?: string[];
  [key: string]: any;
}

const Events: React.FC = () => {
  const { user } = useAuth();
  const { userLocation } = useAdventure();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('upcoming');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Load both user-created events and external events
      const [userEventsResponse, externalEventsResponse] = await Promise.all([
        eventApi.getUserEvents(),
        userLocation ? externalApi.getNearbyEvents(userLocation, 10000) : Promise.resolve({ success: false, data: [] })
      ]);

      let allEvents: Event[] = [];

      if (userEventsResponse.success || userEventsResponse.data) {
        allEvents = [...allEvents, ...(userEventsResponse.data || [])];
      }

      if (externalEventsResponse.success || externalEventsResponse.data) {
        allEvents = [...allEvents, ...(externalEventsResponse.data || [])];
      }

      setEvents(allEvents);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (eventId: string): Promise<void> => {
    try {
      const response = await eventApi.rsvpToEvent(eventId);
      if (response.success) {
        toast.success('RSVP successful!');
        loadEvents(); // Reload events to update RSVP status
      } else {
        toast.error(response.message || 'Failed to RSVP');
      }
    } catch (error) {
      console.error('RSVP error:', error);
      toast.error('Failed to RSVP to event');
    }
  };

  const handleCancelRsvp = async (eventId: string): Promise<void> => {
    try {
      const response = await eventApi.cancelRsvp(eventId);
      if (response.success) {
        toast.success('RSVP canceled');
        loadEvents(); // Reload events to update RSVP status
      } else {
        toast.error(response.message || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Cancel RSVP error:', error);
      toast.error('Failed to cancel RSVP');
    }
  };

  const getEventIcon = (type?: string): string => {
    switch (type) {
      case 'bar': return '🍺';
      case 'pop-up': return '🎪';
      case 'concert': return '🎵';
      case 'street-fair': return '🎡';
      case 'meetup': return '👥';
      case 'user-hosted': return '🎉';
      default: return '📅';
    }
  };

  const getEventTypeColor = (type?: string): string => {
    switch (type) {
      case 'bar': return 'bg-blue-100 text-blue-800';
      case 'pop-up': return 'bg-purple-100 text-purple-800';
      case 'concert': return 'bg-pink-100 text-pink-800';
      case 'street-fair': return 'bg-yellow-100 text-yellow-800';
      case 'meetup': return 'bg-green-100 text-green-800';
      case 'user-hosted': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEvents = events
    .filter(event => {
      if (filter !== 'all' && event.type !== filter) return false;
      if (searchTerm && !event.name?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'upcoming':
          const dateA = a.startTime ? new Date(a.startTime).getTime() : 0;
          const dateB = b.startTime ? new Date(b.startTime).getTime() : 0;
          return dateA - dateB;
        case 'popular':
          return (b.participants?.length || 0) - (a.participants?.length || 0);
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });

  const getEventStats = () => {
    const total = events.length;
    const upcoming = events.filter(e => e.startTime && new Date(e.startTime) > new Date()).length;
    const userHosted = events.filter(e => e.type === 'user-hosted').length;
    const totalParticipants = events.reduce((sum, e) => sum + (e.participants?.length || 0), 0);
    
    return { total, upcoming, userHosted, totalParticipants };
  };

  const stats = getEventStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Events & Meetups 📅
              </h1>
              <p className="text-gray-600 mt-2">
                Discover local events and create your own meetups
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
            >
              Create Event
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">{stats.upcoming}</div>
              <div className="text-sm text-gray-600">Upcoming</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-green-600">{stats.userHosted}</div>
              <div className="text-sm text-gray-600">User Hosted</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.totalParticipants}</div>
              <div className="text-sm text-gray-600">Total Participants</div>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
              <select
                value={filter}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="bar">Bars</option>
                <option value="pop-up">Pop-ups</option>
                <option value="concert">Concerts</option>
                <option value="street-fair">Street Fairs</option>
                <option value="meetup">Meetups</option>
                <option value="user-hosted">User Hosted</option>
              </select>

              <select
                value={sortBy}
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="upcoming">Upcoming First</option>
                <option value="popular">Most Popular</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event, index) => (
              <motion.div
                key={event._id || event.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{getEventIcon(event.type)}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.name}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                          {event.type?.replace('-', ' ') || 'event'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">📍</span>
                      <span className="truncate">{event.location?.address || 'Location TBD'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="mr-2">🕐</span>
                      <span>
                        {event.startTime ? (
                          <>
                            {new Date(event.startTime).toLocaleDateString()} at{' '}
                            {new Date(event.startTime).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </>
                        ) : 'Time TBD'}
                      </span>
                    </div>
                    {event.maxParticipants && (
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="mr-2">👥</span>
                        <span>
                          {event.participants?.length || 0} / {event.maxParticipants} participants
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <Link
                      to={`/events/${event._id || event.id}`}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                    >
                      View Details
                    </Link>

                    {event.participants?.includes(user?.id || '') ? (
                      <button
                        onClick={() => handleCancelRsvp(event._id || event.id || '')}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Cancel RSVP
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRsvp(event._id || event.id || '')}
                        disabled={event.maxParticipants ? (event.participants?.length || 0) >= event.maxParticipants : false}
                        className={`px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${
                          event.maxParticipants && (event.participants?.length || 0) >= event.maxParticipants
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {event.maxParticipants && (event.participants?.length || 0) >= event.maxParticipants
                          ? 'Full'
                          : 'RSVP'
                        }
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full bg-white rounded-xl shadow-lg p-12 text-center"
            >
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No events found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Be the first to create an event!'
                }
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Create Event
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Create Event Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Create New Event 🎉
              </h3>
              <p className="text-gray-600 mb-6">
                This feature is coming soon! For now, you can create events through the adventure generator.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                >
                  Close
                </button>
                <Link
                  to="/adventure/generate"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center"
                >
                  Generate Adventure
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;

