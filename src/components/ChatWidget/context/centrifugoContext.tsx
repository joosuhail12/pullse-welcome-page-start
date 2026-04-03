import React, { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode } from 'react';
import { Centrifuge, Subscription, PublicationContext } from 'centrifuge';
import { getAccessToken, getChatSessionId, getUserContactId } from '../utils/storage';
import { useChatContext } from './chatContext';
import { Conversation, useChatWidgetStore } from '@/store/store';

interface CentrifugoContextValue {
  client: Centrifuge | null;
  isConnected: boolean;
  subscribe: (channel: string, handler: (ctx: PublicationContext) => void) => Subscription;
  unsubscribe: (channel: string) => void;
}

const CentrifugoContext = createContext<CentrifugoContextValue | null>(null);

export const useCentrifugo = () => {
  const ctx = useContext(CentrifugoContext);
  if (!ctx) throw new Error('useCentrifugo must be used within CentrifugoProvider');
  return ctx;
};

interface CentrifugoProviderProps {
  children: ReactNode;
}

export const CentrifugoProvider: React.FC<CentrifugoProviderProps> = ({ children }) => {
  const clientRef = useRef<Centrifuge | null>(null);
  const subsRef = useRef<Map<string, Subscription>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const { isUserLoggedIn, isDemo } = useChatContext();
  const { setActiveConversation, updateTicket } = useChatWidgetStore();

  useEffect(() => {
    if (isDemo || !isUserLoggedIn) return;

    const serverUrl = import.meta.env.VITE_CENTRIFUGO_WS_URL
      || import.meta.env.VITE_SERVER_URL?.replace(/^http/, 'ws') + '/connection/websocket';

    const centrifuge = new Centrifuge(serverUrl, {
      getToken: async () => {
        const token = getAccessToken();
        const sessionId = getChatSessionId();
        const apiUrl = import.meta.env.VITE_SERVER_URL;
        const response = await fetch(`${apiUrl}/realtime/widget-token`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'session-id': sessionId || '',
          },
        });
        const data = await response.json();
        return data.data.token;
      },
    });

    centrifuge.on('connected', () => {
      console.log('[Centrifugo] Widget connected');
      setIsConnected(true);
    });

    centrifuge.on('disconnected', (ctx) => {
      console.log('[Centrifugo] Widget disconnected:', ctx.reason);
      setIsConnected(false);
    });

    centrifuge.connect();
    clientRef.current = centrifuge;

    return () => {
      centrifuge.disconnect();
      subsRef.current.clear();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [isUserLoggedIn, isDemo]);

  // Subscribe to notifications channel for delivery status
  useEffect(() => {
    if (isDemo || !isConnected || !clientRef.current) return;

    const contactId = getUserContactId();
    if (!contactId) return;

    const channel = `notifications:${contactId}`;

    if (subsRef.current.has(channel)) return;

    const sub = clientRef.current.newSubscription(channel);

    sub.on('publication', (ctx) => {
      const data = ctx.data;
      console.log(`[Centrifugo] Event received on ${channel}:`, data.event, data);
      switch (data.event) {
        case 'delivery_status': {
          const { widgetGeneratedId, id, status } = data;
          console.log('[Centrifugo] delivery_status:', { widgetGeneratedId, id, status });
          if (isDemo || !status) return;

          if (widgetGeneratedId) {
            // Confirm a message we sent optimistically (sent confirmation)
            setActiveConversation((prev: Conversation) => ({
              ...prev,
              messages: prev.messages.map((message) =>
                message.widgetGeneratedId === widgetGeneratedId
                  ? { ...message, status, id }
                  : message
              ),
            }));
          } else if (status === 'read' && data.readAt) {
            // Ticket-level read — update agentReadAt, ticks are derived from this
            setActiveConversation((prev: Conversation) => ({
              ...prev,
              agentReadAt: data.readAt,
            }));
          }
          break;
        }
        case 'new_ticket_reply':
        case 'new_message': {
          const { ticketId, message: lastMessage } = data;
          console.log('[Centrifugo] new_ticket_reply/new_message:', { ticketId, lastMessage });
          if (ticketId) {
            updateTicket(ticketId, {
              lastMessage: lastMessage || '',
              lastMessageAt: new Date().toISOString(),
              unread: (data.unread ?? 1),
            });
          }
          break;
        }
      }
    });

    sub.on('subscribed', (ctx) => {
      console.log(`[Centrifugo] Subscribed to ${channel}`,
        ctx.wasRecovering ? '(recovered)' : '(fresh)');
    });

    sub.subscribe();
    subsRef.current.set(channel, sub);

    return () => {
      const existing = subsRef.current.get(channel);
      if (existing) {
        existing.unsubscribe();
        existing.removeAllListeners();
        clientRef.current?.removeSubscription(existing);
        subsRef.current.delete(channel);
      }
    };
  }, [isConnected, isDemo]);

  const subscribe = useCallback((channel: string, handler: (ctx: PublicationContext) => void) => {
    if (!clientRef.current) throw new Error('Centrifugo not initialized');

    if (subsRef.current.has(channel)) {
      console.log(`[Centrifugo] Already subscribed to ${channel}, reusing`);
      return subsRef.current.get(channel)!;
    }

    console.log(`[Centrifugo] Creating subscription for ${channel}`);
    const sub = clientRef.current.newSubscription(channel);

    sub.on('publication', handler);

    sub.on('subscribed', (ctx) => {
      console.log(`[Centrifugo] Subscribed to ${channel}`,
        ctx.wasRecovering ? '(recovered)' : '(fresh)');
    });

    sub.on('error', (ctx) => {
      console.error(`[Centrifugo] Subscription error on ${channel}:`, ctx);
    });

    sub.on('unsubscribed', (ctx) => {
      console.log(`[Centrifugo] Unsubscribed from ${channel}:`, ctx.reason);
    });

    sub.subscribe();
    subsRef.current.set(channel, sub);
    return sub;
  }, []);

  const unsubscribe = useCallback((channel: string) => {
    const sub = subsRef.current.get(channel);
    if (sub) {
      console.log(`[Centrifugo] Removing subscription for ${channel}`);
      sub.unsubscribe();
      sub.removeAllListeners();
      clientRef.current?.removeSubscription(sub);
      subsRef.current.delete(channel);
    } else {
      console.log(`[Centrifugo] No subscription found for ${channel}, nothing to remove`);
    }
  }, []);

  // In demo mode, provide no-op functions
  if (isDemo) {
    return (
      <CentrifugoContext.Provider value={{
        client: null,
        isConnected: false,
        subscribe: () => ({} as Subscription),
        unsubscribe: () => {},
      }}>
        {children}
      </CentrifugoContext.Provider>
    );
  }

  return (
    <CentrifugoContext.Provider value={{
      client: clientRef.current,
      isConnected,
      subscribe,
      unsubscribe,
    }}>
      {children}
    </CentrifugoContext.Provider>
  );
};

export { CentrifugoContext };
