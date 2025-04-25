import { WebSocketServer, WebSocket } from 'ws';
import { IStorage } from './storage';

type ClientMetadata = {
  userId?: number;
  connectedAt: Date;
  lastActivity: Date;
  challenges: Set<number>;
};

export function setupSocketHandlers(wss: WebSocketServer, storage: IStorage) {
  const clients = new Map<WebSocket, ClientMetadata>();

  wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    // Initialize client metadata
    clients.set(ws, {
      connectedAt: new Date(),
      lastActivity: new Date(),
      challenges: new Set()
    });

    // Handle messages from client
    ws.on('message', async (message) => {
      const metadata = clients.get(ws);
      if (!metadata) return;
      
      metadata.lastActivity = new Date();
      
      try {
        const data = JSON.parse(message.toString());
        
        switch(data.type) {
          case 'auth':
            if (data.payload?.userId) {
              metadata.userId = data.payload.userId;
              console.log(`WS client authenticated as user ${metadata.userId}`);
            }
            break;
            
          case 'join_challenge':
            if (data.payload?.challengeId) {
              const challengeId = data.payload.challengeId;
              metadata.challenges.add(challengeId);
              console.log(`User ${metadata.userId || 'anonymous'} joined challenge ${challengeId}`);
              
              // Send current submission count
              const submissions = await storage.getSubmissionsByChallenge(challengeId);
              ws.send(JSON.stringify({
                type: 'challenge_stats',
                payload: {
                  challengeId,
                  submissionCount: submissions.length
                }
              }));
            }
            break;
            
          case 'leave_challenge':
            if (data.payload?.challengeId) {
              metadata.challenges.delete(data.payload.challengeId);
              console.log(`User ${metadata.userId || 'anonymous'} left challenge ${data.payload.challengeId}`);
            }
            break;
            
          case 'typing_update':
            if (data.payload?.challengeId && metadata.userId) {
              // Broadcast to other users in the same challenge
              broadcastToChallenge(data.payload.challengeId, {
                type: 'user_typing',
                payload: {
                  userId: metadata.userId,
                  challengeId: data.payload.challengeId,
                  isTyping: data.payload.isTyping
                }
              }, ws);
            }
            break;
        }
      } catch (error) {
        console.error('Error processing WebSocket message', error);
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      clients.delete(ws);
    });
    
    // Send welcome message
    ws.send(JSON.stringify({
      type: 'welcome',
      payload: {
        message: 'Connected to DevChallenge WebSocket server',
        timestamp: new Date()
      }
    }));
    
    // Ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      } else {
        clearInterval(pingInterval);
      }
    }, 30000);
  });
  
  // Broadcast challenge submission updates
  function broadcastToChallenge(challengeId: number, message: any, excludeClient?: WebSocket) {
    for (const [client, metadata] of clients.entries()) {
      if (client !== excludeClient && 
          client.readyState === WebSocket.OPEN && 
          metadata.challenges.has(challengeId)) {
        client.send(JSON.stringify(message));
      }
    }
  }
  
  // Attach broadcast function to storage for use in API routes
  (storage as any).broadcastToChallenge = broadcastToChallenge;
}