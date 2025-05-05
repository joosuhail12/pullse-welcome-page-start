import { useEffect, useState } from "react";
import LauncherButton from "../ChatWidget/components/LauncherButton";
import HomeView from "../ChatWidget/views/HomeView";
import MessagesView from "../ChatWidget/views/MessagesView";
import { ChatWidgetConfig } from "../ChatWidget/config";
import ChatView from "../ChatWidget/views/ChatView";
import { Conversation } from "../ChatWidget/types";

const DemoChatWidget = () => {
    const [currentView, setCurrentView] = useState<'home' | 'messages' | 'chat'>('home');
    const [config, setConfig] = useState<ChatWidgetConfig | null>(null);

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


    useEffect(() => {
        const handleConfigUpdate = async (event: CustomEvent) => {
            console.log("config-update", event.detail.value);
            setConfig({
                ...event.detail.value.widgettheme[0],
                widgetfield: event.detail.value.widgetfield,
                realtime: event.detail.value?.realtime || false,
            });
        }

        const handleViewChange = async (event: CustomEvent) => {
            console.log("view-change", event.detail.value);
            setCurrentView(event.detail.value);
        }

        window.addEventListener('config-update', handleConfigUpdate);
        window.addEventListener('view-change', handleViewChange);
        return () => {
            window.removeEventListener('config-update', handleConfigUpdate);
            window.removeEventListener('view-change', handleViewChange);
        }
    }, []);

    if (!config) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <LauncherButton
                isOpen={true}
                unreadCount={0}
                onClick={() => { }}
                config={config}
                positionStyles={{}}
                isDemo={true}
            />
            {
                currentView === 'home' && (
                    <HomeView
                        onStartChat={() => { }}
                        config={config}
                    />
                )
            }
            {
                currentView === 'messages' && (
                    <MessagesView
                        onSelectConversation={() => { }} // TODO: add onSelectConversation
                        onSelectTicket={() => { }}
                        onStartChat={() => { }}
                        config={config}
                        isDemo={true}
                    />
                )
            }
            {
                currentView === 'chat' && (
                    <ChatView
                        conversation={demoConversation}
                        onBack={() => { }}
                        onUpdateConversation={() => { }}
                        config={config}
                        handleSelectTicket={() => { }}
                        playMessageSound={() => { }}
                        userFormData={null}
                        setUserFormData={() => { }}
                        connectionStatus={null}
                        isDemo={true}
                    />
                )
            }
        </>
    )

};

export default DemoChatWidget;