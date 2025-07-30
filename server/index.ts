import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import multer from 'multer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import OpenAI from 'openai';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize OpenAI client for summarization (still using API for this)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

// Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP temporarily
  crossOriginOpenerPolicy: false, // Disable COOP
  originAgentCluster: false // Disable Origin-Agent-Cluster
}));

// Add request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
app.use(cors({
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());



// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File MIME type detected:', file.mimetype);
    console.log('File original name:', file.originalname);

    const allowedMimes = [
      'audio/mpeg',
      'audio/mp3',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/mp4',
      'audio/m4a',
      'audio/ogg',
      'audio/opus',
      'audio/webm',
      'audio/flac',
      'application/octet-stream' // Sometimes files are detected as this
    ];

    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|m4a|ogg|opus|webm|flac)$/i)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported audio format: ${file.mimetype}`));
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Local Whisper transcription function
async function transcribeWithLocalWhisper(filePath: string, model: string = 'base'): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonScript = '/app/server/whisper-service.py'; // Use absolute path since __dirname is /app/server/dist
    console.log(`Starting Whisper transcription: ${pythonScript} ${filePath} --model ${model}`);

    const process = spawn('python3', [pythonScript, filePath, '--model', model]);

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Whisper stdout:', output);
      stdout += output;
    });

    process.stderr.on('data', (data) => {
      const output = data.toString();
      console.log('Whisper stderr:', output);
      stderr += output;
    });

    process.on('close', (code) => {
      console.log(`Whisper process exited with code: ${code}`);
      if (code === 0) {
        try {
          const result = JSON.parse(stdout);
          console.log('Whisper result:', result);
          resolve(result);
        } catch (error) {
          console.error('Failed to parse Whisper output:', error);
          console.error('Raw stdout:', stdout);
          reject(new Error(`Failed to parse Whisper output: ${error}`));
        }
      } else {
        console.error('Whisper failed with stderr:', stderr);
        reject(new Error(`Whisper process failed (code ${code}): ${stderr}`));
      }
    });

    process.on('error', (error) => {
      console.error('Failed to start Whisper process:', error);
      reject(new Error(`Failed to start Whisper process: ${error.message}`));
    });
  });
}

// Helper function for summarization
async function summarizeTranscript(transcript: string): Promise<string> {
  if (!transcript || transcript.trim().length === 0) {
    return 'No content to summarize.';
  }

  try {
    console.log(`Summarizing transcript (${transcript.length} characters)`);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates structured summaries. Always start with a TLDR section, then break down the main points into a clear list format."
        },
        {
          role: "user",
          content: `Please analyze this transcript and provide a summary in the following format:

**TLDR:** [Two concise paragraphs summarizing the entire content]

**Main Points:**
• [First main point]
• [Second main point]
• [Third main point]
• [Additional points as needed]

Here's the transcript to summarize:

${transcript}`
        }
      ],
      max_tokens: 500,
      temperature: 0.3
    });

    return completion.choices[0]?.message?.content || 'Summary generation failed.';
  } catch (error) {
    console.error('Summarization error:', error);
    return 'Failed to generate summary. Please try again.';
  }
}

// Transcription endpoint with local Whisper and automatic summarization
// Support both /api/transcribe and /api/analyze for compatibility
const transcribeHandler = async (req: express.Request, res: express.Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  try {
    console.log(`Transcribing file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Use local Whisper for transcription with tiny model for faster processing on Pi
    const whisperResult = await transcribeWithLocalWhisper(req.file.path, 'tiny');

    if (!whisperResult.success) {
      throw new Error(whisperResult.error || 'Transcription failed');
    }

    // Generate summary if transcript is not empty
    let summary = '';
    if (whisperResult.transcript && whisperResult.transcript.trim().length > 0) {
      summary = await summarizeTranscript(whisperResult.transcript);
    } else {
      summary = 'No speech detected in the audio file.';
    }

    // Clean up uploaded file
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file:', cleanupError);
    }

    // Return transcription and summary result
    res.json({
      transcript: whisperResult.transcript,
      summary: summary,
      duration: whisperResult.duration || 0,
      language: whisperResult.language,
      confidence: 1.0, // Whisper doesn't provide confidence scores
      model: whisperResult.model
    });

  } catch (error) {
    console.error('Transcription error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');

    // Clean up uploaded file on error
    try {
      await fs.unlink(req.file.path);
    } catch (cleanupError) {
      console.warn('Failed to cleanup uploaded file after error:', cleanupError);
    }

    res.status(500).json({
      error: 'Transcription failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      type: error instanceof Error ? error.constructor.name : 'Unknown'
    });
  }
};

// Register both endpoints for compatibility
app.post('/api/transcribe', upload.single('audio'), transcribeHandler);
app.post('/api/analyze', upload.single('audio'), transcribeHandler);

// Summarization endpoint with OpenAI GPT
app.post('/api/summarize', async (req, res) => {
  const { transcript, summaryLength = 'medium' } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'No transcript provided' });
  }

  try {
    console.log(`Summarizing transcript (${transcript.length} characters)`);

    // Configure summary length
    let maxWords;
    switch (summaryLength) {
      case 'short': maxWords = 50; break;
      case 'long': maxWords = 300; break;
      default: maxWords = 150; break;
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that creates concise summaries. Create a summary of the following transcript in approximately ${maxWords} words. Focus on the key points and main ideas.`
        },
        {
          role: "user",
          content: transcript
        }
      ],
      max_tokens: Math.ceil(maxWords * 1.5), // Allow some buffer for tokens
      temperature: 0.3
    });

    const summary = completion.choices[0]?.message?.content || '';
    const wordCount = summary.split(/\s+/).filter((word: string) => word.length > 0).length;
    const originalWordCount = transcript.split(/\s+/).filter((word: string) => word.length > 0).length;
    const compressionRatio = Math.round((1 - wordCount / originalWordCount) * 100);

    res.json({
      summary,
      wordCount,
      originalLength: originalWordCount,
      compressionRatio
    });

  } catch (error) {
    console.error('Summarization error:', error);

    res.status(500).json({
      error: 'Summarization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



// Error handling middleware
app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 25MB.' });
    }
  }

  res.status(500).json({ error: 'Internal server error' });
});

// Async function to start the server
async function startServer() {
  // Set up static file serving FIRST (before SvelteKit handler)
  if (process.env.NODE_ENV === 'production') {
    // Debug middleware to see what requests are coming in
    app.use('/_app', (req, res, next) => {
      console.log(`Static request: ${req.method} ${req.path}`);
      next();
    });

    // Serve static assets from the client directory
    app.use('/_app', express.static('/app/build/client/_app', {
      maxAge: '1y', // Cache immutable assets for a year
      setHeaders: (res, path) => {
        console.log(`Serving static file: ${path}`);
        if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
        if (path.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
      }
    }));

    // Serve other static files (favicon, etc.)
    app.use(express.static('/app/build/client', {
      setHeaders: (res, path) => {
        if (path.endsWith('.svg')) {
          res.setHeader('Content-Type', 'image/svg+xml');
        }
      }
    }));

    console.log('Serving static assets from /app/build/client');
  }

  // Import and use SvelteKit handler in production
  let svelteKitHandler: any = null;
  if (process.env.NODE_ENV === 'production') {
    try {
      // Import the SvelteKit handler using dynamic import
      const handlerPath = '/app/build/handler.js';
      const handlerModule = await import(handlerPath);
      svelteKitHandler = handlerModule.handler;
      console.log('SvelteKit handler loaded successfully');
    } catch (error) {
      console.error('Failed to load SvelteKit handler:', error);
    }
  }

  // Use SvelteKit handler for all non-API routes in production
  if (process.env.NODE_ENV === 'production' && svelteKitHandler) {
    app.use((req, res, next) => {
      // Skip API routes - let them be handled by our Express routes
      if (req.path.startsWith('/api')) {
        return next();
      }

      // Use SvelteKit handler for all other routes
      svelteKitHandler(req, res, next);
    });
  } else if (process.env.NODE_ENV === 'production') {
    // Fallback if handler failed to load
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.status(500).json({
        error: 'SvelteKit handler not available',
        message: 'Frontend cannot be served'
      });
    });
  } else {
    // Development mode - show API info
    app.get('/', (req, res) => {
      res.json({
        message: 'HushDrop API Server',
        endpoints: ['/api/health', '/api/transcribe', '/api/summarize'],
        version: '1.0.0'
      });
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Listening on all interfaces (0.0.0.0:${PORT})`);
    console.log(`Frontend should be available at: http://localhost:${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
    console.log(`External access: http://192.168.1.134:${PORT}`);
    console.log(`Domain access: http://pi.8bitbot.com:${PORT}`);
  });
}

// Start the server
startServer().catch(console.error);