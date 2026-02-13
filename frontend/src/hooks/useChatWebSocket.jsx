import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getToken } from '@/lib/api';

/**
 * WebSocket hook for real-time chat
 */
export function useChatWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const wsRef = useRef(null);
  const queryClient = useQueryClient();
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const token = getToken();
    if (!token) {
      console.log('[WebSocket] No token found, skipping connection');
      return;
    }

    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Create WebSocket connection
    const wsUrl = `ws://localhost:8000/ws/chat/?token=${token}`;
    console.log('[WebSocket] Connecting to:', wsUrl);
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Connected - Real-time messaging enabled');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Message received:', data);
        
        setLastMessage(data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error);
      }
    };

    ws.onerror = (error) => {
      console.warn('[WebSocket] Connection failed - Chat will work without real-time updates. Install daphne and channels for real-time messaging.');
    };

    ws.onclose = (event) => {
      console.log('[WebSocket] Disconnected:', event.code);
      setIsConnected(false);
      wsRef.current = null;

      // Don't attempt to reconnect if server doesn't support WebSocket
      if (event.code === 1006) {
        console.log('[WebSocket] Server does not support WebSocket. Chat will work in polling mode (refresh to see new messages).');
        return;
      }

      // Attempt to reconnect for other errors
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
        console.log(`[WebSocket] Reconnecting in ${delay}ms...`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, delay);
      }
    };
  }, [queryClient]);

  const handleWebSocketMessage = useCallback((data) => {
    const { type } = data;

    switch (type) {
      case 'new_message':
        // Invalidate messages and conversations queries
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['unread-count'] });
        break;

      case 'message_sent':
        // Message was successfully sent
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        break;

      case 'typing':
        // Handle typing indicator
        // You can use this to show "User is typing..." indicator
        break;

      case 'messages_read':
        // Messages were read by the other user
        queryClient.invalidateQueries({ queryKey: ['messages'] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        break;

      case 'user_status':
        // User online/offline status changed
        queryClient.invalidateQueries({ queryKey: ['user-status'] });
        break;

      case 'error':
        console.error('[WebSocket] Server error:', data.message);
        break;

      default:
        console.log('[WebSocket] Unknown message type:', type);
    }
  }, [queryClient]);

  const sendMessage = useCallback((conversationId, content) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat_message',
        conversation_id: conversationId,
        content: content,
      }));
      return true;
    }
    console.error('[WebSocket] Cannot send message: not connected');
    return false;
  }, []);

  const sendTypingIndicator = useCallback((conversationId, isTyping) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        conversation_id: conversationId,
        is_typing: isTyping,
      }));
    }
  }, []);

  const markMessagesRead = useCallback((conversationId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'mark_read',
        conversation_id: conversationId,
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  // Connect on mount, disconnect on unmount
  // Disabled: WebSocket requires daphne and channels packages
  // useEffect(() => {
  //   connect();
  //   return () => disconnect();
  // }, [connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    sendTypingIndicator,
    markMessagesRead,
    reconnect: connect,
  };
}
