import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Ably from 'ably';
import { getAccessToken, getWorkspaceIdAndApiKey } from '../utils/storage';
import { useChatContext } from './chatContext';

interface AblyContextType {
    isConnected: boolean;
    subscribeToChannel: (channelName: string, eventName: string, callback: (message: any) => void) => Promise<void>;
    unsubscribeFromChannel: (channelName: string, eventName: string) => Promise<void>;
    publishToChannel: (channelName: string, eventName: string, data: Object) => Promise<void>;
}

const AblyContext = createContext<AblyContextType | null>(null);

interface AblyProviderProps {
    children: ReactNode;
}

export const AblyProvider = ({ children }: AblyProviderProps): JSX.Element => {
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const { apiKey, workspaceId } = getWorkspaceIdAndApiKey();
    const [realtime, setRealtime] = useState<Ably.Realtime | null>(null);
    const { isUserLoggedIn } = useChatContext();
    const activeChannelSubscriptions = new Map<string, Map<string, boolean>>();

    const connectToAbly = async (): Promise<Ably.Realtime> => {
        const ablyClientOptions: Ably.Types.ClientOptions = {
            authUrl: "https://dev-socket.pullseai.com/api/ably/widgetToken",
            authHeaders: {
                'Authorization': `Bearer ${getAccessToken()}`,
                'x-workspace-id': workspaceId,
                'x-api-Key': apiKey
            },
            autoConnect: true,
            echoMessages: false,
            closeOnUnload: true,
            logLevel: 2,
            // Explicitly specify all available transports to fix "no requested transports available" error
            transports: ['websocket', 'xhr_streaming', 'xhr_polling'],
        };
        const realtime = new Ably.Realtime(ablyClientOptions);
        setRealtime(realtime);
        return realtime;
    };

    useEffect(() => {
        if (realtime) {
            realtime.connection.on('disconnected', () => {
                setIsConnected(false);
            });
            realtime.connection.on('connected', () => {
                setIsConnected(true);
            });
        }
    }, [realtime]);

    const disconnectFromAbly = async (): Promise<void> => {
        realtime?.close();
        setIsConnected(false);
    };

    const subscribeToChannel = async (channelName: string, eventName: string, callback: (message: any) => void): Promise<void> => {
        if (!activeChannelSubscriptions.has(channelName)) {
            activeChannelSubscriptions.set(channelName, new Map());
        } else {
            console.log(`Channel ${channelName} already subscribed to event ${eventName}`);
            return;
        }
        const channel = realtime?.channels.get(channelName);
        if (channel) {
            const eventMap = activeChannelSubscriptions.get(channelName);
            if (!eventMap?.has(eventName)) {
                eventMap?.set(eventName, true);
                channel.subscribe(eventName, callback);
            }
        }
    };

    const unsubscribeFromChannel = async (channelName: string, eventName: string): Promise<void> => {
        const eventMap = activeChannelSubscriptions.get(channelName);
        if (eventMap?.has(eventName)) {
            eventMap.delete(eventName);
            const channel = realtime?.channels.get(channelName);
            if (channel) {
                channel.unsubscribe(eventName);
            }
            if (eventMap.size === 0) {
                activeChannelSubscriptions.delete(channelName);
            }
        }
    };

    const publishToChannel = async (channelName: string, eventName: string, data: Object): Promise<void> => {
        const channel = realtime?.channels.get(channelName);
        if (channel) {
            channel.publish(eventName, data);
        }
    };

    // Handle disconnetions and reconnections

    const contextValue: AblyContextType = {
        isConnected,
        subscribeToChannel,
        unsubscribeFromChannel,
        publishToChannel
    };


    useEffect(() => {
        if (isUserLoggedIn) {
            void connectToAbly();
        }
        return () => {
            void disconnectFromAbly();
        };
    }, [isUserLoggedIn]);

    return (
        <AblyContext.Provider value={contextValue}>
            {children}
        </AblyContext.Provider>
    );
};

export const useAblyContext = () => {
    const context = useContext(AblyContext);
    if (!context) {
        throw new Error('useAblyContext must be used within an AblyProvider');
    }
    return context;
};

export { AblyContext };
