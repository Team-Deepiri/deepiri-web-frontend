import React from 'react';
import { useParams } from 'react-router-dom';

const GroupChatView: React.FC = () => {
  const { groupChatId } = useParams<{ groupChatId: string }>();

  return (
    <div className="group-chats-page">
      <h1>Group Chat View</h1>
      <p>Chat ID: {groupChatId}</p>
    </div>
  );
};

export default GroupChatView;
