# Makefile for Express E-commerce API Docker Management
# Usage: make [target]

.PHONY: help init dev prod build up down restart clean logs shell db-shell redis-shell migrate seed backup restore status test

# Default target
.DEFAULT_GOAL := help

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_PROD = docker-compose -f docker-compose.prod.yml
APP_CONTAINER = app
DB_CONTAINER = mysql
REDIS_CONTAINER = redis

## Help target
help: ## Show this help message
	@echo "Express E-commerce API - Docker Management"
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

## Initialization
init: ## Initialize project structure and environment
	@echo "🚀 Initializing Express E-commerce API..."
	@mkdir -p storage/uploads storage/logs nginx/ssl database/init
	@touch storage/uploads/.gitkeep storage/logs/.gitkeep
	@if [ ! -f .env ]; then \
		cp .env.docker .env; \
		echo "📝 Environment file created. Please update .env with your settings."; \
	fi
	@chmod +x docker-scripts.sh
	@echo "✅ Project initialized successfully!"

## Development Environment
dev: ## Start development environment
	@echo "🔧 Starting development environment..."
	@if [ ! -f .env ]; then cp .env.docker .env; fi
	@$(DOCKER_COMPOSE) up -d --build
	@echo "✅ Development environment started!"
	@echo "🌐 API: http://localhost:3000"
	@echo "🗄️  phpMyAdmin: http://localhost:8080"
	@echo "🔴 Redis Commander: http://localhost:8081"

## Production Environment
prod: ## Start production environment
	@echo "🏭 Starting production environment..."
	@if [ ! -f .env.production ]; then \
		echo "❌ Error: .env.production file not found!"; \
		echo "📝 Please create .env.production with production settings"; \
		exit 1; \
	fi
	@cp .env.production .env
	@$(DOCKER_COMPOSE_PROD) up -d --build
	@echo "✅ Production environment started!"

## Build
build: ## Build Docker images
	@echo "🔨 Building Docker images..."
	@$(DOCKER_COMPOSE) build --no-cache
	@echo "✅ Images built successfully!"

## Container Management
up: dev ## Alias for dev target

down: ## Stop all containers
	@echo "🛑 Stopping containers..."
	@$(DOCKER_COMPOSE) down
	@$(DOCKER_COMPOSE_PROD) down 2>/dev/null || true
	@echo "✅ Containers stopped!"

restart: ## Restart all containers
	@echo "🔄 Restarting containers..."
	@$(MAKE) down
	@sleep 2
	@$(MAKE) dev

## Cleanup
clean: ## Clean up containers, images, and volumes
	@echo "🧹 Cleaning up Docker resources..."
	@$(MAKE) down
	@$(DOCKER_COMPOSE) rm -f
	@docker rmi $$(docker images express-ecom* -q) 2>/dev/null || true
	@echo "🗑️  Remove unused volumes? [y/N] " && read ans && [ $${ans:-N} = y ]
	@docker volume prune -f
	@docker network prune -f
	@echo "✅ Cleanup completed!"

## Logging and Monitoring
logs: ## Show container logs
	@echo "📋 Showing logs for all containers..."
	@$(DOCKER_COMPOSE) logs -f

logs-app: ## Show app container logs
	@echo "📋 Showing logs for app container..."
	@$(DOCKER_COMPOSE) logs -f $(APP_CONTAINER)

logs-db: ## Show database container logs
	@echo "📋 Showing logs for database container..."
	@$(DOCKER_COMPOSE) logs -f $(DB_CONTAINER)

logs-redis: ## Show Redis container logs
	@echo "📋 Showing logs for Redis container..."
	@$(DOCKER_COMPOSE) logs -f $(REDIS_CONTAINER)

status: ## Show container status
	@echo "📊 Container Status:"
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "🐳 Docker Images:"
	@docker images | grep express-ecom || echo "No express-ecom images found"
	@echo ""
	@echo "💾 Docker Volumes:"
	@docker volume ls | grep express-ecom || echo "No express-ecom volumes found"

## Container Access
shell: ## Access app container shell
	@echo "🐚 Accessing app container shell..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) sh

db-shell: ## Access MySQL shell
	@echo "🗄️  Accessing MySQL shell..."
	@$(DOCKER_COMPOSE) exec $(DB_CONTAINER) mysql -u root -p

redis-shell: ## Access Redis shell
	@echo "🔴 Accessing Redis shell..."
	@$(DOCKER_COMPOSE) exec $(REDIS_CONTAINER) redis-cli

## Database Operations
migrate: ## Run database migrations
	@echo "🔄 Running database migrations..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run migrate
	@echo "✅ Migrations completed!"

seed: ## Run database seeding
	@echo "🌱 Running database seeding..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run seed
	@echo "✅ Seeding completed!"

migrate-undo: ## Undo last migration
	@echo "↩️  Undoing last migration..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run migrate:undo
	@echo "✅ Migration undone!"

seed-undo: ## Undo all seeding
	@echo "🧹 Undoing all seeding..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run seed:undo
	@echo "✅ Seeding undone!"

## Backup and Restore
backup: ## Backup database
	@echo "💾 Creating database backup..."
	@mkdir -p backups
	@$(eval BACKUP_FILE := backups/express_ecom_backup_$(shell date +%Y%m%d_%H%M%S).sql)
	@$(DOCKER_COMPOSE) exec -T $(DB_CONTAINER) mysqldump -u root -ppassword express_ecom_dev > $(BACKUP_FILE)
	@echo "✅ Database backup created: $(BACKUP_FILE)"

restore: ## Restore database (usage: make restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "❌ Error: Please specify backup file"; \
		echo "📝 Usage: make restore FILE=backup.sql"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "❌ Error: Backup file $(FILE) not found!"; \
		exit 1; \
	fi
	@echo "📥 Restoring database from $(FILE)..."
	@$(DOCKER_COMPOSE) exec -T $(DB_CONTAINER) mysql -u root -ppassword express_ecom_dev < $(FILE)
	@echo "✅ Database restored successfully!"

## Testing and Development
test: ## Run tests in container
	@echo "🧪 Running tests in container..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm test

test-watch: ## Run tests in watch mode
	@echo "👀 Running tests in watch mode..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run test:watch

test-coverage: ## Run tests with coverage
	@echo "📊 Running tests with coverage..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run test:coverage

lint: ## Run linting
	@echo "🔍 Running linting..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run lint

lint-fix: ## Fix linting issues
	@echo "🔧 Fixing linting issues..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run lint:fix

format: ## Format code
	@echo "💅 Formatting code..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run format

## Dependencies
install: ## Install dependencies
	@echo "📦 Installing dependencies..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm install
	@echo "✅ Dependencies installed!"

update: ## Update dependencies
	@echo "⬆️  Updating dependencies..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm update
	@$(DOCKER_COMPOSE) restart $(APP_CONTAINER)
	@echo "✅ Dependencies updated!"

## Monitoring
monitor: ## Monitor containers (real-time stats)
	@echo "📊 Monitoring containers (Press Ctrl+C to stop)..."
	@watch -n 2 'docker stats --no-stream'

ps: ## Show running containers
	@$(DOCKER_COMPOSE) ps

top: ## Show container processes
	@$(DOCKER_COMPOSE) top

## Development Utilities
fresh: ## Fresh start (clean + build + dev)
	@echo "🆕 Fresh start..."
	@$(MAKE) clean
	@$(MAKE) build
	@$(MAKE) dev

reset-db: ## Reset database (drop + migrate + seed)
	@echo "🔄 Resetting database..."
	@$(MAKE) migrate-undo
	@$(MAKE) migrate
	@$(MAKE) seed
	@echo "✅ Database reset completed!"

health: ## Check container health
	@echo "🏥 Checking container health..."
	@curl -f http://localhost:3000/health || echo "❌ Health check failed"

## Docker System
docker-clean: ## Clean Docker system
	@echo "🧹 Cleaning Docker system..."
	@docker system prune -f
	@docker volume prune -f
	@docker network prune -f
	@echo "✅ Docker system cleaned!"

docker-info: ## Show Docker system information
	@echo "ℹ️  Docker System Information:"
	@docker system df
	@echo ""
	@docker system info --format "{{.ServerVersion}}"

## Quick Actions
quick-start: init dev ## Quick start (init + dev)

quick-test: ## Quick test (build + test)
	@$(MAKE) build
	@$(MAKE) test

quick-deploy: ## Quick deploy to production
	@$(MAKE) build
	@$(MAKE) prod

## Documentation
docs: ## Generate API documentation
	@echo "📚 Generating API documentation..."
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) npm run docs
	@echo "✅ Documentation generated!"

## Environment Management
env-dev: ## Switch to development environment
	@cp .env.docker .env
	@echo "🔧 Switched to development environment"

env-prod: ## Switch to production environment
	@if [ -f .env.production ]; then \
		cp .env.production .env; \
		echo "🏭 Switched to production environment"; \
	else \
		echo "❌ .env.production file not found!"; \
		exit 1; \
	fi

env-show: ## Show current environment variables
	@echo "🔍 Current environment variables:"
	@$(DOCKER_COMPOSE) exec $(APP_CONTAINER) env | grep -E "(NODE_ENV|DB_|REDIS_|JWT_)" | sort
