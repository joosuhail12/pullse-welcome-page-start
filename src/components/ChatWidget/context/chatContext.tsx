import { createContext, useCallback, useContext, useEffect, useState, useRef } from 'react';
import { getAccessToken, getUserFormDataFromLocalStorage, getWorkspaceIdAndApiKey, setAccessToken, setChatSessionId, setUserContactId, setUserFormDataInLocalStorage } from '../utils/storage';
import { Conversation } from '../types';
import { toast } from 'sonner';
import { ChatWidgetConfig } from '../config';
import { dispatchChatEvent } from '../utils/events';
import { useChatWidgetStore } from '@/store/store';

type ViewState = 'home' | 'messages' | 'chat';

interface ChatContextType {
    viewState: ViewState;
    setViewState: (state: ViewState) => void;
    activeConversation: Conversation | null;
    setActiveConversation: (conversation: Conversation | null) => void;
    userFormData: Record<string, string> | undefined;
    handleSetFormData: (data: Record<string, string> | undefined) => void;
    config: ChatWidgetConfig | null;
    isUserLoggedIn: boolean;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    handleStartChat: () => void;
    isDemo?: boolean;
}

const ChatContext = createContext<ChatContextType | null>(null);

//  Pass config as a prop to the ChatProvider
interface ChatProviderProps {
    children: React.ReactNode;
    demoConfig?: ChatWidgetConfig;
    currentView?: ViewState;
    isDemo?: boolean;
}

const demoConversation: Conversation = {
    id: "1",
    title: "Demo Conversation",
    createdAt: new Date(),
    status: "active",
    lastMessage: "Hello, how are you?",
    messages: [],
    timestamp: new Date(),
    unread: false,
    ticketId: "1",
    sessionId: "1",
    agentInfo: {
        id: "1",
        name: "Demo Agent",
        avatar: "https://via.placeholder.com/150",
        email: "demo@example.com"
    },
    rating: 5
}

export const ChatProvider = ({ children, demoConfig, currentView, isDemo = false }: ChatProviderProps): JSX.Element => {
    const [viewState, setViewState] = useState<ViewState>('home');
    const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(false);
    const [userFormData, setUserFormData] = useState<Record<string, string> | undefined>(getUserFormDataFromLocalStorage());
    const [isOpen, setIsOpen] = useState<boolean>(isDemo ? true : false);
    const [config, setConfig] = useState<ChatWidgetConfig | null>(null);
    const configRef = useRef<ChatWidgetConfig | null>(null);

    const { activeConversation, setActiveConversation } = useChatWidgetStore();

    useEffect(() => {
        configRef.current = config;
    }, [config]);

    const handleStartChat = useCallback(() => {
        if (isDemo) {
            return;
        }
        const currentConfig = configRef.current;
        if (!currentConfig) {
            console.warn('Config not yet loaded');
            return;
        }

        const newConversation: Conversation = {
            id: `conv-${Date.now()}`,
            title: 'New Conversation',
            lastMessage: '',
            createdAt: new Date(),
            messages: [{
                id: `msg-${Date.now()}`,
                text: currentConfig.labels?.welcomeMessage || 'Hello, how can I help you today?',
                createdAt: new Date(),
                sender: 'system',
                type: 'text',
                senderType: 'system',
                messageType: 'text',
            }],
            agentInfo: {
                name: 'Support Agent',
                avatar: undefined
            },
        };
        setViewState('chat');
        setActiveConversation(newConversation);
    }, [isDemo]);


    const handleSetFormData = useCallback(async (formData: Record<string, string>) => {
        // Create new contact in database
        const { apiKey } = getWorkspaceIdAndApiKey();
        if (!apiKey) {
            console.error("No API key found");
            return;
        };
        try {
            const response = await fetch("https://dev-socket.pullseai.com/api/widgets/createContactDevice/" + apiKey, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            if (data.status === "success") {
                setUserFormData(formData);
                setUserFormDataInLocalStorage(formData);

                if (data.data) {
                    if (data.data?.accessToken) {
                        setAccessToken(data.data.accessToken);
                    }
                    if (data.data?.sessionId) {
                        setChatSessionId(data.data.sessionId);
                    }
                    if (data.data?.contactId) {
                        setUserContactId(data.data.contactId);
                    }
                }
                console.log('Contact created successfully');
                setIsUserLoggedIn(true);
                return true;
            } else {
                toast.error(data.message || "Failed to create contact");
                return false;
            }
        } catch (error) {
            console.error("Error creating contact:", error);
            toast.error("Failed to connect to the server");
            return false;
        }
    }, []);

    const handleSetOpen = useCallback((isOpen: boolean) => {
        if (!isDemo) {
            setIsOpen(isOpen);
        }
    }, []);

    const handleSetViewState = useCallback((viewState: ViewState) => {
        if (!isDemo) {
            setViewState(viewState);
        }
    }, []);

    const contextValue: ChatContextType = {
        viewState,
        setViewState: handleSetViewState,
        activeConversation,
        setActiveConversation,
        userFormData,
        handleSetFormData,
        config,
        isUserLoggedIn,
        isOpen,
        setIsOpen: handleSetOpen,
        handleStartChat,
        isDemo
    };

    const fetchWidgetConfig = useCallback(async () => {
        try {
            const accessToken = getAccessToken();
            const { apiKey, workspaceId } = getWorkspaceIdAndApiKey();
            const url = `https://dev-socket.pullseai.com/api/widgets/getWidgetConfig/${apiKey}?workspace_id=${encodeURIComponent(workspaceId)}`;

            const headers: HeadersInit = {
                'Content-Type': 'application/json',
            };

            if (accessToken) {
                headers['Authorization'] = 'Bearer ' + accessToken;
            }

            const response = await fetch(url, {
                headers,
                credentials: 'include',
                method: 'POST',
                body: JSON.stringify({
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                })
            });

            if (!response.ok) {
                // If we get an error response, throw an error to trigger retry
                const errorText = await response.text().catch(() => 'Unknown error');
                throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
            }

            // Check content-type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                console.error('Received non-JSON response when fetching chat widget config');
                throw new Error('Invalid content type received from API');
            }

            const config = await response.json();
            if (config?.data?.accessToken) {
                setIsUserLoggedIn(true);
            }
            dispatchChatEvent('widget:loaded', { config });

            const configWithRealtime = {
                ...config.data.widgettheme[0],
                widgetfield: config.data.widgetfield,
                realtime: true,
                workspaceId: workspaceId,
                contact: config.data.contact || null,
                sessionId: config.data.sessionId
            };

            setConfig(configWithRealtime);
        } catch (error) {
            dispatchChatEvent('widget:error', { error: error as Error });
        }
    }, []);

    useEffect(() => {
        if (isDemo) {
            setConfig(demoConfig);
            setActiveConversation(demoConversation);
        } else {
            void fetchWidgetConfig();
        }
    }, []);

    if (isDemo) {
        useEffect(() => {
            console.log("currentView", currentView);
            if (currentView) {
                setViewState(currentView);
            }
            if (demoConfig) {
                console.log("demoConfig", demoConfig);
                console.log("activeConversation", activeConversation);
                setConfig(demoConfig);
                setActiveConversation((demoConversation) => {
                    return {
                        ...demoConversation,
                        messages: [{
                            id: `msg-${Date.now()}`,
                            text: demoConfig?.labels?.welcomeMessage || 'Hello, how can I help you today???',
                            createdAt: new Date(),
                            sender: 'agent',
                            type: 'text',
                            senderType: 'agent',
                            messageType: 'text',
                        },
                        {
                            id: `msg-${Date.now() + 1}`,
                            text: 'Can you help me with my order?',
                            createdAt: new Date(),
                            sender: 'user',
                            type: 'text',
                            senderType: 'customer',
                            messageType: 'text',
                        }]
                    }
                });
            }
        }, [currentView, demoConfig]);
    }

    if (!config) {
        return <ChatContext.Provider value={contextValue}> <></> </ChatContext.Provider>;
    }

    return <ChatContext.Provider value={contextValue}> {children} </ChatContext.Provider>;
};

export const useChatContext = () => {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChatContext must be used within a ChatProvider');
    }
    return context;
};