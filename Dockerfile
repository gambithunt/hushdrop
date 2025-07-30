# Multi-stage build for the Audio Transcript Summarizer
FROM node:20-slim AS base

# Install system dependencies for audio processing and Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    ffmpeg \
    git \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Create Python virtual environment and install Whisper dependencies
COPY server/requirements.txt ./server/
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r server/requirements.txt

# Development stage
FROM base AS development
COPY . .
EXPOSE 3000 3001

# Make Python script executable
RUN chmod +x server/whisper-service.py

# Create uploads directory with proper permissions
RUN mkdir -p uploads && chown -R node:node uploads

# Create and set permissions for Vite cache directory
RUN mkdir -p node_modules/.vite && chown -R node:node node_modules/.vite

# Ensure virtual environment is available
ENV PATH="/opt/venv/bin:$PATH"

# Switch to node user for development
USER node

CMD ["npm", "run", "dev"]

# Build stage
FROM base AS build
COPY . .
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies and build
RUN npm install
RUN npm run build

# Production stage
FROM node:20-slim AS production

# Install system dependencies for audio processing and Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev \
    build-essential \
    ffmpeg \
    git \
    curl \
    wget \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Create Python virtual environment and install Whisper dependencies
COPY server/requirements.txt ./server/
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --no-cache-dir -r server/requirements.txt

# Copy built application
COPY --from=build /app/build ./build
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package*.json ./
COPY --from=build /app/server/whisper-service.py ./server/
COPY --from=build /app/server/requirements.txt ./server/

# Create uploads directory
RUN mkdir -p uploads

# Make Python script executable
RUN chmod +x server/whisper-service.py

# Create non-root user with proper home directory
RUN groupadd -g 1001 nodejs
RUN useradd -r -u 1001 -g nodejs -m -d /home/nextjs nextjs

# Create whisper cache directory
RUN mkdir -p /app/.cache/whisper
RUN chown -R nextjs:nodejs /app
RUN chown -R nextjs:nodejs /home/nextjs

# Set environment variables for Whisper
ENV XDG_CACHE_HOME=/app/.cache
ENV WHISPER_CACHE_DIR=/app/.cache/whisper

USER nextjs

EXPOSE 3000 3001

CMD ["node", "server/dist/index.js"]