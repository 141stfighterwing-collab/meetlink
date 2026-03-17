# MeetLink PostgreSQL Deployment Script
# Version: 1.0.0
# Author: MeetLink Team
# Description: Automated PostgreSQL deployment with security configuration

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = ".\meetlink-config.psd1",
    
    [Parameter(Mandatory=$false)]
    [switch]$Interactive = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$Force = $false,
    
    [Parameter(Mandatory=$false)]
    [string]$DockerComposePath = "docker-compose"
)

# Version and Change Log
$ScriptVersion = "1.0.0"
$ChangeLog = @(
    "v1.0.0 - Initial release with PostgreSQL deployment",
    "     - Added interactive security configuration",
    "     - Implemented password strength validation",
    "     - Added Docker Compose auto-detection",
    "     - Included database initialization"
)

# Color output functions
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Header { Write-Host "`n$($args[0])" -BackgroundColor DarkBlue -ForegroundColor White }

# Display banner
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
    Write-Host "║        Self-Hosted Scheduling Platform v$ScriptVersion          ║" -ForegroundColor Cyan
    Write-Host "║                                                           ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

# Password strength validation
function Test-PasswordStrength {
    param([string]$Password)
    
    $score = 0
    $feedback = @()
    
    if ($Password.Length -ge 8) { $score++ } else { $feedback += "Password should be at least 8 characters" }
    if ($Password.Length -ge 12) { $score++ }
    if ($Password -match '[A-Z]') { $score++ } else { $feedback += "Add uppercase letters" }
    if ($Password -match '[a-z]') { $score++ } else { $feedback += "Add lowercase letters" }
    if ($Password -match '[0-9]') { $score++ } else { $feedback += "Add numbers" }
    if ($Password -match '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]') { $score++ } else { $feedback += "Add special characters" }
    if ($Password -notmatch '(password|123456|qwerty|admin|meetlink)') { $score++ }
    
    $strength = switch ($score) {
        { $_ -le 2 } { "Weak"; break }
        { $_ -eq 3 -or $_ -eq 4 } { "Medium"; break }
        { $_ -eq 5 } { "Strong"; break }
        { $_ -ge 6 } { "Very Strong"; break }
    }
    
    return @{
        Score = $score
        Strength = $strength
        Feedback = $feedback
        IsValid = $score -ge 4
    }
}

# Generate secure random password
function New-SecurePassword {
    param([int]$Length = 24)
    
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()'
    $password = -join ((1..$Length) | ForEach-Object { $chars[(Get-Random -Maximum $chars.Length)] })
    return $password
}

# Get user input with validation
function Get-SecureInput {
    param(
        [string]$Prompt,
        [bool]$IsRequired = $true,
        [bool]$IsPassword = $false,
        [string]$DefaultValue = "",
        [bool]$ValidatePassword = $false
    )
    
    $value = ""
    $firstAttempt = $true
    
    do {
        if ($firstAttempt) {
            Write-Host "`n$Prompt" -ForegroundColor White
            if ($DefaultValue) {
                Write-Host "(Press Enter for default: $DefaultValue)" -ForegroundColor DarkGray
            }
            $firstAttempt = $false
        }
        
        if ($IsPassword) {
            $secureStr = Read-Host -AsSecureString "Enter value"
            $value = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
                [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureStr)
            )
        } else {
            $input = Read-Host "Enter value"
            $value = if ($input) { $input } else { $DefaultValue }
        }
        
        if ($IsRequired -and !$value) {
            Write-Warning "This field is required."
            continue
        }
        
        if ($ValidatePassword -and $value) {
            $result = Test-PasswordStrength -Password $value
            Write-Info "Password strength: $($result.Strength)"
            
            if (-not $result.IsValid) {
                Write-Warning "Password is too weak. Suggestions:"
                $result.Feedback | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
                
                $continue = Read-Host "Continue with this password? (y/N)"
                if ($continue -ne 'y' -and $continue -ne 'Y') {
                    $value = ""
                    continue
                }
            }
        }
        
        break
    } while ($true)
    
    return $value
}

# Check prerequisites
function Test-Prerequisites {
    Write-Header "Checking Prerequisites..."
    
    $errors = @()
    
    # Check Docker
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            Write-Success "✓ Docker is installed: $dockerVersion"
        } else {
            throw "Docker not found"
        }
    } catch {
        $errors += "Docker is not installed. Please install Docker Desktop."
        Write-Error "✗ Docker is not installed"
    }
    
    # Check Docker Compose
    try {
        $composeVersion = docker-compose --version 2>$null
        if ($composeVersion) {
            Write-Success "✓ Docker Compose is installed: $composeVersion"
        } else {
            throw "Docker Compose not found"
        }
    } catch {
        $errors += "Docker Compose is not installed. Please install Docker Compose."
        Write-Error "✗ Docker Compose is not installed"
    }
    
    # Check if Docker is running
    try {
        docker ps 2>$null | Out-Null
        Write-Success "✓ Docker daemon is running"
    } catch {
        $errors += "Docker daemon is not running. Please start Docker Desktop."
        Write-Error "✗ Docker daemon is not running"
    }
    
    # Check PowerShell version
    $psVersion = $PSVersionTable.PSVersion
    if ($psVersion.Major -ge 5) {
        Write-Success "✓ PowerShell version: $psVersion"
    } else {
        Write-Warning "! PowerShell version is old: $psVersion (Recommended: 5.1+)"
    }
    
    if ($errors.Count -gt 0) {
        Write-Error "`nPrerequisites check failed. Please fix the following issues:"
        $errors | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        return $false
    }
    
    Write-Success "`n✓ All prerequisites met!"
    return $true
}

# Interactive configuration
function Get-InteractiveConfiguration {
    Write-Header "Security Configuration"
    Write-Info "This script will help you configure your MeetLink deployment securely."
    Write-Info "Default credentials will be suggested, but you should change them for production.`n"
    
    # PostgreSQL Configuration
    Write-Header "PostgreSQL Database Configuration"
    
    $config = @{}
    
    # Database username
    $config.PostgresUser = Get-SecureInput -Prompt "PostgreSQL Username" -DefaultValue "meetlink"
    
    # Database password
    $defaultPassword = New-SecurePassword -Length 20
    Write-Info "Generated secure password: $defaultPassword"
    $useGenerated = Read-Host "Use generated password? (Y/n)"
    
    if ($useGenerated -eq 'n' -or $useGenerated -eq 'N') {
        $config.PostgresPassword = Get-SecureInput -Prompt "PostgreSQL Password" -IsPassword -ValidatePassword
    } else {
        $config.PostgresPassword = $defaultPassword
    }
    
    # Database name
    $config.PostgresDb = Get-SecureInput -Prompt "Database Name" -DefaultValue "meetlink"
    
    # Database port
    $config.PostgresPort = Get-SecureInput -Prompt "PostgreSQL Port (external)" -DefaultValue "5432"
    
    # Application Configuration
    Write-Header "Application Configuration"
    
    $config.AppPort = Get-SecureInput -Prompt "Application Port" -DefaultValue "3000"
    $config.AppUrl = Get-SecureInput -Prompt "Application URL (for external access)" -DefaultValue "http://localhost:3000"
    
    # Authentication secrets
    Write-Header "Security Secrets"
    Write-Info "These secrets are used for authentication and encryption."
    Write-Info "Store them securely - they cannot be recovered if lost!`n"
    
    $config.NextAuthSecret = New-SecurePassword -Length 32
    $config.JwtSecret = New-SecurePassword -Length 32
    $config.EncryptionKey = New-SecurePassword -Length 32
    
    Write-Success "Generated NextAuth Secret: $($config.NextAuthSecret)"
    Write-Success "Generated JWT Secret: $($config.JwtSecret)"
    Write-Success "Generated Encryption Key: $($config.EncryptionKey)"
    
    # Email configuration (optional)
    Write-Header "Email Configuration (Optional)"
    $configureEmail = Read-Host "Configure email notifications? (y/N)"
    
    if ($configureEmail -eq 'y' -or $configureEmail -eq 'Y') {
        $config.SmtpHost = Get-SecureInput -Prompt "SMTP Host" -IsRequired $false
        $config.SmtpPort = Get-SecureInput -Prompt "SMTP Port" -DefaultValue "587"
        $config.SmtpUser = Get-SecureInput -Prompt "SMTP Username" -IsRequired $false
        $config.SmtpPassword = Get-SecureInput -Prompt "SMTP Password" -IsPassword
        $config.SmtpFrom = Get-SecureInput -Prompt "From Email Address" -IsRequired $false
    }
    
    return $config
}

# Create .env file
function New-EnvironmentFile {
    param($Config)
    
    Write-Header "Creating Environment File"
    
    $envContent = @"
# MeetLink Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# WARNING: Keep this file secure and never commit to version control!

# PostgreSQL Database
POSTGRES_USER=$($Config.PostgresUser)
POSTGRES_PASSWORD=$($Config.PostgresPassword)
POSTGRES_DB=$($Config.PostgresDb)
POSTGRES_PORT=$($Config.PostgresPort)

# Application
APP_PORT=$($Config.AppPort)
NEXT_PUBLIC_APP_URL=$($Config.AppUrl)
NEXT_PUBLIC_APP_NAME=MeetLink

# Authentication
NEXTAUTH_SECRET=$($Config.NextAuthSecret)
NEXTAUTH_URL=$($Config.AppUrl)
JWT_SECRET=$($Config.JwtSecret)
ENCRYPTION_KEY=$($Config.EncryptionKey)

# Database URL (internal Docker network)
DATABASE_URL=postgresql://$($Config.PostgresUser):$($Config.PostgresPassword)@postgres:5432/$($Config.PostgresDb)

# Email Configuration
SMTP_HOST=$($Config.SmtpHost)
SMTP_PORT=$($Config.SmtpPort)
SMTP_USER=$($Config.SmtpUser)
SMTP_PASSWORD=$($Config.SmtpPassword)
SMTP_FROM=$($Config.SmtpFrom)

# Logging
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
"@

    $envPath = ".env.production"
    $envContent | Out-File -FilePath $envPath -Encoding UTF8 -Force
    
    Write-Success "✓ Created environment file: $envPath"
    Write-Warning "! This file contains sensitive credentials. Keep it secure!"
    
    return $envPath
}

# Create database initialization script
function New-DatabaseInitScript {
    Write-Header "Creating Database Initialization Script"
    
    $initSQL = @"
-- MeetLink Database Initialization Script
-- Version: 1.0.0

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create audit schema for security logging
CREATE SCHEMA IF NOT EXISTS audit;

-- Create audit log table
CREATE TABLE IF NOT EXISTS audit.logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    is_sensitive BOOLEAN DEFAULT FALSE,
    severity VARCHAR(20) DEFAULT 'INFO',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.logs(action);

-- Row-Level Security (RLS) setup
-- This ensures multi-tenant data isolation
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;

-- Create policies for users to access only their own data
CREATE POLICY "Users can view own data" ON "User"
    FOR SELECT USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can update own data" ON "User"
    FOR UPDATE USING (id = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can view own events" ON "EventType"
    FOR SELECT USING (userId = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can manage own events" ON "EventType"
    FOR ALL USING (userId = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can view own bookings" ON "Booking"
    FOR SELECT USING (hostId = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can manage own bookings" ON "Booking"
    FOR ALL USING (hostId = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can view own contacts" ON "Contact"
    FOR SELECT USING (userId = current_setting('app.current_user_id')::UUID);

CREATE POLICY "Users can manage own contacts" ON "Contact"
    FOR ALL USING (userId = current_setting('app.current_user_id')::UUID);

-- Grant permissions
GRANT USAGE ON SCHEMA audit TO meetlink;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO meetlink;

-- Log initialization
INSERT INTO audit.logs (action, entity_type, severity) 
VALUES ('SYSTEM_INIT', 'Database', 'INFO');
"@

    $dbPath = "database\init.sql"
    New-Item -ItemType Directory -Force -Path "database" | Out-Null
    $initSQL | Out-File -FilePath $dbPath -Encoding UTF8 -Force
    
    Write-Success "✓ Created database initialization script: $dbPath"
}

# Deploy with Docker Compose
function Start-DockerDeployment {
    param($Config)
    
    Write-Header "Starting Docker Deployment"
    
    # Pull images
    Write-Info "Pulling Docker images..."
    docker-compose -f docker-compose.yml pull
    
    # Start services
    Write-Info "Starting services..."
    docker-compose -f docker-compose.yml up -d
    
    # Wait for PostgreSQL
    Write-Info "Waiting for PostgreSQL to be ready..."
    $retries = 30
    $ready = $false
    
    for ($i = 1; $i -le $retries; $i++) {
        try {
            docker exec meetlink-postgres pg_isready -U $Config.PostgresUser | Out-Null
            $ready = $true
            break
        } catch {
            Write-Host "." -NoNewline
            Start-Sleep -Seconds 1
        }
    }
    
    if ($ready) {
        Write-Success "`n✓ PostgreSQL is ready!"
    } else {
        Write-Error "`n✗ PostgreSQL failed to start"
        return $false
    }
    
    # Run Prisma migrations
    Write-Info "Running database migrations..."
    docker exec meetlink-app npx prisma migrate deploy
    
    # Show status
    Write-Header "Deployment Status"
    docker-compose -f docker-compose.yml ps
    
    return $true
}

# Display summary
function Show-Summary {
    param($Config)
    
    Write-Header "Deployment Complete!"
    Write-Success "`nMeetLink has been deployed successfully!"
    Write-Host ""
    Write-Info "Access your MeetLink instance:"
    Write-Host "  URL:  $($Config.AppUrl)" -ForegroundColor Cyan
    Write-Host "  Port: $($Config.AppPort)" -ForegroundColor Cyan
    Write-Host ""
    Write-Info "Database Connection:"
    Write-Host "  Host:     localhost" -ForegroundColor Cyan
    Write-Host "  Port:     $($Config.PostgresPort)" -ForegroundColor Cyan
    Write-Host "  Database: $($Config.PostgresDb)" -ForegroundColor Cyan
    Write-Host "  User:     $($Config.PostgresUser)" -ForegroundColor Cyan
    Write-Host ""
    Write-Warning "IMPORTANT: Store your credentials securely!"
    Write-Host "  Credentials have been saved to .env.production" -ForegroundColor Yellow
    Write-Host ""
    Write-Info "Useful commands:"
    Write-Host "  View logs:    docker-compose logs -f" -ForegroundColor White
    Write-Host "  Stop:         docker-compose down" -ForegroundColor White
    Write-Host "  Restart:      docker-compose restart" -ForegroundColor White
    Write-Host "  Remove:       docker-compose down -v" -ForegroundColor White
    Write-Host ""
}

# Main script execution
function Main {
    Show-Banner
    
    # Show change log
    Write-Header "Change Log"
    $ChangeLog | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    # Get configuration
    if ($Interactive) {
        $config = Get-InteractiveConfiguration
    } else {
        # Use defaults for non-interactive mode
        $config = @{
            PostgresUser = "meetlink"
            PostgresPassword = New-SecurePassword -Length 20
            PostgresDb = "meetlink"
            PostgresPort = "5432"
            AppPort = "3000"
            AppUrl = "http://localhost:3000"
            NextAuthSecret = New-SecurePassword -Length 32
            JwtSecret = New-SecurePassword -Length 32
            EncryptionKey = New-SecurePassword -Length 32
        }
    }
    
    # Create configuration files
    New-EnvironmentFile -Config $config
    New-DatabaseInitScript
    
    # Deploy
    if (Start-DockerDeployment -Config $config) {
        Show-Summary -Config $config
    } else {
        Write-Error "Deployment failed. Check logs for details."
        exit 1
    }
}

# Run main function
Main
