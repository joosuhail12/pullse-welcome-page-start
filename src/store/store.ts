import { AgentStatus, Message } from "@/components/ChatWidget/types";
import { create } from "zustand";

export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    status?: 'active' | 'ended' | 'closed' | 'open';
    lastMessage?: string;
    messages: Message[];
    timestamp?: Date;
    unread?: boolean;
    ticketId?: string;
    sessionId?: string;
    agentInfo?: {
        id?: string;
        name?: string;
        avatar?: string;
        status?: AgentStatus;
        email?: string;
    };
    rating?: number;
}

interface ChatWidgetStore {
    activeConversation: Conversation | null;
    setActiveConversation: (update: Conversation | null | ((prev: Conversation | null) => Conversation | null)) => void;
    addMessageToConversation: (message: Message) => void;
    updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => void;
}

export const useChatWidgetStore = create<ChatWidgetStore>((set, get) => ({
    activeConversation: null,

    // Updated action to set the entire conversation object
    setActiveConversation: (update) => set(state => {
        // If the update is a function, call it with the previous state
        if (typeof update === 'function') {
            return { activeConversation: update(state.activeConversation) };
        }
        // Otherwise, set the state directly
        return { activeConversation: update };
    }),
    // Action to add a new message to the conversation
    addMessageToConversation: (newMessage: Message) => {
        set((state) => {
            if (!state.activeConversation) return state;

            const updatedMessages = [...state.activeConversation.messages, newMessage];
            return {
                activeConversation: {
                    ...state.activeConversation,
                    messages: updatedMessages,
                },
            };
        });
    },

    // Action to update the status of a specific message
    updateMessageStatus: (messageId, status) => {
        set((state) => {
            if (!state.activeConversation) return state;

            const updatedMessages = state.activeConversation.messages.map(msg =>
                msg.id === messageId ? { ...msg, status } : msg
            );

            return {
                activeConversation: {
                    ...state.activeConversation,
                    messages: updatedMessages,
                },
            };
        });
    },
}));
