// WebSocket Setup Hook
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { setupTaskStoreWebSocket } from '@/store/taskStore';
import { wsClient } from '@/lib/websocket';

export function useWebSocketSetup() {
  const { token, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && token) {
      // Connect WebSocket with token
      wsClient.connect(token);

      // Setup store listeners
      setupTaskStoreWebSocket();

      // Cleanup on unmount or auth change
      return () => {
        wsClient.disconnect();
      };
    }
  }, [isAuthenticated, token]);
}

