import React, { useState, useRef, useEffect, FormEvent, ChangeEvent } from 'react';
import { externalApi } from '../api/externalApi';
import MessageInput from '../components/chat/MessageInput';
import '../styles/productivity.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AgentChat: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [stream, setStream] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  /* ONLY CHANGE: removed smooth scrolling */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  const send = async (e?: FormEvent<HTMLFormElement>): Promise<void> => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };

    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (stream) {
        const base = import.meta.env.VITE_CYREX_URL || 'http://localhost:8000';

        const res = await fetch(`${base}/agent/message/stream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: userMsg.content })
        });

        const reader = res.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let acc = '';

        setMessages((m) => [...m, { role: 'assistant', content: '' }]);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          acc += decoder.decode(value, { stream: true });

          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: 'assistant', content: acc };
            return copy;
          });
        }
      } else {
        const res = await externalApi.cyrexMessage(userMsg.content);

        const assistant: Message = {
          role: 'assistant',
          content: res?.data?.message || 'No response'
        };

        setMessages((m) => [...m, assistant]);
      }
    } catch {
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: 'Error contacting agent' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">

      <div className="chat-layout">

        <div className="chat-header">
          <h1>Agent Chat (Python)</h1>
        </div>

        <div className="chat-messages">

          {messages.length === 0 && (
            <div className="chat-placeholder">
              Ask the agent for an adventure plan...
            </div>
          )}

          {messages.map((m, idx) => (
            <div key={idx} className={`chat-row ${m.role}`}>

              {m.role === 'user' ? (
                <div className="chat-bubble-user">
                  {m.content}
                </div>
              ) : (
                <div className="chat-bubble-assistant">
                  {m.content}
                </div>
              )}

            </div>
          ))}

          {loading && (
            <div className="chat-row assistant">
              <div className="chat-bubble-assistant">
                Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />

        </div>

        <div className="chat-input-bar">

          <form onSubmit={send} className="chat-input-form">

            <MessageInput
              value={input}
              onChange={setInput}
              onSend={() => send()}
              loading={loading}
              placeholder="Type a message"
            />

            <label className="chat-stream-toggle">
              <input
                type="checkbox"
                checked={stream}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setStream(e.target.checked)
                }
              />
              Stream
            </label>

          </form>

        </div>

      </div>

    </div>
  );
};

export default AgentChat;