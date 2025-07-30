# Makefile for Audio Transcript Summarizer

.PHONY: help setup dev backend prod build build-dev build-prod clean clean-volumes logs logs-backend logs-dev logs-prod shell shell-backend shell-prod test health status stop restart

# Default target
help:
	@echo "Audio Transcript Summarizer - Docker Commands"
	@echo ""
	@echo "Available commands:"
	@echo "  setup         - Initial setup (create .env file)"
	@echo "  dev           - Run full app in development mode (frontend + backend)"
	@echo "  backend       - Run only backend in Docker (for local frontend dev)"
	@echo "  prod          - Run in production mode"
	@echo "  build         - Build all Docker images"
	@echo "  build-dev     - Build development images only"
	@echo "  build-prod    - Build production images only"
	@echo "  clean         - Clean up containers and volumes"
	@echo "  clean-volumes - Clean up volumes only"
	@echo "  logs          - Show all application logs"
	@echo "  logs-backend  - Show backend-only logs"
	@echo "  logs-dev      - Show full dev logs"
	@echo "  logs-prod     - Show production logs"
	@echo "  shell         - Open shell in running dev container"
	@echo "  shell-backend - Open shell in backend container"
	@echo "  shell-prod    - Open shell in production container"
	@echo "  test          - Run tests"
	@echo "  health        - Check service health status"
	@echo "  status        - Show running containers"
	@echo "  stop          - Stop all services"
	@echo "  restart       - Restart development services"

# Initial setup
setup:
	@chmod +x setup.sh
	@./setup.sh

# Development mode (full app)
dev:
	@echo "Starting full development environment..."
	@docker-compose up app-dev

# Backend only (for local frontend development)
backend:
	@echo "Starting backend-only development environment..."
	@docker-compose up backend-dev

# Production mode
prod:
	@echo "Starting production environment..."
	@docker-compose --profile production up app

# Build all images
build:
	@echo "Building all Docker images..."
	@docker-compose build

# Build development images only
build-dev:
	@echo "Building development images..."
	@docker-compose build backend-dev app-dev

# Build production images only
build-prod:
	@echo "Building production images..."
	@docker-compose build app

# Clean up containers and volumes
clean:
	@echo "Cleaning up containers and volumes..."
	@docker-compose down -v
	@docker system prune -f

# Clean up volumes only
clean-volumes:
	@echo "Cleaning up volumes..."
	@docker-compose down
	@docker volume rm $$(docker volume ls -q | grep -E "(whisper-models|uploads-data)") 2>/dev/null || true

# Show all logs
logs:
	@docker-compose logs -f

# Show backend-only logs
logs-backend:
	@docker-compose logs -f backend-dev

# Show full dev logs
logs-dev:
	@docker-compose logs -f app-dev

# Show production logs
logs-prod:
	@docker-compose --profile production logs -f app

# Open shell in running dev container
shell:
	@docker-compose exec app-dev sh

# Open shell in backend container
shell-backend:
	@docker-compose exec backend-dev sh

# Open shell in production container
shell-prod:
	@docker-compose --profile production exec app sh

# Run tests
test:
	@echo "Running tests..."
	@if docker-compose ps app-dev | grep -q "Up"; then \
		docker-compose exec app-dev npm test; \
	elif docker-compose ps backend-dev | grep -q "Up"; then \
		docker-compose exec backend-dev npm test; \
	else \
		echo "No running development containers found. Start with 'make dev' or 'make backend' first."; \
	fi

# Check service health status
health:
	@echo "Checking service health..."
	@docker-compose ps

# Show running containers status
status:
	@echo "Container status:"
	@docker-compose ps
	@echo ""
	@echo "Volume status:"
	@docker volume ls | grep -E "(whisper-models|uploads-data)" || echo "No project volumes found"

# Stop all services
stop:
	@echo "Stopping all services..."
	@docker-compose down
	@docker-compose --profile production down

# Restart development services
restart: stop dev

# Restart backend only
restart-backend: stop backend

# Restart production
restart-prod:
	@docker-compose --profile production down
	@make prod