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
import DemoChatWidget from './components/DemoChatWidget/index.tsx';

let demoWidgetRoot: ReturnType<typeof createRoot> | null = null;
let widgetRoot: ReturnType<typeof createRoot> | null = null;

const PullseNamespace = {
    DemoChatWidget: DemoChatWidget,
    initDemoWidget: async () => {
        // return a promise that resolves when the widget is initialized
        return new Promise((resolve, reject) => {
            try {
                if (document.getElementById('pullse-chat-widget-container-demo')) {
                    // Initialize with enhanced security features
                    const { container, shadowRoot } = initializeEmbedSecurity('pullse-chat-widget-container-demo');

                    // Find the inner container in the shadow DOM
                    const innerContainer = shadowRoot instanceof ShadowRoot ?
                        shadowRoot.querySelector('.pullse-chat-widget-inner') :
                        container;

                    if (!innerContainer) {
                        console.error('Failed to find inner container for chat widget');
                        resolve(true);
                        return;
                    }

                    // Inject stylesheet
                    const style = document.createElement('link');
                    style.rel = 'stylesheet';
                    style.href = 'https://chat-widget.pullseai.com/assets/index-CHgug6L3.css'; // example URL
                    shadowRoot.appendChild(style);

                    // Create a root in the shadow DOM for isolation
                    demoWidgetRoot = createRoot(innerContainer as HTMLElement);

                    // Use Suspense to handle the loading state
                    demoWidgetRoot.render(
                        <React.Suspense fallback={
                            <div className="loading-widget">
                                <div className="w-10 h-10 border-4 border-vivid-purple border-t-transparent rounded-full animate-spin m-auto"></div>
                            </div>
                        }>
                            <PullseNamespace.DemoChatWidget />
                        </React.Suspense>
                    );
                    console.log("Demo widget initialized");
                    resolve(true);
                }
            } catch (error) {
                console.error("Error initializing demo widget", error);
                errorHandler.handle(error instanceof Error ? error : new Error('Failed to initialize application'));
                resolve(true);
            }
        });
    },

    destroyDemoWidget: () => {
        try {
            // Dispatch destroy event to clean up widget listeners (in preview component)
            window.dispatchEvent(
                new CustomEvent('destroy-widget', {
                    detail: { key: 'widget-destroy', value: true }
                })
            );

            // Unmount React
            if (demoWidgetRoot) {
                demoWidgetRoot.unmount();
                demoWidgetRoot = null;
            }

            console.log("Widget fully destroyed");
        } catch (e) {
            console.error("Error destroying widget", e);
        }
    },
    initChatWidget: async (workspaceId: string, apiKey: string) => {
        try {
            if (!workspaceId || !apiKey) {
                return;
            }
            try {
                localStorage.setItem('pullse_api_key', apiKey);
                localStorage.setItem('pullse_workspace_id', workspaceId);
            } catch (e) {
                console.error("Error setting local storage", e);
            }
            // Check if the container already exists in the dom if yes then remove it
            const containerDuplicateDiv = document.getElementById('pullse-chat-widget-container');
            if (containerDuplicateDiv) {
                containerDuplicateDiv.remove();
            }
            // Create a new container div
            const containerDiv = document.createElement('div');
            containerDiv.id = 'pullse-chat-widget-container';
            document.body.appendChild(containerDiv);

            const { container, shadowRoot } = initializeEmbedSecurity('pullse-chat-widget-container');

            // Find the inner container in the shadow DOM
            const innerContainer = shadowRoot instanceof ShadowRoot ?
                shadowRoot.querySelector('.pullse-chat-widget-inner') :
                container;

            if (!innerContainer) {
                console.error('Failed to find inner container for chat widget');
                return;
            }

            // Inject stylesheet
            const style = document.createElement('link');
            style.rel = 'stylesheet';
            style.href = 'https://chat-widget.pullseai.com/assets/index-CHgug6L3.css'; // example URL
            shadowRoot.appendChild(style);

            // Create a root in the shadow DOM for isolation
            widgetRoot = createRoot(innerContainer as HTMLElement);

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


            // Use Suspense to handle the loading state
            widgetRoot.render(
                <React.Suspense fallback={
                    <div className="loading-widget">
                        <div className="w-10 h-10 border-4 border-vivid-purple border-t-transparent rounded-full animate-spin m-auto"></div>
                    </div>
                }>
                    <ErrorBoundary>
                        <QueryClientProvider client={queryClient}>
                            <TooltipProvider delayDuration={0}>
                                <Toaster />
                                <Sonner />
                                <ChatWidget />
                            </TooltipProvider>
                        </QueryClientProvider>
                    </ErrorBoundary >
                </React.Suspense>
            );
        } catch (error) {
            console.error("Error initializing chat widget", error);
            errorHandler.handle(error instanceof Error ? error : new Error('Failed to initialize application'));
        }
    }
}

if (import.meta.env.MODE === 'development') {
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

// Add the PullseNamespace to window for global access, but avoid polluting global scope
(window as any).PullseSDK = PullseNamespace;


