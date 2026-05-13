import React, { useCallback, useEffect, useRef, useState } from 'react';
import api from '../services/api';
import { createStompClient, publishChatMessage, subscribeToRequestChat } from '../services/chatClient';
import { MessageCircle, Send, X } from 'lucide-react';
import './RequestChat.css';

const formatTime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Chat for one service request. Real-time when status is ACCEPTED; read-only when COMPLETED.
 */
const RequestChat = ({ requestId, status, counterpartyName, userRole, onClose }) => {
  const readOnly = status === 'COMPLETED';
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [connected, setConnected] = useState(false);
  const clientRef = useRef(null);
  const subRef = useRef(null);
  const bottomRef = useRef(null);

  const isMine = useCallback(
    (msg) => {
      if (userRole === 'ROLE_WORKER') return msg.senderRole === 'WORKER';
      return msg.senderRole === 'USER';
    },
    [userRole]
  );

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/chat/requests/${requestId}/messages`);
      setMessages(Array.isArray(data) ? data : []);
    } catch (e) {
      const msg =
        e.response?.data?.message ||
        (typeof e.response?.data === 'string' ? e.response.data : null) ||
        'Could not load chat.';
      setError(msg);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (readOnly) return undefined;

    const client = createStompClient();
    clientRef.current = client;

    client.onConnect = () => {
      setConnected(true);
      subRef.current = subscribeToRequestChat(client, requestId, (msg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
      });
    };

    client.onDisconnect = () => setConnected(false);
    client.onStompError = (frame) => setError(frame.headers?.message || 'Chat connection error.');
    client.onWebSocketError = () => setError('WebSocket error — is the backend running?');

    client.activate();

    return () => {
      try {
        subRef.current?.unsubscribe();
      } catch {
        /* ignore */
      }
      subRef.current = null;
      clientRef.current = null;
      client.deactivate();
      setConnected(false);
    };
  }, [requestId, readOnly]);

  const send = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || readOnly) return;
    const client = clientRef.current;
    if (!client?.connected) return;
    try {
      publishChatMessage(client, requestId, text);
      setDraft('');
    } catch {
      setError('Failed to send message.');
    }
  };

  return (
    <div className="modal-overlay request-chat-overlay" onClick={onClose}>
      <div
        className="modal-content card gold-border request-chat-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="request-chat-title"
      >
        <button type="button" className="close-btn" onClick={onClose} aria-label="Close chat">
          <X size={24} />
        </button>

        <div className="request-chat-header">
          <MessageCircle className="gold-text" size={28} />
          <div>
            <h2 id="request-chat-title">
              Chat with <span className="gold-text">{counterpartyName}</span>
            </h2>
            <p className="modal-sub">
              {readOnly ? 'This job is completed — messages are read-only.' : 'Active job — messages sync in real time.'}
              {!readOnly && (
                <span className={`chat-status ${connected ? 'on' : 'off'}`}>
                  {connected ? ' Live' : ' Connecting…'}
                </span>
              )}
            </p>
          </div>
        </div>

        {error && <div className="chat-banner error">{error}</div>}
        {!readOnly && !connected && !loading && !error && (
          <div className="chat-banner">Connecting to chat…</div>
        )}

        <div className="request-chat-messages">
          {loading ? (
            <div className="loader-container inner">
              <div className="loader" />
            </div>
          ) : messages.length === 0 ? (
            <p className="muted chat-empty">No messages yet. Say hello and coordinate the visit.</p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble-wrap ${isMine(msg) ? 'mine' : 'theirs'}`}
              >
                <div className="chat-bubble">
                  <div className="chat-meta">
                    <strong>{msg.senderName}</strong>
                    <span>{formatTime(msg.sentAt)}</span>
                  </div>
                  <p>{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {readOnly ? (
          <p className="chat-readonly-note muted">Chat closed — this service request is completed.</p>
        ) : (
          <form className="request-chat-form" onSubmit={send}>
            <input
              type="text"
              placeholder={connected ? 'Type a message…' : 'Waiting for connection…'}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={2000}
              disabled={!connected}
            />
            <button type="submit" className="gold-btn chat-send" disabled={!connected || !draft.trim()}>
              <Send size={18} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestChat;
