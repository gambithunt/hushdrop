/**
 * Unit tests for validation functions
 * Note: This is a basic test structure. In a real project, you'd use a testing framework like Vitest or Jest
 */

import { 
  isValidAudioFile, 
  isValidFileSize, 
  validateAudioFile,
  validateTranscribeResponse,
  validateSummarizeResponse,
  validateTranscriptForSummarization,
  SUPPORTED_AUDIO_TYPES,
  MAX_FILE_SIZE
} from './validation.js';

// Mock File constructor for testing
class MockFile {
  name: string;
  size: number;
  type: string;

  constructor(name: string, size: number, type: string) {
    this.name = name;
    this.size = size;
    this.type = type;
  }
}

// Test data
const validAudioFile = new MockFile('test.mp3', 1024 * 1024, 'audio/mpeg') as unknown as File;
const invalidTypeFile = new MockFile('test.txt', 1024, 'text/plain') as unknown as File;
const oversizedFile = new MockFile('large.mp3', MAX_FILE_SIZE + 1, 'audio/mpeg') as unknown as File;

// Test functions (would be run by a test runner in a real project)
export function runValidationTests() {
  console.log('Running validation tests...');
  
  // Test isValidAudioFile
  console.assert(isValidAudioFile(validAudioFile) === true, 'Valid audio file should pass');
  console.assert(isValidAudioFile(invalidTypeFile) === false, 'Invalid type should fail');
  
  // Test isValidFileSize
  console.assert(isValidFileSize(validAudioFile) === true, 'Normal size file should pass');
  console.assert(isValidFileSize(oversizedFile) === false, 'Oversized file should fail');
  
  // Test validateAudioFile
  const validResult = validateAudioFile(validAudioFile);
  console.assert(validResult.valid === true, 'Valid file should pass validation');
  
  const invalidResult = validateAudioFile(invalidTypeFile);
  console.assert(invalidResult.valid === false, 'Invalid file should fail validation');
  console.assert(invalidResult.error?.type === 'validation', 'Should return validation error');
  
  // Test validateTranscribeResponse
  const validTranscribeResponse = {
    transcript: 'Hello world',
    duration: 5.5,
    language: 'en',
    confidence: 0.95
  };
  
  const validatedTranscribe = validateTranscribeResponse(validTranscribeResponse);
  console.assert(validatedTranscribe !== null, 'Valid transcribe response should pass');
  console.assert(validatedTranscribe?.transcript === 'Hello world', 'Transcript should match');
  
  const invalidTranscribeResponse = { transcript: '', duration: -1 };
  const invalidatedTranscribe = validateTranscribeResponse(invalidTranscribeResponse);
  console.assert(invalidatedTranscribe === null, 'Invalid transcribe response should fail');
  
  // Test validateSummarizeResponse
  const validSummarizeResponse = {
    summary: 'This is a summary',
    wordCount: 4,
    originalLength: 100,
    compressionRatio: 96
  };
  
  const validatedSummarize = validateSummarizeResponse(validSummarizeResponse);
  console.assert(validatedSummarize !== null, 'Valid summarize response should pass');
  console.assert(validatedSummarize?.wordCount === 4, 'Word count should match');
  
  // Test validateTranscriptForSummarization
  const validTranscript = 'This is a valid transcript with enough content';
  const validTranscriptResult = validateTranscriptForSummarization(validTranscript);
  console.assert(validTranscriptResult.valid === true, 'Valid transcript should pass');
  
  const shortTranscript = 'Short';
  const shortTranscriptResult = validateTranscriptForSummarization(shortTranscript);
  console.assert(shortTranscriptResult.valid === false, 'Short transcript should fail');
  
  console.log('Validation tests completed!');
}

// Export for potential use in development
if (typeof window !== 'undefined') {
  (window as any).runValidationTests = runValidationTests;
}