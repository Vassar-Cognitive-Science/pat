#!/bin/bash

# Pat Chatbot - Production Deployment Script
# This script automates the entire production deployment process

set -e  # Exit on any error

echo "🚀 Pat Chatbot Production Deployment"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed and running
check_docker() {
    print_status "Checking Docker installation..."
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker daemon is not running. Please start Docker."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose."
        exit 1
    fi
    
    print_success "Docker is ready"
}

# Setup environment file
setup_environment() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f .env ]; then
        if [ -f .env.template ]; then
            cp .env.template .env
            print_success "Created .env file from template"
            print_warning "Please edit .env file and set your OPENAI_API_KEY and POSTGRES_PASSWORD"
            print_warning "Then run this script again."
            exit 0
        else
            print_error ".env.template not found"
            exit 1
        fi
    fi
    
    # Validate required environment variables
    source .env
    
    if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
        print_error "OPENAI_API_KEY not set in .env file"
        exit 1
    fi
    
    if [ -z "$POSTGRES_PASSWORD" ] || [ "$POSTGRES_PASSWORD" = "your_secure_production_password_here" ]; then
        print_error "POSTGRES_PASSWORD not set in .env file"
        exit 1
    fi
    
    print_success "Environment configuration validated"
}

# Create data directory if it doesn't exist
setup_directories() {
    print_status "Setting up directories..."
    mkdir -p data
    print_success "Directories created"
}

# Stop existing deployment
stop_existing() {
    print_status "Stopping any existing deployment..."
    docker-compose -f docker-compose.production.yml down --remove-orphans 2>/dev/null || true
    print_success "Cleaned up existing deployment"
}

# Deploy application
deploy_app() {
    print_status "Starting production deployment..."
    docker-compose -f docker-compose.production.yml up -d --build
    
    # Wait for services to be ready
    print_status "Waiting for services to start..."
    sleep 10
    
    # Check if app is responding
    for i in {1..30}; do
        if curl -f http://127.0.0.1:3000 &> /dev/null; then
            print_success "Application is running"
            break
        fi
        if [ $i -eq 30 ]; then
            print_error "Application failed to start"
            docker-compose -f docker-compose.production.yml logs app
            exit 1
        fi
        sleep 2
    done
}

# Seed database (optional)
seed_database() {
    print_status "Database seeding is optional. Do you want to seed the database now? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Starting database seeding..."
        docker-compose -f docker-compose.production.yml --profile seeding up seeder
        print_success "Database seeded successfully"
    else
        print_status "Skipping database seeding. You can run it later with:"
        echo "docker-compose -f docker-compose.production.yml --profile seeding up seeder"
    fi
}

# Setup nginx configuration
setup_nginx() {
    print_status "Setting up Nginx configuration..."
    
    if [ -f nginx.conf ]; then
        print_status "Nginx configuration file found. To integrate with system nginx:"
        echo ""
        echo "1. Copy nginx.conf to your nginx sites directory:"
        echo "   sudo cp nginx.conf /etc/nginx/sites-available/pat"
        echo ""
        echo "2. Edit the file and replace 'your-domain.com' with your actual domain"
        echo ""
        echo "3. Enable the site:"
        echo "   sudo ln -s /etc/nginx/sites-available/pat /etc/nginx/sites-enabled/"
        echo ""
        echo "4. Test nginx configuration:"
        echo "   sudo nginx -t"
        echo ""
        echo "5. Reload nginx:"
        echo "   sudo systemctl reload nginx"
        echo ""
        print_success "Nginx setup instructions provided"
    else
        print_warning "nginx.conf file not found"
    fi
}

# Show deployment status
show_status() {
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "Application Status:"
    docker-compose -f docker-compose.production.yml ps
    echo ""
    print_status "Application is running on: http://127.0.0.1:3000"
    print_status "Configure your nginx reverse proxy to make it publicly accessible"
    echo ""
    print_status "Useful commands:"
    echo "  View logs: docker-compose -f docker-compose.production.yml logs -f"
    echo "  Stop app: docker-compose -f docker-compose.production.yml down"
    echo "  Restart: docker-compose -f docker-compose.production.yml restart"
    echo ""
}

# Main deployment flow
main() {
    check_docker
    setup_environment
    setup_directories
    stop_existing
    deploy_app
    seed_database
    setup_nginx
    show_status
}

# Run main function
main "$@"