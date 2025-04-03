
/**
 * Resilience patterns for API calls
 * Including retry mechanisms and circuit breaker pattern
 */

type RetryOptions = {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffFactor: number;
  retryableStatusCodes?: number[];
};

type CircuitBreakerOptions = {
  failureThreshold: number;  // Number of failures before opening circuit
  resetTimeoutMs: number;    // Time before trying to close circuit
  halfOpenSuccessThreshold?: number; // Successes needed in half-open state to close
};

// Default retry options
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  initialDelayMs: 300,
  maxDelayMs: 3000,
  backoffFactor: 2,
  retryableStatusCodes: [408, 429, 500, 502, 503, 504], // Timeouts, rate limits, and server errors
};

// Default circuit breaker options
const DEFAULT_CIRCUIT_BREAKER_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  resetTimeoutMs: 30000, // 30 seconds
  halfOpenSuccessThreshold: 2,
};

// Circuit breaker states
type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

// Global circuit breaker state store
const circuitBreakers: Record<string, {
  state: CircuitState;
  failures: number;
  lastFailureTime: number;
  successesInHalfOpen: number;
  options: CircuitBreakerOptions;
}> = {};

/**
 * Implements a retry mechanism with exponential backoff
 * @param operation The async operation to retry
 * @param options Retry configuration options
 * @returns Promise with the operation result or throws after all retries fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  // Merge with default options
  const config: RetryOptions = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // Execute the operation
      const result = await operation();
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      // Check if we've reached max retries
      if (attempt >= config.maxRetries) {
        throw lastError;
      }

      // Check if this status code is retryable
      if (error instanceof Response && config.retryableStatusCodes) {
        if (!config.retryableStatusCodes.includes(error.status)) {
          throw lastError;  // Non-retryable status code
        }
      }
      
      // Calculate delay with exponential backoff
      const delayMs = Math.min(
        config.initialDelayMs * Math.pow(config.backoffFactor, attempt),
        config.maxDelayMs
      );
      
      // Add some jitter to prevent thundering herd
      const jitteredDelay = delayMs * (0.8 + Math.random() * 0.4);
      
      console.log(`Retry attempt ${attempt + 1}/${config.maxRetries} after ${Math.round(jitteredDelay)}ms`);
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  // This should never happen due to the throw in the loop
  throw lastError || new Error('Retry operation failed');
}

/**
 * Implements the circuit breaker pattern
 * @param operation The async operation to protect with circuit breaker
 * @param circuitName Unique identifier for this circuit
 * @param options Circuit breaker configuration
 * @returns Promise with the operation result or throws circuit open error
 */
export async function withCircuitBreaker<T>(
  operation: () => Promise<T>,
  circuitName: string,
  options: Partial<CircuitBreakerOptions> = {}
): Promise<T> {
  // Initialize circuit if not exists
  if (!circuitBreakers[circuitName]) {
    circuitBreakers[circuitName] = {
      state: 'CLOSED',
      failures: 0,
      lastFailureTime: 0,
      successesInHalfOpen: 0,
      options: { ...DEFAULT_CIRCUIT_BREAKER_OPTIONS, ...options }
    };
  }
  
  const circuit = circuitBreakers[circuitName];
  const now = Date.now();
  
  // Check if circuit is OPEN and if reset timeout has passed
  if (circuit.state === 'OPEN') {
    if (now - circuit.lastFailureTime > circuit.options.resetTimeoutMs) {
      // Transition to HALF_OPEN to test if service has recovered
      circuit.state = 'HALF_OPEN';
      circuit.successesInHalfOpen = 0;
      console.log(`Circuit ${circuitName} transitioned from OPEN to HALF_OPEN`);
    } else {
      // Circuit is still OPEN, fail fast
      throw new Error(`Circuit ${circuitName} is OPEN - failing fast`);
    }
  }
  
  try {
    // Execute the operation
    const result = await operation();
    
    // Handle success based on circuit state
    if (circuit.state === 'HALF_OPEN') {
      circuit.successesInHalfOpen++;
      
      // Check if we've reached the threshold to close the circuit
      if (circuit.successesInHalfOpen >= (circuit.options.halfOpenSuccessThreshold || 1)) {
        circuit.state = 'CLOSED';
        circuit.failures = 0;
        console.log(`Circuit ${circuitName} transitioned from HALF_OPEN to CLOSED`);
      }
    } else if (circuit.state === 'CLOSED') {
      // Reset failure count on successful operation
      circuit.failures = 0;
    }
    
    return result;
  } catch (error) {
    // Handle failure based on circuit state
    circuit.failures++;
    circuit.lastFailureTime = Date.now();
    
    if (circuit.state === 'CLOSED' && circuit.failures >= circuit.options.failureThreshold) {
      // Too many failures, open the circuit
      circuit.state = 'OPEN';
      console.log(`Circuit ${circuitName} transitioned from CLOSED to OPEN after ${circuit.failures} failures`);
    } else if (circuit.state === 'HALF_OPEN') {
      // Any failure in HALF_OPEN state opens the circuit again
      circuit.state = 'OPEN';
      console.log(`Circuit ${circuitName} transitioned from HALF_OPEN back to OPEN due to failure`);
    }
    
    // Rethrow the error to be handled by the caller
    throw error;
  }
}

/**
 * Combined utility function that applies both retry and circuit breaker patterns
 */
export async function withResilience<T>(
  operation: () => Promise<T>,
  circuitName: string,
  retryOptions?: Partial<RetryOptions>,
  circuitOptions?: Partial<CircuitBreakerOptions>
): Promise<T> {
  return withCircuitBreaker(
    () => withRetry(operation, retryOptions),
    circuitName,
    circuitOptions
  );
}

/**
 * Checks if the circuit for a specific service is open
 * @param circuitName Name of the circuit to check
 * @returns True if circuit is open (service should not be called)
 */
export function isCircuitOpen(circuitName: string): boolean {
  return circuitBreakers[circuitName]?.state === 'OPEN';
}

/**
 * Resets a circuit breaker to closed state
 * @param circuitName Name of the circuit to reset
 */
export function resetCircuit(circuitName: string): void {
  if (circuitBreakers[circuitName]) {
    circuitBreakers[circuitName].state = 'CLOSED';
    circuitBreakers[circuitName].failures = 0;
    circuitBreakers[circuitName].successesInHalfOpen = 0;
    console.log(`Circuit ${circuitName} manually reset to CLOSED state`);
  }
}

/**
 * Gets the current state of a circuit breaker
 * @param circuitName Name of the circuit to check
 * @returns The current circuit state or undefined if circuit doesn't exist
 */
export function getCircuitState(circuitName: string): CircuitState | undefined {
  return circuitBreakers[circuitName]?.state;
}

