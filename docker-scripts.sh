#!/bin/bash

# Docker Scripts for Express E-commerce API
# Usage: ./docker-scripts.sh [command]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_color() {
    printf "${1}${2}${NC}\n"
}

# Print help information
print_help() {
    echo "Express E-commerce API Docker Scripts"
    echo ""
    echo "Usage: ./docker-scripts.sh [command]"
    echo ""
    echo "Commands:"
    echo "  dev           - Start development environment"
    echo "  prod          - Start production environment"
    echo "  stop          - Stop all containers"
    echo "  restart       - Restart all containers"
    echo "  build         - Build Docker images"
    echo "  clean         - Clean up containers and images"
    echo "  logs          - Show container logs"
    echo "  shell         - Access app container shell"
    echo "  db-shell      - Access MySQL shell"
    echo "  redis-shell   - Access Redis shell"
    echo "  migrate       - Run database migrations"
    echo "  seed          - Run database seeding"
    echo "  backup        - Backup database"
    echo "  restore       - Restore database"
    echo "  status        - Show container status"
    echo "  init          - Initialize project"
    echo "  monitor       - Monitor containers"
    echo "  test          - Run tests"
    echo "  update        - Update dependencies"
    echo "  help          - Show this help message"
}

# Start development environment
start_dev() {
    print_color $GREEN "Starting development environment..."
    
    # Copy environment file if it doesn't exist
    if [ ! -f .env ]; then
        print_color $YELLOW "Copying .env.docker to .env..."
        cp .env.docker .env
    fi
    
    # Build and start containers
    docker-compose up -d --build
    
    print_color $GREEN "Development environment started!"
    print_color $BLUE "API: http://localhost:3000"
    print_color $BLUE "phpMyAdmin: http://localhost:8080"
    print_color $BLUE "Redis Commander: http://localhost:8081"
}

# Start production environment
start_prod() {
    print_color $GREEN "Starting production environment..."
    
    # Check if production env exists
    if [ ! -f .env.production ]; then
        print_color $RED "Error: .env.production file not found!"
        print_color $YELLOW "Please create .env.production with production settings"
        exit 1
    fi
    
    # Use production environment
    cp .env.production .env
    
    # Build and start containers
    docker-compose -f docker-compose.prod.yml up -d --build
    
    print_color $GREEN "Production environment started!"
    print_color $BLUE "API: http://localhost:3000"
    print_color $BLUE "Grafana: http://localhost:3001"
    print_color $BLUE "Prometheus: http://localhost:9090"
}

# Stop all containers
stop_containers() {
    print_color $YELLOW "Stopping containers..."
    docker-compose down
    docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
    print_color $GREEN "Containers stopped!"
}

# Restart containers
restart_containers() {
    print_color $YELLOW "Restarting containers..."
    stop_containers
    sleep 2
    start_dev
}

# Build Docker images
build_images() {
    print_color $YELLOW "Building Docker images..."
    docker-compose build --no-cache
    print_color $GREEN "Images built successfully!"
}

# Clean up containers and images
clean_docker() {
    print_color $YELLOW "Cleaning up Docker resources..."
    
    # Stop containers
    stop_containers
    
    # Remove containers
    docker-compose rm -f
    
    # Remove images
    docker rmi $(docker images express-ecom* -q) 2>/dev/null || true
    
    # Remove unused volumes (optional)
    read -p "Remove unused volumes? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker volume prune -f
    fi
    
    # Remove unused networks
    docker network prune -f
    
    print_color $GREEN "Cleanup completed!"
}

# Show container logs
show_logs() {
    if [ -z "$2" ]; then
        print_color $BLUE "Showing logs for all containers..."
        docker-compose logs -f
    else
        print_color $BLUE "Showing logs for $2..."
        docker-compose logs -f "$2"
    fi
}

# Access app container shell
app_shell() {
    print_color $BLUE "Accessing app container shell..."
    docker-compose exec app sh
}

# Access MySQL shell
db_shell() {
    print_color $BLUE "Accessing MySQL shell..."
    docker-compose exec mysql mysql -u root -p
}

# Access Redis shell
redis_shell() {
    print_color $BLUE "Accessing Redis shell..."
    docker-compose exec redis redis-cli
}

# Run database migrations
run_migrations() {
    print_color $YELLOW "Running database migrations..."
    docker-compose exec app npm run migrate
    print_color $GREEN "Migrations completed!"
}

# Run database seeding
run_seeding() {
    print_color $YELLOW "Running database seeding..."
    docker-compose exec app npm run seed
    print_color $GREEN "Seeding completed!"
}

# Backup database
backup_database() {
    print_color $YELLOW "Creating database backup..."
    
    # Create backup directory
    mkdir -p backups
    
    # Get current date for filename
    BACKUP_FILE="backups/express_ecom_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    # Create backup
    docker-compose exec -T mysql mysqldump -u root -ppassword express_ecom_dev > "$BACKUP_FILE"
    
    print_color $GREEN "Database backup created: $BACKUP_FILE"
}

# Restore database
restore_database() {
    if [ -z "$2" ]; then
        print_color $RED "Error: Please specify backup file"
        print_color $YELLOW "Usage: ./docker-scripts.sh restore [backup_file.sql]"
        exit 1
    fi
    
    if [ ! -f "$2" ]; then
        print_color $RED "Error: Backup file $2 not found!"
        exit 1
    fi
    
    print_color $YELLOW "Restoring database from $2..."
    
    # Restore backup
    docker-compose exec -T mysql mysql -u root -ppassword express_ecom_dev < "$2"
    
    print_color $GREEN "Database restored successfully!"
}

# Show container status
show_status() {
    print_color $BLUE "Container Status:"
    docker-compose ps
    
    echo ""
    print_color $BLUE "Docker Images:"
    docker images | grep express-ecom
    
    echo ""
    print_color $BLUE "Docker Volumes:"
    docker volume ls | grep express-ecom
}

# Initialize project
init_project() {
    print_color $GREEN "Initializing Express E-commerce API..."
    
    # Create necessary directories
    mkdir -p storage/uploads storage/logs nginx/ssl database/init
    
    # Create .gitkeep files
    touch storage/uploads/.gitkeep storage/logs/.gitkeep
    
    # Copy environment file
    if [ ! -f .env ]; then
        cp .env.docker .env
        print_color $YELLOW "Environment file created. Please update .env with your settings."
    fi
    
    # Make script executable
    chmod +x docker-scripts.sh
    
    print_color $GREEN "Project initialized successfully!"
    print_color $BLUE "Next steps:"
    print_color $BLUE "1. Update .env file with your configuration"
    print_color $BLUE "2. Run: ./docker-scripts.sh dev"
}

# Monitor containers
monitor_containers() {
    print_color $BLUE "Monitoring containers (Press Ctrl+C to stop)..."
    
    while true; do
        clear
        echo "=== Express E-commerce API - Container Monitor ==="
        echo "$(date)"
        echo ""
        
        # Container status
        print_color $GREEN "Container Status:"
        docker-compose ps
        
        echo ""
        
        # Resource usage
        print_color $GREEN "Resource Usage:"
        docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
        
        echo ""
        print_color $YELLOW "Refreshing in 5 seconds... (Press Ctrl+C to exit)"
        sleep 5
    done
}

# Run tests in container
run_tests() {
    print_color $YELLOW "Running tests in container..."
    docker-compose exec app npm test
}

# Update dependencies
update_deps() {
    print_color $YELLOW "Updating dependencies..."
    docker-compose exec app npm update
    docker-compose restart app
    print_color $GREEN "Dependencies updated!"
}

# Main script logic
case "$1" in
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "stop")
        stop_containers
        ;;
    "restart")
        restart_containers
        ;;
    "build")
        build_images
        ;;
    "clean")
        clean_docker
        ;;
    "logs")
        show_logs "$@"
        ;;
    "shell")
        app_shell
        ;;
    "db-shell")
        db_shell
        ;;
    "redis-shell")
        redis_shell
        ;;
    "migrate")
        run_migrations
        ;;
    "seed")
        run_seeding
        ;;
    "backup")
        backup_database
        ;;
    "restore")
        restore_database "$@"
        ;;
    "status")
        show_status
        ;;
    "init")
        init_project
        ;;
    "monitor")
        monitor_containers
        ;;
    "test")
        run_tests
        ;;
    "update")
        update_deps
        ;;
    "help"|"")
        print_help
        ;;
    *)
        print_color $RED "Unknown command: $1"
        print_help
        exit 1
        ;;
esac
