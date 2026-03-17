# MeetLink Windows Setup Automation Script
# Version: 1.0.0
# Description: Automates MeetLink setup on Windows

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "update", "env", "logs", "stop", "start", "restart", "status", "help")]
    [string]$Command = "deploy",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Email = ""
)

$ErrorActionPreference = "Stop"
$Version = "1.0.0"

# Colors
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Warning { Write-Host "! $args" -ForegroundColor Yellow }
function Write-Info { Write-Host "ℹ $args" -ForegroundColor Cyan }
function Write-Header { 
    Write-Host ""
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Blue
    Write-Host "  $args" -ForegroundColor Blue
    Write-Host "═══════════════════════════════════════════" -ForegroundColor Blue
    Write-Host ""
}

# Banner
function Show-Banner {
    Clear-Host
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "║     ██████╗ ███╗   ██╗██╗██╗     ██████╗ ██████╗  █████╗  ║" -ForegroundColor Cyan
    Write-Host "║    ██╔════╝ ████╗  ██║██║██║     ██╔══██╗██╔══██╗██╔══██╗ ║" -ForegroundColor Cyan
    Write-Host "║    ██║  ███╗██╔██╗ ██║██║██║     ██║  ██║██████╔╝███████║ ║" -ForegroundColor Cyan
    Write-Host "║    ██║   ██║██║╚██╗██║██║██║     ██║  ██║██╔══██╗██╔══██║ ║" -ForegroundColor Cyan
    Write-Host "║    ╚██████╔╝██║ ╚████║██║███████╗██████╔╝██║  ██║██║  ██║ ║" -ForegroundColor Cyan
    Write-Host "║     ╚═════╝ ╚═╝  ╚═══╝╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝ ║" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "║        Self-Hosted Scheduling Platform                    ║" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  Deployment Automation Script v$Version" -ForegroundColor Yellow
    Write-Host ""
}

# Generate secure password
function New-SecurePassword {
    param([int]$Length = 24)
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
    $password = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

# Generate secure secret
function New-SecureSecret {
    return [Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
}

# Check prerequisites
function Test-Prerequisites {
    Write-Header "Checking Prerequisites"
    
    $errors = 0
    
    # Check Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-Success "Docker is installed: $dockerVersion"
        } else {
            throw "Docker not found"
        }
    } catch {
        Write-Error "Docker is not installed"
        Write-Info "Install from: https://docs.docker.com/desktop/install/windows-install/"
        $errors++
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        if ($composeVersion) {
            Write-Success "Docker Compose is installed"
        } else {
            throw "Docker Compose not found"
        }
    } catch {
        Write-Error "Docker Compose is not installed"
        $errors++
    }
    
    # Check Git
    try {
        $gitVersion = git --version 2>$null
        if ($gitVersion) {
            Write-Success "Git is installed: $gitVersion"
        } else {
            throw "Git not found"
        }
    } catch {
        Write-Error "Git is not installed"
        $errors++
    }
    
    # Check if Docker is running
    try {
        docker info 2>$null | Out-Null
        Write-Success "Docker daemon is running"
    } catch {
        Write-Error "Docker daemon is not running"
        Write-Info "Start Docker Desktop"
        $errors++
    }
    
    if ($errors -gt 0) {
        Write-Error "Prerequisites check failed with $errors error(s)"
        exit 1
    }
    
    Write-Success "`nAll prerequisites met!"
}

# Clone repository
function Initialize-Repository {
    Write-Header "Cloning MeetLink Repository"
    
    $repoUrl = "https://github.com/141stfighterwing-collab/meetlink.git"
    $targetDir = "meetlink"
    
    if (Test-Path $targetDir) {
        Write-Warning "Directory '$targetDir' already exists"
        $confirm = Read-Host "Remove and re-clone? (y/N)"
        if ($confirm -eq 'y' -or $confirm -eq 'Y') {
            Remove-Item -Recurse -Force $targetDir
        } else {
            Write-Info "Using existing directory"
            Set-Location $targetDir
            return
        }
    }
    
    Write-Info "Cloning from $repoUrl"
    git clone $repoUrl $targetDir
    Set-Location $targetDir
    Write-Success "Repository cloned successfully"
}

# Create environment file
function New-EnvironmentFile {
    Write-Header "Creating Environment Configuration"
    
    $envFile = ".env.production"
    
    # Generate secrets
    $postgresPassword = New-SecurePassword -Length 20
    $nextauthSecret = New-SecureSecret
    $jwtSecret = New-SecureSecret
    $encryptionKey = New-SecureSecret
    
    # Get user input
    if (-not $Domain) {
        $Domain = Read-Host "Enter domain (e.g., meetlink.yourdomain.com)"
        if (-not $Domain) { $Domain = "localhost:3000" }
    }
    
    if (-not $Email) {
        $Email = Read-Host "Enter your email (for admin)"
        if (-not $Email) { $Email = "admin@example.com" }
    }
    
    # Determine protocol
    $protocol = "http"
    if ($Domain -notlike "localhost*") {
        $protocol = "https"
    }
    
    $envContent = @"
# MeetLink Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# WARNING: Keep this file secure and never commit to version control!

# ============================================
# PostgreSQL Database
# ============================================
POSTGRES_USER=meetlink
POSTGRES_PASSWORD=$postgresPassword
POSTGRES_DB=meetlink
POSTGRES_PORT=5432

# ============================================
# Application
# ============================================
APP_PORT=3000
NEXT_PUBLIC_APP_URL=$protocol://$Domain
NEXT_PUBLIC_APP_NAME=MeetLink

# ============================================
# Authentication
# ============================================
NEXTAUTH_SECRET=$nextauthSecret
NEXTAUTH_URL=$protocol://$Domain
JWT_SECRET=$jwtSecret
ENCRYPTION_KEY=$encryptionKey

# ============================================
# Database URL (internal Docker network)
# ============================================
DATABASE_URL=postgresql://meetlink:${postgresPassword}@postgres:5432/meetlink

# ============================================
# Email Configuration (Optional)
# ============================================
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@$Domain

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
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding UTF8 -Force
    
    Write-Success "Created $envFile"
    Write-Warning "Store these credentials securely!"
    
    Write-Host ""
    Write-Host "Generated Credentials:" -ForegroundColor Yellow
    Write-Host "  Database Password: " -NoNewline
    Write-Host $postgresPassword -ForegroundColor Green
    Write-Host "  NextAuth Secret:   " -NoNewline
    Write-Host $nextauthSecret -ForegroundColor Green
}

# Deploy with Docker
function Start-DockerDeployment {
    Write-Header "Deploying with Docker"
    
    if (-not (Test-Path ".env.production")) {
        New-EnvironmentFile
    }
    
    # Pull images
    Write-Info "Pulling Docker images..."
    docker-compose pull 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker compose pull
    }
    
    # Build and start services
    Write-Info "Building and starting services..."
    docker-compose up -d --build 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker compose up -d --build
    }
    
    # Wait for services
    Write-Info "Waiting for services to be ready..."
    Start-Sleep -Seconds 10
    
    # Check status
    Write-Info "Service status:"
    docker-compose ps 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker compose ps
    }
    
    Write-Success "`nDeployment complete!"
}

# Run migrations
function Invoke-DatabaseMigrations {
    Write-Header "Running Database Migrations"
    
    Write-Info "Waiting for PostgreSQL..."
    Start-Sleep -Seconds 5
    
    Write-Info "Running Prisma migrations..."
    docker-compose exec app npx prisma migrate deploy 2>$null
    if ($LASTEXITCODE -ne 0) {
        docker compose exec app npx prisma migrate deploy
    }
    
    Write-Success "Database migrations completed"
}

# Show summary
function Show-Summary {
    $envFile = ".env.production"
    $domain = "localhost:3000"
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        $urlLine = $content | Where-Object { $_ -match "NEXT_PUBLIC_APP_URL=" }
        if ($urlLine) {
            $domain = $urlLine.Split('=')[1]
        }
    }
    
    Write-Header "Deployment Summary"
    
    Write-Host "MeetLink has been deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Access URL:        $domain" -ForegroundColor Cyan
    Write-Host "  Repository:        https://github.com/141stfighterwing-collab/meetlink" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Useful Commands:" -ForegroundColor Yellow
    Write-Host "  View logs:     docker-compose logs -f"
    Write-Host "  Stop:          docker-compose down"
    Write-Host "  Restart:       docker-compose restart"
    Write-Host "  Remove all:    docker-compose down -v"
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Access the application at $domain"
    Write-Host "  2. Create your admin account"
    Write-Host "  3. Configure calendar integrations"
    Write-Host "  4. Set up event types"
}

# Full deployment
function Invoke-FullDeployment {
    Show-Banner
    Test-Prerequisites
    Initialize-Repository
    New-EnvironmentFile
    Start-DockerDeployment
    Invoke-DatabaseMigrations
    Show-Summary
}

# Quick update
function Invoke-QuickUpdate {
    Write-Header "Quick Update"
    
    if (Test-Path "meetlink") {
        Set-Location meetlink
    }
    
    Write-Info "Pulling latest changes..."
    git pull origin main
    
    Write-Info "Rebuilding containers..."
    docker-compose down 2>$null
    if ($LASTEXITCODE -ne 0) { docker compose down }
    
    docker-compose up -d --build 2>$null
    if ($LASTEXITCODE -ne 0) { docker compose up -d --build }
    
    Write-Success "Update complete!"
}

# Show help
function Show-Help {
    Show-Banner
    Write-Host "Usage: .\setup-meetlink.ps1 [command]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  deploy      Full deployment (clone, configure, deploy)"
    Write-Host "  update      Quick update (pull, rebuild)"
    Write-Host "  env         Create environment file only"
    Write-Host "  logs        View application logs"
    Write-Host "  stop        Stop all services"
    Write-Host "  start       Start all services"
    Write-Host "  restart     Restart all services"
    Write-Host "  status      Show service status"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\setup-meetlink.ps1 deploy"
    Write-Host "  .\setup-meetlink.ps1 update"
    Write-Host "  .\setup-meetlink.ps1 -Domain 'meetlink.company.com' deploy"
}

# Main execution
switch ($Command) {
    "deploy" { Invoke-FullDeployment }
    "update" { Invoke-QuickUpdate }
    "env" { New-EnvironmentFile }
    "logs" { docker-compose logs -f 2>$null; if ($LASTEXITCODE -ne 0) { docker compose logs -f } }
    "stop" { docker-compose down 2>$null; if ($LASTEXITCODE -ne 0) { docker compose down }; Write-Success "Services stopped" }
    "start" { docker-compose up -d 2>$null; if ($LASTEXITCODE -ne 0) { docker compose up -d }; Write-Success "Services started" }
    "restart" { docker-compose restart 2>$null; if ($LASTEXITCODE -ne 0) { docker compose restart }; Write-Success "Services restarted" }
    "status" { docker-compose ps 2>$null; if ($LASTEXITCODE -ne 0) { docker compose ps } }
    "help" { Show-Help }
    default { Write-Error "Unknown command: $Command"; Show-Help; exit 1 }
}
