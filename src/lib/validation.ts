/**
 * Validation functions for file types and API responses
 */

import type { AudioFile, TranscribeResponse, SummarizeResponse, AppError } from './types.js';

// Supported audio MIME types
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav', 
  'audio/mp4',
  'audio/m4a',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/aac'
] as const;

// File size limits (25MB)
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

/**
 * Validates if a file is a supported audio format
 */
export function isValidAudioFile(file: File): boolean {
  return SUPPORTED_AUDIO_TYPES.includes(file.type as any);
}

/**
 * Validates file size
 */
export function isValidFileSize(file: File): boolean {
  return file.size <= MAX_FILE_SIZE;
}

/**
 * Comprehensive file validation
 */
export function validateAudioFile(file: File): { valid: boolean; error?: AppError } {
  if (!isValidAudioFile(file)) {
    return {
      valid: false,
      error: {
        type: 'validation',
        message: `Unsupported file format. Supported formats: ${SUPPORTED_AUDIO_TYPES.join(', ')}`,
        retryable: false,
        details: { fileType: file.type, supportedTypes: SUPPORTED_AUDIO_TYPES }
      }
    };
  }

  if (!isValidFileSize(file)) {
    return {
      valid: false,
      error: {
        type: 'validation',
        message: `File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`,
        retryable: false,
        details: { fileSize: file.size, maxSize: MAX_FILE_SIZE }
      }
    };
  }

  return { valid: true };
}

/**
 * Creates an AudioFile object from a File
 */
export function createAudioFile(file: File): AudioFile {
  return {
    file,
    name: file.name,
    size: file.size,
    type: file.type
  };
}

/**
 * Validates transcription API response
 */
export function validateTranscribeResponse(response: any): TranscribeResponse | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (typeof response.transcript !== 'string' || !response.transcript.trim()) {
    return null;
  }

  if (typeof response.duration !== 'number' || response.duration < 0) {
    return null;
  }

  return {
    transcript: response.transcript,
    duration: response.duration,
    language: typeof response.language === 'string' ? response.language : undefined,
    confidence: typeof response.confidence === 'number' ? response.confidence : undefined
  };
}

/**
 * Validates summarization API response
 */
export function validateSummarizeResponse(response: any): SummarizeResponse | null {
  if (!response || typeof response !== 'object') {
    return null;
  }

  if (typeof response.summary !== 'string' || !response.summary.trim()) {
    return null;
  }

  if (typeof response.wordCount !== 'number' || response.wordCount < 0) {
    return null;
  }

  return {
    summary: response.summary,
    wordCount: response.wordCount,
    originalLength: typeof response.originalLength === 'number' ? response.originalLength : 0,
    compressionRatio: typeof response.compressionRatio === 'number' ? response.compressionRatio : 0
  };
}

/**
 * Validates transcript text for summarization
 */
export function validateTranscriptForSummarization(transcript: string): { valid: boolean; error?: AppError } {
  if (!transcript || typeof transcript !== 'string') {
    return {
      valid: false,
      error: {
        type: 'validation',
        message: 'Transcript is required for summarization',
        retryable: false
      }
    };
  }

  const trimmed = transcript.trim();
  if (trimmed.length === 0) {
    return {
      valid: false,
      error: {
        type: 'validation',
        message: 'Transcript cannot be empty',
        retryable: false
      }
    };
  }

  // Minimum length check (at least 10 characters for meaningful summarization)
  if (trimmed.length < 10) {
    return {
      valid: false,
      error: {
        type: 'validation',
        message: 'Transcript too short for summarization',
        retryable: false
      }
    };
  }

  return { valid: true };
}