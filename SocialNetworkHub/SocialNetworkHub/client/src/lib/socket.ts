import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

type SocketStatus = 'connecting' | 'open' | 'closed' | 'error';

interface SocketMessage {
  type: string;
  payload: any;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [status, setStatus] = useState<SocketStatus>('closed');
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const { user } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);

    socketRef.current = ws;
    setStatus('connecting');
    setSocket(ws);

    ws.onopen = () => {
      setStatus('open');
      console.log('WebSocket connection established');
      
      // Authenticate if user is logged in
      if (user) {
        sendAuthMessage(user.id);
      }
    };

    ws.onclose = () => {
      setStatus('closed');
      console.log('WebSocket connection closed');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setStatus('error');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setLastMessage(message);
        console.log('WebSocket message received:', message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, []);
  
  // Send authentication message when user logs in
  useEffect(() => {
    if (status === 'open' && user) {
      sendAuthMessage(user.id);
    }
  }, [user, status]);
  
  // Helper function to send auth message
  const sendAuthMessage = (userId: number) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ 
        type: 'auth', 
        payload: { userId } 
      }));
    }
  };

  const sendMessage = useCallback((type: string, payload: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, payload }));
      return true;
    }
    return false;
  }, []);
  
  // Helper functions for common socket operations
  const joinChallenge = useCallback((challengeId: number) => {
    sendMessage('join_challenge', { challengeId });
  }, [sendMessage]);
  
  const leaveChallenge = useCallback((challengeId: number) => {
    sendMessage('leave_challenge', { challengeId });
  }, [sendMessage]);
  
  const sendTypingUpdate = useCallback((challengeId: number, isTyping: boolean) => {
    sendMessage('typing_update', { challengeId, isTyping });
  }, [sendMessage]);

  return { 
    socket, 
    status, 
    lastMessage, 
    sendMessage,
    joinChallenge,
    leaveChallenge,
    sendTypingUpdate
  };
};
