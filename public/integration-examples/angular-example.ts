
/**
 * Angular Integration Example for Pullse Chat Widget
 * 
 * This example demonstrates how to integrate the Pullse Chat Widget
 * into an Angular application.
 */

// pullse-chat.component.ts
import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'pullse-chat',
  template: '', // No template needed
})
export class PullseChatComponent implements OnInit, OnDestroy {
  @Input() workspaceId!: string;
  @Input() primaryColor?: string;
  @Input() position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' = 'bottom-right';
  @Input() offsetX?: number;
  @Input() offsetY?: number;
  @Input() welcomeMessage?: string;
  @Input() autoOpen?: boolean;
  @Input() hideBranding?: boolean;
  @Input() userData?: Record<string, any>;
  
  @Output() ready = new EventEmitter<any>();
  @Output() messageSent = new EventEmitter<any>();
  @Output() messageReceived = new EventEmitter<any>();
  @Output() chatOpened = new EventEmitter<any>();
  @Output() chatClosed = new EventEmitter<any>();
  
  private initialized = false;
  private scriptLoaded = false;
  private eventHandlersRegistered = false;
  
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}
  
  ngOnInit(): void {
    // Only run in browser environment (not during SSR)
    if (isPlatformBrowser(this.platformId)) {
      this.loadPullseChat();
    }
  }
  
  loadPullseChat(): void {
    // Check if script is already loaded
    if (this.scriptLoaded) {
      this.initializeWidget();
      return;
    }
    
    // Create and load script
    const script = document.createElement('script');
    script.src = 'https://cdn.pullse.io/embed.js';
    script.async = true;
    
    script.onload = () => {
      this.scriptLoaded = true;
      this.initializeWidget();
    };
    
    script.onerror = () => {
      console.error('Failed to load Pullse Chat Widget');
    };
    
    document.body.appendChild(script);
  }
  
  initializeWidget(): void {
    // Make sure we're in browser context and Pullse is available
    if (!isPlatformBrowser(this.platformId) || !window['Pullse']) {
      return;
    }
    
    // Only initialize once
    if (this.initialized) {
      this.updateWidgetConfig();
      return;
    }
    
    // Initialize the chat widget
    window['Pullse'].chat('init', {
      workspaceId: this.workspaceId,
      primaryColor: this.primaryColor,
      position: this.position,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      welcomeMessage: this.welcomeMessage,
      autoOpen: this.autoOpen,
      hideBranding: this.hideBranding
    });
    
    // Set user data if provided
    if (this.userData) {
      window['Pullse'].chat('setUser', this.userData);
    }
    
    this.initialized = true;
    this.registerEventHandlers();
  }
  
  registerEventHandlers(): void {
    if (!isPlatformBrowser(this.platformId) || !window['Pullse'] || this.eventHandlersRegistered) {
      return;
    }
    
    // Handler functions
    const onReady = (event: any) => this.ready.emit(event);
    const onMessageSent = (event: any) => this.messageSent.emit(event);
    const onMessageReceived = (event: any) => this.messageReceived.emit(event);
    const onOpen = (event: any) => this.chatOpened.emit(event);
    const onClose = (event: any) => this.chatClosed.emit(event);
    
    // Register event handlers
    window['Pullse'].chat('on', 'ready', onReady);
    window['Pullse'].chat('on', 'chat:messageSent', onMessageSent);
    window['Pullse'].chat('on', 'chat:messageReceived', onMessageReceived);
    window['Pullse'].chat('on', 'chat:open', onOpen);
    window['Pullse'].chat('on', 'chat:close', onClose);
    
    // Store handlers for cleanup
    this._handlers = { onReady, onMessageSent, onMessageReceived, onOpen, onClose };
    this.eventHandlersRegistered = true;
  }
  
  updateWidgetConfig(): void {
    if (!isPlatformBrowser(this.platformId) || !window['Pullse'] || !this.initialized) {
      return;
    }
    
    window['Pullse'].chat('updateConfig', {
      workspaceId: this.workspaceId,
      primaryColor: this.primaryColor,
      position: this.position,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      welcomeMessage: this.welcomeMessage,
      autoOpen: this.autoOpen,
      hideBranding: this.hideBranding
    });
  }
  
  private _handlers: any = {};
  
  ngOnDestroy(): void {
    // Clean up event handlers
    if (isPlatformBrowser(this.platformId) && window['Pullse'] && this.eventHandlersRegistered) {
      window['Pullse'].chat('off', 'ready', this._handlers.onReady);
      window['Pullse'].chat('off', 'chat:messageSent', this._handlers.onMessageSent);
      window['Pullse'].chat('off', 'chat:messageReceived', this._handlers.onMessageReceived);
      window['Pullse'].chat('off', 'chat:open', this._handlers.onOpen);
      window['Pullse'].chat('off', 'chat:close', this._handlers.onClose);
    }
  }
}

/**
 * Usage Example:
 * 
 * In your app.module.ts:
 * 
 * import { PullseChatComponent } from './components/pullse-chat.component';
 * 
 * @NgModule({
 *   declarations: [
 *     AppComponent,
 *     PullseChatComponent
 *   ],
 *   ...
 * })
 * export class AppModule { }
 * 
 * In your component template:
 * 
 * <pullse-chat
 *   workspaceId="your-workspace-id"
 *   primaryColor="#4F46E5"
 *   [autoOpen]="false"
 *   [userData]="{ name: 'John Doe', email: 'john@example.com' }"
 *   (messageSent)="onMessageSent($event)"
 * ></pullse-chat>
 * 
 * In your component class:
 * 
 * onMessageSent(event: any) {
 *   console.log('Message sent:', event);
 * }
 */
