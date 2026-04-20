import React from 'react';
import type { GroupChat } from '../../types/chat';

interface GroupChatItemProps {
  chat: GroupChat;
  onClick: (chat: GroupChat) => void;
}

const GroupChatItem: React.FC<GroupChatItemProps> = ({ chat, onClick }) => {
  const initial = chat.name ? chat.name.charAt(0).toUpperCase() : '?';

  return (
    <div
      className="group-chat-item"
      onClick={() => onClick(chat)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick(chat)}
    >
      <div className="group-chat-avatar">{initial}</div>
      <div className="group-chat-content">
        <div className="group-chat-name">{chat.name}</div>
        <div className="group-chat-meta">{chat.agentCount} agents</div>
      </div>
      <div className="group-chat-chevron">›</div>
    </div>
  );
};

export default GroupChatItem;