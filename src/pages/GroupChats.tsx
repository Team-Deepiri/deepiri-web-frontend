import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/chat.css';
import GroupChatItem from '../components/chat/GroupChatItem';
import { getGroupChats } from '../api/groupChatApi';
import type { GroupChat } from '../types/chat';

// TODO: remove mock data when API is available
const MOCK_CHATS: GroupChat[] = [
  { groupChatId: 'mock-engineering', name: 'Engineering Team', agentCount: 5 },
  { groupChatId: 'mock-marketing', name: 'Marketing Ops', agentCount: 3 },
  { groupChatId: 'mock-product', name: 'Product Squad', agentCount: 8 },
];

const GroupChats: React.FC = () => {
  const navigate = useNavigate();
  const [groupChats, setGroupChats] = useState<GroupChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getGroupChats()
      .then((chats) => {
        if (!cancelled) setGroupChats(chats);
      })
      .catch(() => {
        if (!cancelled) setError('Unable to load group chats. Please ensure the chat service is running.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const chatsToShow =
    groupChats.length > 0
      ? groupChats
      : (!error ? MOCK_CHATS : []);

  return (
    <div className="group-chats-container">
      <div className="group-chats-header">
        <h1>Group Chats</h1>
        <p className="group-chats-subtitle">Manage and access your group conversations</p>
      </div>

      <div className="group-chats-card">
        {error && (
          <div className="group-chats-error">{error}</div>
        )}
        {loading ? (
          <div className="group-chats-loading">Loading...</div>
        ) : (
          chatsToShow.length === 0 ? (
            <div className="group-chats-empty">
              <span className="group-chats-empty-icon">💬</span>
              <h3 className="group-chats-empty-title">No group chats yet</h3>
              <p className="group-chats-empty-subtitle">Once chats are created, they will appear here.</p>
              <button type="button" className="group-chats-empty-cta">
                Create Group Chat
              </button>
            </div>
          ) : (
            <div className="group-chats-list">
              {chatsToShow.map((chat) => (
                <GroupChatItem
                  key={chat.groupChatId}
                  chat={chat}
                  onClick={(c) => navigate(`/group-chats/${c.groupChatId}`)}
                />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default GroupChats;
