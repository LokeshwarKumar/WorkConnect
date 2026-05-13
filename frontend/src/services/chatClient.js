import { Client } from '@stomp/stompjs';
import { API_ORIGIN } from '../config/apiOrigin';

function stompBrokerUrl() {
  const u = new URL(API_ORIGIN);
  const wsProto = u.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${wsProto}//${u.host}/ws`;
}

/**
 * @returns {import('@stomp/stompjs').Client}
 */
export function createStompClient() {
  const token = localStorage.getItem('token');
  const client = new Client({
    brokerURL: stompBrokerUrl(),
    connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    reconnectDelay: 4000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  });
  return client;
}

export function subscribeToRequestChat(client, requestId, onMessage) {
  return client.subscribe(`/topic/chat/${requestId}`, (frame) => {
    try {
      const data = JSON.parse(frame.body);
      onMessage(data);
    } catch {
      /* ignore */
    }
  });
}

export function publishChatMessage(client, requestId, content) {
  client.publish({
    destination: `/app/chat.request/${requestId}`,
    body: JSON.stringify({ content }),
  });
}
