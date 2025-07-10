import { useEffect, useState } from "react";
import LauncherButton from "../ChatWidget/components/LauncherButton";
import HomeView from "../ChatWidget/views/HomeView";
import MessagesView from "../ChatWidget/views/MessagesView";
import { ChatWidgetConfig } from "../ChatWidget/config";
import ChatView from "../ChatWidget/views/ChatView";
import { Conversation } from "../ChatWidget/types";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import WidgetContainer from "../ChatWidget/components/WidgetContainer";
import { ChatProvider } from "../ChatWidget/context/chatContext";
import { AblyProvider } from "../ChatWidget/context/ablyContext";

const DemoChatWidget = () => {
    const [currentView, setCurrentView] = useState<'home' | 'messages' | 'chat'>('home');
    const [config, setConfig] = useState<ChatWidgetConfig | null>(null);


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
            <ChatProvider isDemo={true} demoConfig={config} currentView={currentView}>
                <AblyProvider>
                    <TooltipProvider delayDuration={0}>
                        <WidgetContainer />
                    </TooltipProvider>
                    <LauncherButton
                        unreadCount={0}
                    />
                </AblyProvider>
            </ChatProvider>
        </>
    )

};

export default DemoChatWidget;