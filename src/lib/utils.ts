/**
 * Utility functions for file handling and text processing
 */

import type { AppError, SummaryLength } from './types.js';

/**
 * Formats file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Formats duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  return remainingMinutes > 0 
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
}

/**
 * Counts words in text
 */
export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Calculates compression ratio
 */
export function calculateCompressionRatio(originalLength: number, summaryLength: number): number {
  if (originalLength === 0) return 0;
  return Math.round((1 - summaryLength / originalLength) * 100);
}

/**
 * Truncates text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Debounce function for limiting function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Creates a delay promise for testing and UX
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delayMs = baseDelay * Math.pow(2, attempt);
      await delay(delayMs);
    }
  }
  
  throw lastError!;
}

/**
 * Creates user-friendly error messages
 */
export function createUserFriendlyError(error: any): AppError {
  if (error && typeof error === 'object' && 'type' in error) {
    return error as AppError;
  }
  
  // Network errors
  if (error?.name === 'NetworkError' || error?.code === 'NETWORK_ERROR') {
    return {
      type: 'network',
      message: 'Network connection failed. Please check your internet connection and try again.',
      retryable: true,
      details: error
    };
  }
  
  // API errors
  if (error?.status >= 400 && error?.status < 500) {
    return {
      type: 'api',
      message: error?.message || 'Request failed. Please try again.',
      retryable: error?.status === 429, // Rate limit is retryable
      details: error
    };
  }
  
  if (error?.status >= 500) {
    return {
      type: 'api',
      message: 'Server error. Please try again in a moment.',
      retryable: true,
      details: error
    };
  }
  
  // Browser API errors
  if (error?.name === 'NotAllowedError' || error?.name === 'NotSupportedError') {
    return {
      type: 'browser',
      message: 'Browser feature not supported or permission denied.',
      retryable: false,
      details: error
    };
  }
  
  // Generic error
  return {
    type: 'unknown',
    message: error?.message || 'An unexpected error occurred. Please try again.',
    retryable: true,
    details: error
  };
}

/**
 * Gets summary length configuration
 */
export function getSummaryLengthConfig(length: SummaryLength): { maxWords: number; description: string } {
  switch (length) {
    case 'short':
      return { maxWords: 50, description: 'Brief summary (up to 50 words)' };
    case 'medium':
      return { maxWords: 150, description: 'Standard summary (up to 150 words)' };
    case 'long':
      return { maxWords: 300, description: 'Detailed summary (up to 300 words)' };
    default:
      return { maxWords: 150, description: 'Standard summary (up to 150 words)' };
  }
}

/**
 * Checks if browser supports required APIs
 */
export function checkBrowserSupport(): {
  clipboard: boolean;
  speechSynthesis: boolean;
  fileApi: boolean;
} {
  return {
    clipboard: typeof navigator !== 'undefined' && 'clipboard' in navigator,
    speechSynthesis: typeof window !== 'undefined' && 'speechSynthesis' in window,
    fileApi: typeof File !== 'undefined' && typeof FileReader !== 'undefined'
  };
}