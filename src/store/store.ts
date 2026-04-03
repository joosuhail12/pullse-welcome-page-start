import { AgentStatus, Message, Ticket } from "@/components/ChatWidget/types";
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
    agentReadAt?: string | null;
}

interface BotStreamingState {
    ticketId: string | null;
    status: string | null;
    text: string;
}

interface ChatWidgetStore {
    activeConversation: Conversation | null;
    setActiveConversation: (update: Conversation | null | ((prev: Conversation | null) => Conversation | null)) => void;
    addMessageToConversation: (message: Message) => void;
    updateMessageStatus: (messageId: string, status: 'sent' | 'delivered' | 'read') => void;
    tickets: Ticket[];
    setTickets: (tickets: Ticket[]) => void;
    updateTicket: (ticketId: string, updates: Partial<Ticket>) => void;
    botStreaming: BotStreamingState;
    setBotStreamingStatus: (ticketId: string, status: string | null) => void;
    appendBotStreamingToken: (ticketId: string, token: string) => void;
    clearBotStreaming: () => void;
}

export const useChatWidgetStore = create<ChatWidgetStore>((set, get) => ({
    activeConversation: null,
    tickets: [],
    botStreaming: { ticketId: null, status: null, text: '' },

    setTickets: (tickets) => set({ tickets }),

    updateTicket: (ticketId, updates) => set((state) => ({
        tickets: state.tickets.map((t) =>
            t.id === ticketId ? { ...t, ...updates } : t
        ),
    })),

    setBotStreamingStatus: (ticketId, status) => set(state => ({
        botStreaming: { ...state.botStreaming, ticketId, status }
    })),

    appendBotStreamingToken: (ticketId, token) => set(state => {
        if (state.botStreaming.ticketId !== ticketId) {
            return { botStreaming: { ticketId, status: null, text: token } };
        }
        return { botStreaming: { ...state.botStreaming, text: state.botStreaming.text + token } };
    }),

    clearBotStreaming: () => set({ botStreaming: { ticketId: null, status: null, text: '' } }),

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
