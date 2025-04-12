import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import PullseChatWidgetLoader from './components/ChatWidget/embed';
import { initializeEmbedSecurity } from './components/ChatWidget/utils/embedSecurity';
import { errorHandler } from '@/lib/error-handler';
import ChatWidget from './components/ChatWidget/ChatWidget.tsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import ErrorBoundary from './components/ui/error-boundary.tsx';

// Check if this is being loaded as the chat widget bundle
if (document.getElementById('pullse-chat-widget-container')) {
    try {
        const rootElement = document.getElementById('pullse-chat-widget-container');
        if (!rootElement) throw new Error('Failed to find the root element');

        // Create the query client instance outside of the component
        const queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    refetchOnWindowFocus: false,
                    retry: false,
                    staleTime: 1000 * 60 * 5, // 5 minutes
                },
            },
        });


        createRoot(rootElement).render(
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <TooltipProvider delayDuration={0}>
                        <Toaster />
                        <Sonner />
                        <ChatWidget />
                    </TooltipProvider>
                </QueryClientProvider>
            </ErrorBoundary >
        );
    } catch (error) {
        errorHandler.handle(error instanceof Error ? error : new Error('Failed to initialize application'));
    }
} else {
    // Normal app initialization
    try {
        const rootElement = document.getElementById('root');
        if (!rootElement) throw new Error('Failed to find the root element');

        createRoot(rootElement).render(
            <App />
        );
    } catch (error) {
        errorHandler.handle(error instanceof Error ? error : new Error('Failed to initialize application'));
    }
}

// Export the widget loader for direct imports
export { PullseChatWidgetLoader as default };