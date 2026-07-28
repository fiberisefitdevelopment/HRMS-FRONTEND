import { API_CONFIG } from "@/config/app";

interface RetryConfig {
  maxAttempts: number;
  delay: number;
  shouldRetry: (error: unknown) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxAttempts: API_CONFIG.retryAttempts,
  delay: API_CONFIG.retryDelay,
  shouldRetry: (error: unknown) => {
    if (error && typeof error === "object" && "response" in error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      if (status && status >= 400 && status < 500) return false;
    }
    return true;
  },
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, delay, shouldRetry } = { ...defaultRetryConfig, ...config };
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts || !shouldRetry(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * attempt));
    }
  }

  throw lastError;
}
