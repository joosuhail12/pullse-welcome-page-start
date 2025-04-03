/**
 * Reconnection Manager
 * Handles reconnection strategies for real-time services
 */

// Reconnection status
export enum ConnectionStatus {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  SUSPENDED = 'suspended',
  FAILED = 'failed'
}

// Reconnection configuration
export interface ReconnectionConfig {
  initialDelayMs: number;
  maxDelayMs: number;
  maxAttempts: number;
  useExponentialBackoff: boolean;
  backoffFactor: number;
  jitter: boolean;
}

// Default reconnection configuration
const DEFAULT_RECONNECTION_CONFIG: ReconnectionConfig = {
  initialDelayMs: 500,
  maxDelayMs: 15000,
  maxAttempts: 10,
  useExponentialBackoff: true,
  backoffFactor: 1.5,
  jitter: true,
};

/**
 * Manages reconnection attempts with configurable backoff strategies
 */
export class ReconnectionManager {
  private config: ReconnectionConfig;
  private attempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private onStatusChangeCallbacks: ((status: ConnectionStatus) => void)[] = [];

  constructor(config?: Partial<ReconnectionConfig>) {
    this.config = { ...DEFAULT_RECONNECTION_CONFIG, ...config };
  }

  /**
   * Calculate delay for next reconnection attempt
   */
  private calculateDelay(): number {
    if (this.attempts === 0) {
      return 0;
    }

    let delay = this.config.initialDelayMs;

    // Apply exponential backoff if configured
    if (this.config.useExponentialBackoff) {
      delay = Math.min(
        this.config.initialDelayMs * Math.pow(this.config.backoffFactor, this.attempts - 1),
        this.config.maxDelayMs
      );
    }

    // Apply jitter if configured (±15%)
    if (this.config.jitter) {
      const jitterFactor = 0.85 + (Math.random() * 0.3);
      delay = Math.floor(delay * jitterFactor);
    }

    return delay;
  }

  /**
   * Start reconnection process
   * @param callback Function to call when reconnection should be attempted
   * @returns Promise that resolves when successfully reconnected or rejects when max attempts reached
   */
  public start(callback: () => Promise<boolean>): Promise<boolean> {
    this.updateStatus(ConnectionStatus.CONNECTING);
    
    return new Promise<boolean>((resolve, reject) => {
      this.attemptReconnect(callback, resolve, reject);
    });
  }

  /**
   * Attempt a reconnection
   */
  private attemptReconnect(
    callback: () => Promise<boolean>,
    resolve: (success: boolean) => void,
    reject: (reason: any) => void
  ): void {
    // Check if max attempts reached
    if (this.attempts >= this.config.maxAttempts) {
      this.updateStatus(ConnectionStatus.FAILED);
      reject(new Error(`Failed to reconnect after ${this.attempts} attempts`));
      return;
    }

    // Calculate delay based on attempt number
    const delay = this.calculateDelay();
    
    // Increment attempt counter
    this.attempts++;
    
    // Schedule reconnection attempt
    this.reconnectTimer = setTimeout(async () => {
      try {
        const success = await callback();
        
        if (success) {
          this.updateStatus(ConnectionStatus.CONNECTED);
          this.reset();
          resolve(true);
        } else {
          // Retry
          this.attemptReconnect(callback, resolve, reject);
        }
      } catch (error) {
        // Handle error and retry
        console.error(`Reconnection attempt ${this.attempts} failed:`, error);
        
        // If we've reached max attempts, declare failure
        if (this.attempts >= this.config.maxAttempts) {
          this.updateStatus(ConnectionStatus.FAILED);
          reject(error);
        } else {
          // Otherwise, try again
          this.attemptReconnect(callback, resolve, reject);
        }
      }
    }, delay);
  }

  /**
   * Stop reconnection attempts
   */
  public stop(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.updateStatus(ConnectionStatus.SUSPENDED);
  }

  /**
   * Reset reconnection manager state
   */
  public reset(): void {
    this.stop();
    this.attempts = 0;
  }

  /**
   * Get current status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Update connection status and notify listeners
   */
  private updateStatus(status: ConnectionStatus): void {
    this.status = status;
    this.onStatusChangeCallbacks.forEach(callback => callback(status));
  }

  /**
   * Register status change listener
   */
  public onStatusChange(callback: (status: ConnectionStatus) => void): () => void {
    this.onStatusChangeCallbacks.push(callback);
    return () => {
      this.onStatusChangeCallbacks = this.onStatusChangeCallbacks.filter(cb => cb !== callback);
    };
  }
}

/**
 * Create a reconnection manager singleton
 */
let reconnectionManager: ReconnectionManager | null = null;

export const getReconnectionManager = (config?: Partial<ReconnectionConfig>): ReconnectionManager => {
  if (!reconnectionManager) {
    reconnectionManager = new ReconnectionManager(config);
  }
  return reconnectionManager;
};

/**
 * Reset the singleton instance (useful for testing or reconfiguring)
 */
export const resetReconnectionManager = (): void => {
  if (reconnectionManager) {
    reconnectionManager.reset();
    reconnectionManager = null;
  }
};
