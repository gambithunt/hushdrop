/**
 * Core data models and types for the Audio Transcript Summarizer
 */

// Processing state for tracking application workflow
export type ProcessingState = 
  | { type: 'idle' }
  | { type: 'uploading', progress: number }
  | { type: 'transcribing', progress?: number }
  | { type: 'summarizing', progress?: number }
  | { type: 'complete' }
  | { type: 'error', message: string, retryable: boolean };

// Audio file information
export interface AudioFile {
  file: File;
  name: string;
  size: number;
  type: string;
  duration?: number;
}

// Transcript result from Whisper API
export interface TranscriptResult {
  text: string;
  confidence?: number;
  language?: string;
  duration: number;
}

// Summary result from GPT API
export interface SummaryResult {
  text: string;
  wordCount: number;
  originalLength: number;
  compressionRatio: number;
}

// Copy operation states
export type CopyState = 'idle' | 'copying' | 'success' | 'error';

// Speech synthesis states
export type SpeechState = 'idle' | 'speaking' | 'paused' | 'error';

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Transcription API response
export interface TranscribeResponse {
  transcript: string;
  duration: number;
  language?: string;
  confidence?: number;
}

// Summarization API response
export interface SummarizeResponse {
  summary: string;
  wordCount: number;
  originalLength: number;
  compressionRatio: number;
}

// Summary length options
export type SummaryLength = 'short' | 'medium' | 'long';

// Error types for better error handling
export interface AppError {
  type: 'validation' | 'network' | 'api' | 'browser' | 'unknown';
  message: string;
  retryable: boolean;
  details?: any;
}