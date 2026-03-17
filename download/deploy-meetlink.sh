#!/bin/bash

# MeetLink 1-Click Deployment Script for Linux/macOS
# Version: 2.0.0
# Description: Complete automated deployment with PostgreSQL setup, progress tracking, and detailed logging
# Author: MeetLink Team
# License: MIT

set -e

# ============================================================================
# CONFIGURATION
# ============================================================================

SCRIPT_VERSION="2.0.0"
MEETLINK_VERSION="1.0.0"
REPO_URL="https://github.com/141stfighterwing-collab/meetlink.git"
INSTALL_DIR="${INSTALL_DIR:-/opt/meetlink}"
LOG_DIR=""
LOG_FILE=""
ERROR_LOG_FILE=""
START_TIME=$(date +%s)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Progress tracking
CURRENT_STEP=0
TOTAL_STEPS=20
ERRORS=()
WARNINGS=()

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

init_logging() {
    LOG_DIR="$INSTALL_DIR/logs"
    mkdir -p "$LOG_DIR"
    
    TIMESTAMP=$(date +%Y%m%d-%H%M%S)
    LOG_FILE="$LOG_DIR/deploy-$TIMESTAMP.log"
    ERROR_LOG_FILE="$LOG_DIR/errors-$TIMESTAMP.log"
    
    # Initialize log file with header
    cat > "$LOG_FILE" << EOF
================================================================================
MeetLink Deployment Log
================================================================================
Script Version:    $SCRIPT_VERSION
MeetLink Version:  $MEETLINK_VERSION
Start Time:        $(date '+%Y-%m-%d %H:%M:%S')
Install Path:      $INSTALL_DIR
User:              $(whoami)
OS:                $(uname -a)
================================================================================

EOF
}

log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    local log_entry="[$timestamp] [$level] $message"
    
    # Add to log file
    echo "$log_entry" >> "$LOG_FILE"
    
    # Console output with colors
    case $level in
        "INFO")
            echo -e "${CYAN}[$timestamp] [INFO]${NC} $message"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[$timestamp] [SUCCESS]${NC} $message"
            ;;
        "WARNING")
            echo -e "${YELLOW}[$timestamp] [WARNING]${NC} $message"
            WARNINGS+=("$message")
            ;;
        "ERROR")
            echo -e "${RED}[$timestamp] [ERROR]${NC} $message"
            ERRORS+=("$message")
            echo "$log_entry" >> "$ERROR_LOG_FILE"
            ;;
        "DEBUG")
            echo -e "${WHITE}[$timestamp] [DEBUG]${NC} $message"
            ;;
        "PROGRESS")
            local percent=$3
            local filled=$((percent / 5))
            local empty=$((20 - filled))
            local bar=$(printf '%*s' "$filled" | tr ' ' '=')
            local spaces=$(printf '%*s' "$empty")
            echo -e "${WHITE}[$timestamp] [${bar}${spaces}] ${percent}%${NC} - $message"
            ;;
    esac
}

log_progress() {
    local step_name="$1"
    local message="${2:-}"
    
    CURRENT_STEP=$((CURRENT_STEP + 1))
    local percent=$(( (CURRENT_STEP * 100) / TOTAL_STEPS ))
    
    if [ -n "$message" ]; then
        log "PROGRESS" "$step_name - $message" $percent
    else
        log "PROGRESS" "$step_name" $percent
    fi
}

print_header() {
    local title="$1"
    echo ""
    echo -e "${BLUE}============================================================${NC}"
    echo -e "${BLUE}  $title${NC}"
    echo -e "${BLUE}============================================================${NC}"
    echo ""
    
    echo "" >> "$LOG_FILE"
    echo "============================================================" >> "$LOG_FILE"
    echo "  $title" >> "$LOG_FILE"
    echo "============================================================" >> "$LOG_FILE"
    echo "" >> "$LOG_FILE"
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

check_root() {
    if [ "$EUID" -ne 0 ] && [ "$INSTALL_DIR" = "/opt/meetlink" ]; then
        log "WARNING" "Not running as root. Using home directory instead."
        INSTALL_DIR="$HOME/meetlink"
        log "INFO" "Install directory changed to: $INSTALL_DIR"
    fi
}

generate_password() {
    local length="${1:-24}"
    openssl rand -base64 48 | tr -dc 'a-zA-Z0-9!@#$%^&*()_+-=' | head -c "$length"
}

generate_secret() {
    openssl rand -hex 32
}

retry_command() {
    local max_attempts="$1"
    local delay="$2"
    local command="${@:3}"
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if eval "$command"; then
            return 0
        fi
        
        if [ $attempt -lt $max_attempts ]; then
            log "WARNING" "Command failed, attempt $attempt/$max_attempts. Retrying in ${delay}s..."
            sleep "$delay"
        fi
        
        attempt=$((attempt + 1))
    done
    
    return 1
}

# ============================================================================
# DEPLOYMENT FUNCTIONS
# ============================================================================

show_banner() {
    clear
    echo -e "${CYAN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}║     ██████╗ ███╗   ██╗██╗██╗     ██████╗ ██████╗  █████╗  ║${NC}"
    echo -e "${CYAN}║    ██╔════╝ ████╗  ██║██║██║     ██╔══██╗██╔══██╗██╔══██╗ ║${NC}"
    echo -e "${CYAN}║    ██║  ███╗██╔██╗ ██║██║██║     ██║  ██║██████╔╝███████║ ║${NC}"
    echo -e "${CYAN}║    ██║   ██║██║╚██╗██║██║██║     ██║  ██║██╔══██╗██╔══██║ ║${NC}"
    echo -e "${CYAN}║    ╚██████╔╝██║ ╚████║██║███████╗██████╔╝██║  ██║██║  ██║ ║${NC}"
    echo -e "${CYAN}║     ╚═════╝ ╚═╝  ╚═══╝╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ║${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}║        Self-Hosted Scheduling Platform                    ║${NC}"
    echo -e "${CYAN}║                                                           ║${NC}"
    echo -e "${CYAN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}  1-Click Deployment Script v$SCRIPT_VERSION${NC}"
    echo -e "${WHITE}  MeetLink v$MEETLINK_VERSION${NC}"
    echo ""
}

check_prerequisites() {
    print_header "Step 1: Checking Prerequisites"
    log_progress "Prerequisites Check"
    
    local issues=0
    
    # Check Docker
    log "INFO" "Checking Docker installation..."
    if command -v docker &> /dev/null; then
        local docker_version=$(docker --version)
        log "SUCCESS" "Docker installed: $docker_version"
    else
        log "ERROR" "Docker is not installed"
        log "INFO" "Install from: https://docs.docker.com/get-docker/"
        issues=$((issues + 1))
    fi
    
    # Check Docker daemon
    log "INFO" "Checking Docker daemon..."
    if docker info &> /dev/null; then
        log "SUCCESS" "Docker daemon is running"
    else
        log "WARNING" "Docker daemon may not be running"
        issues=$((issues + 1))
    fi
    
    # Check Docker Compose
    log "INFO" "Checking Docker Compose..."
    if command -v docker-compose &> /dev/null; then
        local compose_version=$(docker-compose --version)
        log "SUCCESS" "Docker Compose installed: $compose_version"
    elif docker compose version &> /dev/null; then
        local compose_version=$(docker compose version)
        log "SUCCESS" "Docker Compose (plugin) installed: $compose_version"
    else
        log "ERROR" "Docker Compose is not installed"
        issues=$((issues + 1))
    fi
    
    # Check Git
    log "INFO" "Checking Git..."
    if command -v git &> /dev/null; then
        local git_version=$(git --version)
        log "SUCCESS" "Git installed: $git_version"
    else
        log "ERROR" "Git is not installed"
        issues=$((issues + 1))
    fi
    
    # Check available memory
    log "INFO" "Checking system resources..."
    if [ -f /proc/meminfo ]; then
        local total_mem=$(grep MemTotal /proc/meminfo | awk '{print int($2/1024/1024)}')
        log "INFO" "Total memory: ${total_mem}GB"
        if [ "$total_mem" -lt 4 ]; then
            log "WARNING" "Less than 4GB RAM may cause performance issues"
        fi
    fi
    
    # Check disk space
    local disk_free=$(df -BG "$INSTALL_DIR" 2>/dev/null | tail -1 | awk '{print $4}' | tr -d 'G')
    log "INFO" "Available disk space: ${disk_free}GB"
    if [ "${disk_free:-0}" -lt 10 ]; then
        log "WARNING" "Less than 10GB free disk space"
    fi
    
    if [ $issues -gt 0 ]; then
        log "ERROR" "Prerequisites check failed with $issues issue(s)"
        echo ""
        read -p "Continue anyway? (y/N): " continue
        if [ "$continue" != "y" ] && [ "$continue" != "Y" ]; then
            exit 1
        fi
    else
        log "SUCCESS" "All prerequisites met"
    fi
}

setup_installation_directory() {
    print_header "Step 2: Setting Up Installation Directory"
    log_progress "Installation Directory"
    
    log "INFO" "Target directory: $INSTALL_DIR"
    
    if [ -d "$INSTALL_DIR" ]; then
        log "WARNING" "Directory already exists: $INSTALL_DIR"
        read -p "Overwrite existing installation? (y/N): " overwrite
        if [ "$overwrite" = "y" ] || [ "$overwrite" = "Y" ]; then
            rm -rf "$INSTALL_DIR"
        fi
    fi
    
    mkdir -p "$INSTALL_DIR"
    log "SUCCESS" "Created directory: $INSTALL_DIR"
    
    # Create subdirectories
    mkdir -p "$INSTALL_DIR"/{logs,data,backups,ssl,config}
    log "DEBUG" "Created subdirectories"
    
    log "SUCCESS" "Installation directory ready"
}

get_credentials() {
    print_header "Step 3: Configuring Credentials"
    log_progress "Credential Configuration"
    
    echo ""
    echo -e "${YELLOW}DATABASE CREDENTIALS${NC}"
    echo "─────────────────────────────────────────"
    echo ""
    echo "Configure your PostgreSQL database credentials."
    echo ""
    
    # Username
    echo -e "Enter a username for the PostgreSQL database."
    echo -e "Default: ${GREEN}meetlink${NC}"
    echo ""
    read -p "Username: " DB_USERNAME
    DB_USERNAME="${DB_USERNAME:-meetlink}"
    log "INFO" "Database username: $DB_USERNAME"
    
    # Password
    echo ""
    echo -e "${YELLOW}DATABASE PASSWORD${NC}"
    echo "─────────────────────────────────────────"
    echo ""
    echo "Choose an option:"
    echo "  [1] Generate a secure random password (recommended)"
    echo "  [2] Enter a custom password"
    echo ""
    read -p "Option (1 or 2): " choice
    
    case $choice in
        1)
            echo ""
            echo "Select password length:"
            echo "  [1] 16 characters"
            echo "  [2] 20 characters (recommended)"
            echo "  [3] 24 characters"
            echo "  [4] 32 characters (maximum security)"
            echo ""
            read -p "Length (1-4): " length_choice
            
            case $length_choice in
                1) length=16 ;;
                2) length=20 ;;
                3) length=24 ;;
                4) length=32 ;;
                *) length=20 ;;
            esac
            
            DB_PASSWORD=$(generate_password "$length")
            echo ""
            echo -e "Generated Password: ${GREEN}$DB_PASSWORD${NC}"
            echo ""
            log "WARNING" "IMPORTANT: Save this password securely! It cannot be recovered."
            echo ""
            read -p "Have you saved the password? (y/N): " saved
            if [ "$saved" != "y" ] && [ "$saved" != "Y" ]; then
                echo "Password: $DB_PASSWORD"
                read -p "Ready to continue? (y/N): " ready
                if [ "$ready" != "y" ] && [ "$ready" != "Y" ]; then
                    log "ERROR" "Deployment cancelled."
                    exit 1
                fi
            fi
            ;;
        2)
            echo ""
            echo "Enter a custom password for the database."
            echo "  - At least 8 characters"
            echo "  - Mix of uppercase and lowercase letters"
            echo "  - At least one number"
            echo "  - At least one special character"
            echo ""
            read -s -p "Enter password: " DB_PASSWORD
            echo ""
            read -s -p "Confirm password: " confirm_password
            echo ""
            
            if [ "$DB_PASSWORD" != "$confirm_password" ]; then
                log "ERROR" "Passwords do not match."
                get_credentials
                return
            fi
            
            if [ ${#DB_PASSWORD} -lt 8 ]; then
                log "ERROR" "Password must be at least 8 characters."
                get_credentials
                return
            fi
            
            log "SUCCESS" "Password confirmed!"
            ;;
        *)
            log "WARNING" "Invalid option. Generating secure password..."
            DB_PASSWORD=$(generate_password 20)
            echo "Generated Password: $DB_PASSWORD"
            ;;
    esac
    
    # Domain
    echo ""
    echo -e "${YELLOW}APPLICATION SETTINGS${NC}"
    echo "─────────────────────────────────────────"
    echo ""
    echo "Enter your domain (e.g., meetlink.yourdomain.com)"
    echo "For local testing, use: localhost:3000"
    echo ""
    read -p "Domain: " DOMAIN
    DOMAIN="${DOMAIN:-localhost:3000}"
    
    # Admin email
    echo ""
    echo "Enter admin email for notifications"
    read -p "Admin Email: " ADMIN_EMAIL
    ADMIN_EMAIL="${ADMIN_EMAIL:-admin@example.com}"
}

clone_repository() {
    print_header "Step 4: Cloning Repository"
    log_progress "Repository Clone"
    
    local repo_dir="$INSTALL_DIR/meetlink"
    
    if [ -d "$repo_dir" ]; then
        log "INFO" "Repository already exists, pulling updates..."
        cd "$repo_dir"
        if git pull origin main; then
            log "SUCCESS" "Repository updated"
            return
        fi
    fi
    
    log "INFO" "Cloning from: $REPO_URL"
    
    if retry_command 3 5 "git clone $REPO_URL $repo_dir"; then
        log "SUCCESS" "Repository cloned successfully"
        cd "$repo_dir"
    else
        log "ERROR" "Failed to clone repository. Check network connection."
        exit 1
    fi
}

create_environment() {
    print_header "Step 5: Creating Environment Configuration"
    log_progress "Environment Setup"
    
    local repo_dir="$INSTALL_DIR/meetlink"
    local env_file="$repo_dir/.env.production"
    
    # Generate secrets
    local nextauth_secret=$(generate_secret)
    local jwt_secret=$(generate_secret)
    local encryption_key=$(generate_secret)
    
    # Determine protocol
    local protocol="http"
    if [[ "$DOMAIN" != localhost* ]]; then
        protocol="https"
    fi
    
    cat > "$env_file" << EOF
# MeetLink Environment Configuration
# Generated by deploy-meetlink.sh v$SCRIPT_VERSION
# Date: $(date '+%Y-%m-%d %H:%M:%S')
# WARNING: Keep this file secure and never commit to version control!

# ============================================
# PostgreSQL Database
# ============================================
POSTGRES_USER=$DB_USERNAME
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=meetlink
POSTGRES_PORT=5432

# ============================================
# Application
# ============================================
APP_PORT=3000
NEXT_PUBLIC_APP_URL=$protocol://$DOMAIN
NEXT_PUBLIC_APP_NAME=MeetLink
NODE_ENV=production

# ============================================
# Authentication & Security
# ============================================
NEXTAUTH_SECRET=$nextauth_secret
NEXTAUTH_URL=$protocol://$DOMAIN
JWT_SECRET=$jwt_secret
ENCRYPTION_KEY=$encryption_key

# ============================================
# Database URL (internal Docker network)
# ============================================
DATABASE_URL=postgresql://$DB_USERNAME:$DB_PASSWORD@postgres:5432/meetlink

# ============================================
# Redis Cache
# ============================================
REDIS_URL=redis://redis:6379

# ============================================
# Email Configuration (Configure as needed)
# ============================================
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@$DOMAIN

# ============================================
# OAuth Providers (Configure as needed)
# ============================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=

# ============================================
# Video Conferencing (Configure as needed)
# ============================================
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# ============================================
# Logging & Auditing
# ============================================
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
EOF
    
    # Copy to .env
    cp "$env_file" "$repo_dir/.env"
    
    log "SUCCESS" "Environment file created: $env_file"
    log "INFO" "Database Username: $DB_USERNAME"
    log "INFO" "Database Password: [HIDDEN]"
    log "INFO" "Application URL: $protocol://$DOMAIN"
    
    # Save credentials
    local cred_file="$INSTALL_DIR/config/credentials.txt"
    cat > "$cred_file" << EOF
MeetLink Credentials
====================
Generated: $(date '+%Y-%m-%d %H:%M:%S')

Database:
  Host: localhost
  Port: 5432
  Database: meetlink
  Username: $DB_USERNAME
  Password: $DB_PASSWORD

Application:
  URL: $protocol://$DOMAIN
  Admin Email: $ADMIN_EMAIL

IMPORTANT: Delete this file after saving credentials securely!
EOF
    
    log "WARNING" "Credentials saved to: $cred_file (Delete after saving!)"
}

deploy_docker() {
    print_header "Step 6: Deploying with Docker"
    
    local repo_dir="$INSTALL_DIR/meetlink"
    cd "$repo_dir"
    
    log_progress "Docker Setup" "Preparing configuration"
    
    # Create docker-compose.yml
    cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: meetlink-postgres
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: meetlink-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: meetlink-app
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
      - NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
      - REDIS_URL=${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF
    
    log "SUCCESS" "Docker Compose configuration created"
    
    # Pull images
    log_progress "Docker Images" "Pulling base images"
    log "INFO" "Pulling Docker images..."
    
    if command -v docker-compose &> /dev/null; then
        docker-compose pull || log "WARNING" "Some images may not have been pulled"
    else
        docker compose pull || log "WARNING" "Some images may not have been pulled"
    fi
    
    # Build and start
    log_progress "Docker Build" "Building containers"
    log "INFO" "Building and starting services..."
    
    if command -v docker-compose &> /dev/null; then
        if ! docker-compose up -d --build; then
            log "ERROR" "Docker deployment failed"
            log "INFO" "Check Docker logs: docker-compose logs"
            exit 1
        fi
    else
        if ! docker compose up -d --build; then
            log "ERROR" "Docker deployment failed"
            log "INFO" "Check Docker logs: docker compose logs"
            exit 1
        fi
    fi
    
    log "SUCCESS" "Docker containers started"
}

wait_for_services() {
    print_header "Step 7: Waiting for Services"
    log_progress "Service Health Check" "Waiting for PostgreSQL..."
    
    local max_wait=120
    local waited=0
    local interval=5
    
    # Wait for PostgreSQL
    log "INFO" "Waiting for PostgreSQL to be ready..."
    while [ $waited -lt $max_wait ]; do
        if docker exec meetlink-postgres pg_isready -U "$DB_USERNAME" &> /dev/null; then
            log "SUCCESS" "PostgreSQL is ready"
            break
        fi
        
        sleep $interval
        waited=$((waited + interval))
    done
    
    if [ $waited -ge $max_wait ]; then
        log "ERROR" "PostgreSQL failed to start within $max_wait seconds"
        exit 1
    fi
    
    log_progress "Service Health Check" "Waiting for Redis..."
    
    # Wait for Redis
    log "INFO" "Waiting for Redis to be ready..."
    waited=0
    while [ $waited -lt 60 ]; do
        if docker exec meetlink-redis redis-cli ping 2>&1 | grep -q "PONG"; then
            log "SUCCESS" "Redis is ready"
            break
        fi
        
        sleep $interval
        waited=$((waited + interval))
    done
    
    log_progress "Service Health Check" "Waiting for Application..."
    
    # Wait for App
    log "INFO" "Waiting for application to be ready..."
    waited=0
    while [ $waited -lt 180 ]; do
        if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/api/health" 2>/dev/null | grep -q "200"; then
            log "SUCCESS" "Application is healthy"
            break
        fi
        
        sleep $interval
        waited=$((waited + interval))
    done
}

setup_database() {
    print_header "Step 8: Database Setup"
    log_progress "Database Migration" "Running migrations..."
    
    log "INFO" "Running Prisma migrations..."
    
    if docker exec meetlink-app npx prisma migrate deploy; then
        log "SUCCESS" "Database migrations completed"
    else
        log "WARNING" "Some migrations may have issues. Check logs."
    fi
    
    log_progress "Database Seed" "Seeding initial data..."
    
    log "INFO" "Seeding initial data..."
    docker exec meetlink-app npm run seed || log "WARNING" "Seed may have already run"
    
    log "SUCCESS" "Database setup complete"
}

verify_deployment() {
    print_header "Step 9: Verifying Deployment"
    log_progress "Deployment Verification"
    
    # Check container status
    log "INFO" "Checking container status..."
    
    local all_running=true
    
    if ! docker ps | grep -q "meetlink-app.*Up"; then
        log "ERROR" "App container is not running"
        all_running=false
    fi
    
    if ! docker ps | grep -q "meetlink-postgres.*Up"; then
        log "ERROR" "PostgreSQL container is not running"
        all_running=false
    fi
    
    if ! docker ps | grep -q "meetlink-redis.*Up"; then
        log "ERROR" "Redis container is not running"
        all_running=false
    fi
    
    if [ "$all_running" = true ]; then
        log "SUCCESS" "All containers are running"
    fi
    
    # Test application
    log "INFO" "Testing application endpoint..."
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000" 2>/dev/null | grep -q "200"; then
        log "SUCCESS" "Application is accessible"
    else
        log "WARNING" "Application may still be starting..."
    fi
    
    # Test database
    if docker exec meetlink-postgres psql -U "$DB_USERNAME" -d meetlink -c "SELECT 1" &> /dev/null; then
        log "SUCCESS" "Database connection successful"
    fi
    
    return 0
}

show_summary() {
    print_header "Deployment Complete"
    log_progress "Complete" "100%"
    
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local minutes=$((duration / 60))
    local seconds=$((duration % 60))
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  DEPLOYMENT SUCCESSFUL                    ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "Duration:       ${CYAN}${minutes}m ${seconds}s${NC}"
    echo -e "Install Path:   ${CYAN}$INSTALL_DIR${NC}"
    echo ""
    
    echo -e "${YELLOW}Services:${NC}"
    echo "  Application:  http://localhost:3000"
    echo "  PostgreSQL:   localhost:5432"
    echo "  Redis:        localhost:6379"
    echo ""
    
    echo -e "${YELLOW}Logs:${NC}"
    echo "  Deploy Log:   $LOG_FILE"
    echo "  Error Log:    $ERROR_LOG_FILE"
    echo "  App Logs:     docker-compose logs -f app"
    echo ""
    
    echo -e "${YELLOW}Useful Commands:${NC}"
    echo "  View logs:    docker-compose logs -f"
    echo "  Stop:         docker-compose down"
    echo "  Restart:      docker-compose restart"
    echo "  Remove all:   docker-compose down -v"
    echo ""
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        echo -e "${YELLOW}Warnings: ${#WARNINGS[@]}${NC}"
        for warning in "${WARNINGS[@]}"; do
            echo "  - $warning"
        done
        echo ""
    fi
    
    echo -e "${YELLOW}Next Steps:${NC}"
    echo "  1. Access the application at http://localhost:3000"
    echo "  2. Create your admin account"
    echo "  3. Configure calendar integrations in Settings"
    echo "  4. Set up your event types"
    echo ""
    
    echo -e "${CYAN}Documentation: https://github.com/141stfighterwing-collab/meetlink${NC}"
    echo ""
    
    log "SUCCESS" "========== Deployment completed in ${minutes}m ${seconds}s =========="
}

show_error_summary() {
    echo ""
    echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                   DEPLOYMENT FAILED                       ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    echo -e "${RED}Errors encountered:${NC}"
    for error in "${ERRORS[@]}"; do
        echo "  - $error"
    done
    echo ""
    
    echo -e "${YELLOW}Troubleshooting:${NC}"
    echo "  1. Check the error log: $ERROR_LOG_FILE"
    echo "  2. Verify Docker is running: docker info"
    echo "  3. Check container logs: docker-compose logs"
    echo "  4. Review documentation: https://github.com/141stfighterwing-collab/meetlink"
    echo ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

main() {
    show_banner
    check_root
    init_logging
    
    log "INFO" "========== MeetLink Deployment Started =========="
    log "INFO" "Script Version: $SCRIPT_VERSION"
    log "INFO" "Install Path: $INSTALL_DIR"
    
    check_prerequisites
    setup_installation_directory
    get_credentials
    clone_repository
    create_environment
    deploy_docker
    wait_for_services
    setup_database
    verify_deployment
    
    if [ ${#ERRORS[@]} -eq 0 ]; then
        show_summary
    else
        show_error_summary
        exit 1
    fi
}

# Run main function
main
