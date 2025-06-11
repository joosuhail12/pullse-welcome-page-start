import { useEffect, useState } from "react";
import LauncherButton from "../ChatWidget/components/LauncherButton";
import HomeView from "../ChatWidget/views/HomeView";
import MessagesView from "../ChatWidget/views/MessagesView";
import { ChatWidgetConfig } from "../ChatWidget/config";
import ChatView from "../ChatWidget/views/ChatView";
import { Conversation } from "../ChatWidget/types";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import WidgetContainer from "../ChatWidget/components/WidgetContainer";

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

        const handleDestroyWidget = async (event: CustomEvent) => {
            console.log("destroy-widget", event.detail.value)
            window.removeEventListener('config-update', handleConfigUpdate);
            window.removeEventListener('view-change', handleViewChange);
            window.removeEventListener('destroy-widget', handleDestroyWidget);
        }

        window.addEventListener('config-update', handleConfigUpdate);
        window.addEventListener('view-change', handleViewChange);
        window.addEventListener('destroy-widget', handleDestroyWidget);

        window.dispatchEvent(new CustomEvent('widget-loaded', {
            detail: {
                key: 'widgettheme',
                value: {
                }
            }
        }));

        return () => {
            window.removeEventListener('config-update', handleConfigUpdate);
            window.removeEventListener('view-change', handleViewChange);
            window.removeEventListener('destroy-widget', handleDestroyWidget);
        }
    }, []);

    if (!config) {
        return <div>Loading...</div>;
    }


    return (
        <>
            <TooltipProvider delayDuration={0}>
                <WidgetContainer
                    isOpen={true}
                    viewState={currentView}
                    config={config}
                    activeConversation={demoConversation}
                    widgetStyle={{}}
                    containerStyles={{}}
                    handleSelectConversation={() => setCurrentView('chat')}
                    handleSelectTicket={() => setCurrentView('chat')}
                    handleUpdateConversation={() => { }}
                    handleChangeView={(view: 'home' | 'messages' | 'chat') => setCurrentView(view)}
                    handleBackToMessages={() => setCurrentView('messages')}
                    handleStartChat={() => { }}
                    setUserFormData={() => { }}
                    playMessageSound={() => { }}
                    connectionStatus={null}
                    isDemo={true}
                />
            </TooltipProvider>
            {/* {
                currentView === 'home' && (
                    <HomeView
                        onStartChat={() => { }}
                        config={config}
                    />
                )
            }
            {
                currentView === 'messages' && (
                    <TooltipProvider delayDuration={0}>
                        <MessagesView
                            onSelectConversation={() => { }} // TODO: add onSelectConversation
                            onSelectTicket={() => { }}
                            onStartChat={() => { }}
                            config={config}
                            isDemo={true}
                        />
                    </TooltipProvider>
                )
            }
            {
                currentView === 'chat' && (
                    <TooltipProvider delayDuration={0}>
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
                    </TooltipProvider>
                )
            } */}
            <LauncherButton
                isOpen={true}
                unreadCount={0}
                onClick={() => { }}
                config={config}
                positionStyles={{}}
                isDemo={true}
            />
        </>
    )

};

export default DemoChatWidget;