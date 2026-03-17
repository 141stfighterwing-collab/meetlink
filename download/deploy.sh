#!/bin/bash

# MeetLink GitHub Deployment Automation Script
# Version: 1.0.0
# Description: Automates the complete setup and deployment of MeetLink

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Version
VERSION="1.0.0"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Print colored output
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }
print_warning() { echo -e "${YELLOW}! $1${NC}"; }
print_info() { echo -e "${CYAN}ℹ $1${NC}"; }
print_header() { echo -e "\n${BLUE}═══════════════════════════════════════════${NC}\n${BLUE}  $1${NC}\n${BLUE}═══════════════════════════════════════════${NC}\n"; }

# Show banner
show_banner() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║     ██████╗ ███╗   ██╗██╗██╗     ██████╗ ██████╗  █████╗  ║
║    ██╔════╝ ████╗  ██║██║██║     ██╔══██╗██╔══██╗██╔══██╗ ║
║    ██║  ███╗██╔██╗ ██║██║██║     ██║  ██║██████╔╝███████║ ║
║    ██║   ██║██║╚██╗██║██║██║     ██║  ██║██╔══██╗██╔══██║ ║
║    ╚██████╔╝██║ ╚████║██║███████╗██████╔╝██║  ██║██║  ██║ ║
║     ╚═════╝ ╚═╝  ╚═══╝╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ║
║                                                           ║
║        Self-Hosted Scheduling Platform                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo -e "  ${YELLOW}Deployment Automation Script v${VERSION}${NC}\n"
}

# Check prerequisites
check_prerequisites() {
    print_header "Checking Prerequisites"
    
    local errors=0
    
    # Check Docker
    if command -v docker &> /dev/null; then
        print_success "Docker is installed: $(docker --version)"
    else
        print_error "Docker is not installed"
        print_info "Install from: https://docs.docker.com/get-docker/"
        ((errors++))
    fi
    
    # Check Docker Compose
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is installed: $(docker-compose --version)"
    elif docker compose version &> /dev/null; then
        print_success "Docker Compose (plugin) is installed"
    else
        print_error "Docker Compose is not installed"
        ((errors++))
    fi
    
    # Check Git
    if command -v git &> /dev/null; then
        print_success "Git is installed: $(git --version)"
    else
        print_error "Git is not installed"
        ((errors++))
    fi
    
    # Check if Docker is running
    if docker info &> /dev/null; then
        print_success "Docker daemon is running"
    else
        print_error "Docker daemon is not running"
        print_info "Start Docker Desktop or the Docker service"
        ((errors++))
    fi
    
    if [ $errors -gt 0 ]; then
        print_error "\nPrerequisites check failed with $errors error(s)"
        exit 1
    fi
    
    print_success "\nAll prerequisites met!"
}

# Generate secure password
generate_password() {
    local length=${1:-24}
    openssl rand -base64 48 | tr -dc 'a-zA-Z0-9!@#$%^&*()' | head -c $length
}

# Generate secure secret
generate_secret() {
    openssl rand -hex 32
}

# Create environment file
create_env_file() {
    print_header "Creating Environment Configuration"
    
    local env_file=".env.production"
    
    # Generate secrets
    local postgres_password=$(generate_password)
    local nextauth_secret=$(generate_secret)
    local jwt_secret=$(generate_secret)
    local encryption_key=$(generate_secret)
    
    # Get user input
    read -p "$(echo -e ${CYAN}Enter domain (e.g., meetlink.yourdomain.com): ${NC})" domain
    domain=${domain:-localhost:3000}
    
    read -p "$(echo -e ${CYAN}Enter your email (for admin): ${NC})" admin_email
    admin_email=${admin_email:-admin@example.com}
    
    # Determine protocol
    local protocol="http"
    if [[ $domain != localhost* ]]; then
        protocol="https"
    fi
    
    cat > "$env_file" << EOF
# MeetLink Environment Configuration
# Generated on $(date)
# WARNING: Keep this file secure and never commit to version control!

# ============================================
# PostgreSQL Database
# ============================================
POSTGRES_USER=meetlink
POSTGRES_PASSWORD=${postgres_password}
POSTGRES_DB=meetlink
POSTGRES_PORT=5432

# ============================================
# Application
# ============================================
APP_PORT=3000
NEXT_PUBLIC_APP_URL=${protocol}://${domain}
NEXT_PUBLIC_APP_NAME=MeetLink

# ============================================
# Authentication
# ============================================
NEXTAUTH_SECRET=${nextauth_secret}
NEXTAUTH_URL=${protocol}://${domain}
JWT_SECRET=${jwt_secret}
ENCRYPTION_KEY=${encryption_key}

# ============================================
# Database URL (internal Docker network)
# ============================================
DATABASE_URL=postgresql://meetlink:${postgres_password}@postgres:5432/meetlink

# ============================================
# Email Configuration (Optional)
# ============================================
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@${domain}

# ============================================
# OAuth Providers (Optional)
# ============================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AZURE_AD_CLIENT_ID=
AZURE_AD_CLIENT_SECRET=
AZURE_AD_TENANT_ID=

# ============================================
# Video Conferencing (Optional)
# ============================================
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
TEAMS_CLIENT_ID=
TEAMS_CLIENT_SECRET=

# ============================================
# Logging
# ============================================
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
EOF
    
    print_success "Created $env_file"
    print_warning "Store these credentials securely!"
    
    echo -e "\n${YELLOW}Generated Credentials:${NC}"
    echo -e "  Database Password: ${GREEN}${postgres_password}${NC}"
    echo -e "  NextAuth Secret:   ${GREEN}${nextauth_secret}${NC}"
}

# Clone repository
clone_repository() {
    print_header "Cloning MeetLink Repository"
    
    local repo_url="https://github.com/141stfighterwing-collab/meetlink.git"
    local target_dir="meetlink"
    
    if [ -d "$target_dir" ]; then
        print_warning "Directory '$target_dir' already exists"
        read -p "Remove and re-clone? (y/N): " confirm
        if [[ $confirm == [yY] ]]; then
            rm -rf "$target_dir"
        else
            print_info "Using existing directory"
            cd "$target_dir"
            return
        fi
    fi
    
    print_info "Cloning from $repo_url"
    git clone "$repo_url" "$target_dir"
    cd "$target_dir"
    print_success "Repository cloned successfully"
}

# Deploy with Docker
deploy_docker() {
    print_header "Deploying with Docker"
    
    # Copy environment file if needed
    if [ ! -f ".env.production" ]; then
        create_env_file
    fi
    
    # Pull images
    print_info "Pulling Docker images..."
    docker-compose pull 2>/dev/null || docker compose pull
    
    # Build and start services
    print_info "Building and starting services..."
    docker-compose up -d --build 2>/dev/null || docker compose up -d --build
    
    # Wait for services
    print_info "Waiting for services to be ready..."
    sleep 10
    
    # Check status
    print_info "Service status:"
    docker-compose ps 2>/dev/null || docker compose ps
    
    print_success "\nDeployment complete!"
}

# Run database migrations
run_migrations() {
    print_header "Running Database Migrations"
    
    print_info "Waiting for PostgreSQL..."
    sleep 5
    
    print_info "Running Prisma migrations..."
    docker-compose exec app npx prisma migrate deploy 2>/dev/null || \
    docker compose exec app npx prisma migrate deploy
    
    print_success "Database migrations completed"
}

# Show deployment summary
show_summary() {
    local domain=$(grep NEXT_PUBLIC_APP_URL .env.production 2>/dev/null | cut -d'=' -f2)
    domain=${domain:-"http://localhost:3000"}
    
    print_header "Deployment Summary"
    
    echo -e "${GREEN}MeetLink has been deployed successfully!${NC}\n"
    echo -e "  ${CYAN}Access URL:${NC}        ${domain}"
    echo -e "  ${CYAN}Repository:${NC}        https://github.com/141stfighterwing-collab/meetlink"
    echo -e "\n${YELLOW}Useful Commands:${NC}"
    echo -e "  View logs:     docker-compose logs -f"
    echo -e "  Stop:          docker-compose down"
    echo -e "  Restart:       docker-compose restart"
    echo -e "  Remove all:    docker-compose down -v"
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo -e "  1. Access the application at ${domain}"
    echo -e "  2. Create your admin account"
    echo -e "  3. Configure calendar integrations"
    echo -e "  4. Set up event types"
}

# Full deployment
full_deployment() {
    show_banner
    check_prerequisites
    clone_repository
    create_env_file
    deploy_docker
    run_migrations
    show_summary
}

# Quick update
quick_update() {
    print_header "Quick Update"
    
    if [ -d "meetlink" ]; then
        cd meetlink
    fi
    
    print_info "Pulling latest changes..."
    git pull origin main
    
    print_info "Rebuilding containers..."
    docker-compose down 2>/dev/null || docker compose down
    docker-compose up -d --build 2>/dev/null || docker compose up -d --build
    
    print_success "Update complete!"
}

# Show help
show_help() {
    show_banner
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  deploy      Full deployment (clone, configure, deploy)"
    echo "  update      Quick update (pull, rebuild)"
    echo "  env         Create environment file only"
    echo "  logs        View application logs"
    echo "  stop        Stop all services"
    echo "  start       Start all services"
    echo "  restart     Restart all services"
    echo "  status      Show service status"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy     # Full fresh deployment"
    echo "  $0 update     # Update existing deployment"
    echo "  $0 logs       # View live logs"
}

# Main script
case "${1:-deploy}" in
    deploy)
        full_deployment
        ;;
    update)
        quick_update
        ;;
    env)
        create_env_file
        ;;
    logs)
        docker-compose logs -f 2>/dev/null || docker compose logs -f
        ;;
    stop)
        docker-compose down 2>/dev/null || docker compose down
        print_success "Services stopped"
        ;;
    start)
        docker-compose up -d 2>/dev/null || docker compose up -d
        print_success "Services started"
        ;;
    restart)
        docker-compose restart 2>/dev/null || docker compose restart
        print_success "Services restarted"
        ;;
    status)
        docker-compose ps 2>/dev/null || docker compose ps
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
