# Audio Transcript Summarizer (HushDrop)

A web application that allows users to upload audio files, transcribe them using local Whisper, and generate AI-powered summaries. Built with Svelte 5 frontend and Express backend, fully containerized with Docker.

## Features

- 🎵 **Drag & Drop Audio Upload** - Support for MP3, WAV, M4A, OGG, OPUS, WebM, FLAC
- 🎯 **Local Whisper Transcription** - Privacy-focused, runs entirely on your server
- 🤖 **AI-Powered Summarization** - Uses OpenAI GPT for intelligent summaries
- 📋 **Copy to Clipboard** - Easy text copying functionality
- 🔊 **Text-to-Speech** - Read summaries aloud
- 📱 **Responsive Design** - Works on desktop and mobile
- 🐳 **Fully Containerized** - No local dependencies required

## Quick Start

### Prerequisites

- Docker and Docker Compose
- OpenAI API key (for summarization only)

### Setup

1. **Clone and setup:**
   ```bash
   git clone <repository>
   cd hushdrop
   make setup
   ```

2. **Add your OpenAI API key to `.env`:**
   ```bash
   OPENAI_API_KEY=your_api_key_here
   ```

3. **Choose your development approach:**

   **Option A: Full containerized development**
   ```bash
   make dev      # Runs both frontend and backend in containers
   ```

   **Option B: Backend in Docker, frontend locally**
   ```bash
   make backend  # Run only backend in Docker
   # Then in another terminal:
   npm run dev   # Run frontend locally
   ```

   **Option C: Production mode**
   ```bash
   make prod     # Optimized production build
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Development Commands

### Makefile Commands (Recommended)

```bash
# Setup and basic operations
make setup         # Initial setup (create .env file)
make help          # Show all available commands

# Development modes
make dev           # Full app in containers (frontend + backend)
make backend       # Backend only (for local frontend development)
make prod          # Production mode

# Building
make build         # Build all Docker images
make build-dev     # Build development images only
make build-prod    # Build production images only

# Monitoring and debugging
make logs          # Show all application logs
make logs-backend  # Show backend-only logs
make logs-dev      # Show full dev logs
make logs-prod     # Show production logs
make status        # Show container and volume status
make health        # Check service health

# Container access
make shell         # Open shell in dev container
make shell-backend # Open shell in backend container
make shell-prod    # Open shell in production container

# Testing and maintenance
make test          # Run tests (detects running container)
make clean         # Clean up containers and volumes
make clean-volumes # Clean up volumes only
make stop          # Stop all services
make restart       # Restart development services
```

### Direct Docker Compose Commands

```bash
# Development services
docker-compose up app-dev                    # Full development
docker-compose up backend-dev                # Backend only

# Production
docker-compose --profile production up app   # Production mode

# Service management
docker-compose ps                            # Show running services
docker-compose logs -f app-dev               # Follow logs
docker-compose exec app-dev sh               # Shell access
```

## Architecture

### Technology Stack
- **Frontend**: Svelte 5 with TypeScript and Tailwind CSS
- **Backend**: Express.js with TypeScript
- **Transcription**: Local Whisper (Python)
- **Summarization**: OpenAI GPT-3.5-turbo
- **Deployment**: Docker multi-stage builds

### Docker Services

| Service | Purpose | Ports | Use Case |
|---------|---------|-------|----------|
| `backend-dev` | Backend only | 3001 | Mixed development (frontend local) |
| `app-dev` | Full development | 3000, 3001 | Containerized development |
| `app` | Production | 3000, 3001 | Production deployment |

### Persistent Volumes
- **`whisper-models`** - Caches downloaded Whisper AI models (1-5GB)
- **`uploads-data`** - Stores uploaded audio files during processing

### Multi-Stage Dockerfile
1. **Base stage** - Common dependencies (Node.js, Python, FFmpeg)
2. **Development stage** - Source code mounting, dev tools
3. **Build stage** - Compiles production assets
4. **Production stage** - Optimized runtime with compiled assets only

## File Structure

```
├── src/                    # Svelte frontend
│   ├── lib/               # Shared utilities and types
│   └── routes/            # SvelteKit routes
├── server/                # Express backend
│   ├── index.ts          # Main server
│   ├── whisper-service.py # Local Whisper integration
│   └── requirements.txt   # Python dependencies
├── docker-compose.yml     # Docker services
├── Dockerfile            # Multi-stage build
└── Makefile              # Development commands
```

## Development

### Container Architecture

The application uses a multi-stage Docker setup with three service configurations:

1. **`backend-dev`** - Backend-only container for mixed development
2. **`app-dev`** - Full development container (frontend + backend)
3. **`app`** - Production container with optimized builds

### Development Workflows

**Workflow 1: Full Containerized Development**
```bash
make dev
# Both frontend and backend run in containers
# Good for: Consistent environment, easy setup
```

**Workflow 2: Hybrid Development**
```bash
make backend        # Backend in Docker
npm run dev         # Frontend locally
# Good for: Frontend debugging, faster frontend iteration
```

**Workflow 3: Production Testing**
```bash
make prod
# Test production builds locally
# Good for: Pre-deployment validation
```

### Key Features

- **No local Node.js/Python installation required**
- **Whisper models cached in Docker volumes** (`whisper-models`)
- **Persistent uploads** (`uploads-data` volume)
- **Hot reload enabled in development mode**
- **Health checks** for all services
- **Automatic container restart** on failure

### First Run Notes

- First transcription will download Whisper models (~1-5GB depending on model)
- Models are cached in Docker volumes for subsequent runs
- Default model is "base" (good balance of speed/accuracy)
- Initial startup may take 60+ seconds for Whisper model download

## Configuration

### Environment Variables

```bash
# Required for summarization
OPENAI_API_KEY=your_openai_api_key_here

# Optional
PORT=3001
NODE_ENV=development
MAX_FILE_SIZE=25MB
```

### Whisper Models

Available models (trade-off between speed and accuracy):
- `tiny` - Fastest, least accurate
- `base` - Default, good balance
- `small` - Better accuracy
- `medium` - High accuracy
- `large` - Best accuracy, slowest

## Deployment

### Production Deployment

**Local Production Testing:**
```bash
make build-prod    # Build production images
make prod          # Run production containers
```

**Server Deployment:**
```bash
# Build and run in background
make build-prod
docker-compose --profile production up -d app

# Or with direct docker-compose
docker-compose --profile production up -d app
```

### Mini Server Deployment

Perfect for deployment on mini servers, Raspberry Pi, or home labs:

1. **Copy files to server:**
   ```bash
   scp -r . user@your-server:/path/to/hushdrop
   ```

2. **Run on server:**
   ```bash
   ssh user@your-server
   cd /path/to/hushdrop
   make setup
   # Edit .env with your API key
   make prod
   ```

3. **Optional: Setup reverse proxy (nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:3001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/transcribe` - Upload audio for transcription
- `POST /api/summarize` - Generate summary from transcript

## Privacy & Security

- **Local Transcription**: Audio never leaves your server
- **Minimal External Calls**: Only summarization uses external API
- **File Cleanup**: Uploaded files automatically deleted after processing
- **Containerized**: Isolated environment with minimal attack surface

## Troubleshooting

### Common Issues

1. **Service won't start:**
   ```bash
   make status        # Check container status
   make logs          # View error logs
   make clean && make build && make dev  # Full rebuild
   ```

2. **Whisper model download fails:**
   - Check internet connection and ensure sufficient disk space (5GB+)
   - View download progress: `make logs-backend`
   - Clear model cache: `make clean-volumes`

3. **Transcription takes too long:**
   - Try smaller Whisper model (`tiny` or `base`)
   - Check available CPU/memory: `docker stats`
   - Monitor container resources: `make status`

4. **Summarization fails:**
   - Verify OpenAI API key in `.env`
   - Check API quota/billing
   - Test health endpoint: `curl http://localhost:3001/api/health`

5. **Port conflicts:**
   - Check if ports 3000/3001 are in use: `lsof -i :3000`
   - Stop conflicting services or modify docker-compose.yml ports

6. **Volume permission issues:**
   - Clean volumes: `make clean-volumes`
   - Rebuild containers: `make build && make dev`

### Debugging

**View Logs:**
```bash
make logs          # All services
make logs-backend  # Backend only
make logs-dev      # Development container
make logs-prod     # Production container
```

**Container Access:**
```bash
make shell         # Access running dev container
make shell-backend # Access backend container
make shell-prod    # Access production container
```

**Health Monitoring:**
```bash
make status        # Show container and volume status
make health        # Check service health endpoints
```

**Service Management:**
```bash
make stop          # Stop all services
make restart       # Restart development
make clean         # Full cleanup (containers + volumes)
make clean-volumes # Clean only persistent volumes
```

## License

MIT License - see LICENSE file for details.