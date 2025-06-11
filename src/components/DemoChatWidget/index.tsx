
import { useEffect, useState } from "react";
import LauncherButton from "../ChatWidget/components/LauncherButton";
import HomeView from "../ChatWidget/views/HomeView";
import MessagesView from "../ChatWidget/views/MessagesView";
import { ChatWidgetConfig } from "../ChatWidget/config";
import ChatView from "../ChatWidget/views/ChatView";
import { Conversation, Message } from "../ChatWidget/types";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import WidgetContainer from "../ChatWidget/components/WidgetContainer";

const DemoChatWidget = () => {
    const [currentView, setCurrentView] = useState<'home' | 'messages' | 'chat'>('home');
    const [config, setConfig] = useState<ChatWidgetConfig | null>(null);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    // Mock messages with all message types
    const mockMessages: Message[] = [
        {
            id: "msg-1",
            text: "Hello! Welcome to our support chat. How can I help you today?",
            sender: "agent",
            senderType: "agent",
            messageType: "text",
            createdAt: new Date(Date.now() - 300000),
            type: "text"
        },
        {
            id: "msg-2",
            text: "Hi there! I need help with my account setup.",
            sender: "user",
            senderType: "user",
            messageType: "text",
            createdAt: new Date(Date.now() - 280000),
            type: "text"
        },
        {
            id: "msg-3",
            text: "I'd be happy to help you with that! Let me collect some information first.",
            sender: "agent",
            senderType: "agent",
            messageType: "data_collection",
            messageConfig: {
                title: "Account Setup Information",
                description: "Please provide the following details to help us set up your account:",
                fields: [
                    {
                        id: "fullName",
                        type: "text",
                        label: "Full Name",
                        placeholder: "Enter your full name",
                        required: true
                    },
                    {
                        id: "email",
                        type: "email",
                        label: "Email Address",
                        placeholder: "Enter your email",
                        required: true
                    },
                    {
                        id: "company",
                        type: "text",
                        label: "Company Name",
                        placeholder: "Enter your company name",
                        required: false
                    },
                    {
                        id: "plan",
                        type: "select",
                        label: "Preferred Plan",
                        required: true,
                        options: ["Basic", "Pro", "Enterprise"]
                    },
                    {
                        id: "notes",
                        type: "textarea",
                        label: "Additional Notes",
                        placeholder: "Any additional information...",
                        required: false
                    }
                ]
            },
            createdAt: new Date(Date.now() - 260000),
            type: "data_collection"
        },
        {
            id: "msg-4",
            text: "Here's a helpful guide that might answer some of your questions:",
            sender: "agent",
            senderType: "agent",
            messageType: "card",
            cardData: {
                title: "Account Setup Guide",
                description: "A comprehensive guide to help you get started with your new account and explore all available features.",
                imageUrl: "https://via.placeholder.com/300x150/6366f1/ffffff?text=Setup+Guide",
                buttons: [
                    { text: "View Guide", action: "view_guide" },
                    { text: "Download PDF", action: "download_pdf" }
                ]
            },
            createdAt: new Date(Date.now() - 240000),
            type: "card"
        },
        {
            id: "msg-5",
            text: "That's very helpful, thank you!",
            sender: "user",
            senderType: "user",
            messageType: "text",
            createdAt: new Date(Date.now() - 220000),
            type: "text"
        },
        {
            id: "msg-6",
            text: "I've attached a screenshot of the issue I'm experiencing:",
            sender: "user",
            senderType: "user",
            messageType: "file",
            fileName: "screenshot-issue.png",
            metadata: {
                fileUrl: "https://via.placeholder.com/400x300/ef4444/ffffff?text=Screenshot",
                uploading: false
            },
            createdAt: new Date(Date.now() - 200000),
            type: "file"
        },
        {
            id: "msg-7",
            text: "Thanks for the screenshot! I can see the issue. Would you like me to:",
            sender: "agent",
            senderType: "agent",
            messageType: "quick_reply",
            quickReplies: [
                { text: "Fix it remotely", action: "remote_fix" },
                { text: "Schedule a call", action: "schedule_call" },
                { text: "Send detailed steps", action: "send_steps" }
            ],
            createdAt: new Date(Date.now() - 180000),
            type: "quick_reply"
        },
        {
            id: "msg-8",
            text: "The issue has been resolved successfully! Your account is now properly configured.",
            sender: "system",
            senderType: "system",
            messageType: "note",
            createdAt: new Date(Date.now() - 160000),
            type: "system"
        },
        {
            id: "msg-9",
            text: "Perfect! Everything is working now. Thank you so much for your help! 😊",
            sender: "user",
            senderType: "user",
            messageType: "text",
            reactions: ["👍", "❤️"],
            createdAt: new Date(Date.now() - 140000),
            type: "text"
        },
        {
            id: "msg-10",
            text: "You're very welcome! Is there anything else I can help you with today?",
            sender: "agent",
            senderType: "agent",
            messageType: "text",
            createdAt: new Date(Date.now() - 120000),
            type: "text"
        }
    ];

    const demoConversation: Conversation = {
        id: "demo-conversation-1",
        title: "Demo Conversation - All Message Types",
        createdAt: new Date(),
        status: "active",
        lastMessage: "You're very welcome! Is there anything else I can help you with today?",
        messages: mockMessages,
        timestamp: new Date(),
        unread: false,
        ticketId: "demo-ticket-1",
        sessionId: "demo-session-1",
        agentInfo: {
            id: "demo-agent-1",
            name: "Demo Agent",
            avatar: "https://via.placeholder.com/40x40/6366f1/ffffff?text=DA",
            email: "demo@example.com",
            status: "online"
        },
        rating: 5
    }

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        setCurrentView('chat');
    };

    const handleUpdateConversation = (updatedConversation: Conversation) => {
        setSelectedConversation(updatedConversation);
    };

    const handleStartChat = () => {
        setSelectedConversation(demoConversation);
        setCurrentView('chat');
    };

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
                    activeConversation={selectedConversation}
                    widgetStyle={{}}
                    containerStyles={{}}
                    handleSelectConversation={handleSelectConversation}
                    handleSelectTicket={() => handleSelectConversation(demoConversation)}
                    handleUpdateConversation={handleUpdateConversation}
                    handleChangeView={(view: 'home' | 'messages' | 'chat') => setCurrentView(view)}
                    handleBackToMessages={() => setCurrentView('messages')}
                    handleStartChat={handleStartChat}
                    setUserFormData={() => { }}
                    playMessageSound={() => { }}
                    connectionStatus={null}
                    isDemo={true}
                />
            </TooltipProvider>
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
