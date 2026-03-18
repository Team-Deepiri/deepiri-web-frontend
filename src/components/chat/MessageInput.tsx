import React, { KeyboardEvent, ChangeEvent } from 'react';
import Button from '../Button';

export interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  loading = false,
  placeholder = 'Type a message',
}) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      onSend();
    }
  };

  const isSendDisabled = loading || !value.trim();

  return (
    <div className="flex flex-1 gap-2 items-center">
      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={loading}
        className="flex-1 bg-gray-200 text-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <Button
        type="button"
        onClick={onSend}
        disabled={isSendDisabled}
        loading={loading}
      >
        Send
      </Button>
    </div>
  );
};

export default MessageInput;
