# MeetLink Windows Setup Automation Script
# Version: 1.1.0
# Description: Automates MeetLink setup on Windows with interactive credential configuration

param(
    [Parameter(Position=0)]
    [ValidateSet("deploy", "update", "env", "logs", "stop", "start", "restart", "status", "help")]
    [string]$Command = "deploy",
    
    [Parameter(Mandatory=$false)]
    [string]$Domain = "",
    
    [Parameter(Mandatory=$false)]
    [string]$Email = "",
    
    [Parameter(Mandatory=$false)]
    [string]$DbUsername = "",
    
    [Parameter(Mandatory=$false)]
    [string]$DbPassword = ""
)

$ErrorActionPreference = "Stop"
$Version = "1.1.0"

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

# Password strength validation
function Test-PasswordStrength {
    param([string]$Password)
    
    $score = 0
    $feedback = @()
    
    if ($Password.Length -ge 8) { $score++ } else { $feedback += "At least 8 characters" }
    if ($Password.Length -ge 12) { $score++ }
    if ($Password -cmatch '[A-Z]') { $score++ } else { $feedback += "Add uppercase letters" }
    if ($Password -cmatch '[a-z]') { $score++ } else { $feedback += "Add lowercase letters" }
    if ($Password -match '[0-9]') { $score++ } else { $feedback += "Add numbers" }
    if ($Password -match '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>\/?]') { $score++ } else { $feedback += "Add special characters" }
    
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

# Get masked password input
function Read-MaskedInput {
    param([string]$Prompt = "Enter password")
    
    Write-Host "$Prompt" -ForegroundColor White
    $password = ""
    
    while ($true) {
        $key = [Console]::ReadKey($true)
        
        if ($key.Key -eq 'Enter') {
            Write-Host ""
            break
        } elseif ($key.Key -eq 'Backspace') {
            if ($password.Length -gt 0) {
                $password = $password.Substring(0, $password.Length - 1)
                Write-Host "`b `b" -NoNewline
            }
        } elseif ($key.KeyChar -ne [char]0) {
            $password += $key.KeyChar
            Write-Host "*" -NoNewline
        }
    }
    
    return $password
}

# Prompt for credentials
function Get-Credentials {
    Write-Header "Credential Configuration"
    Write-Info "Configure your database credentials below."
    Write-Info "These credentials will be used for PostgreSQL authentication.`n"
    
    # Database Username
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "DATABASE USERNAME" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    
    if ($DbUsername) {
        Write-Success "Using provided username: $DbUsername"
        $username = $DbUsername
    } else {
        Write-Host "Enter a username for the PostgreSQL database." -ForegroundColor Gray
        Write-Host "Default: " -NoNewline
        Write-Host "meetlink" -ForegroundColor Green
        Write-Host ""
        
        $username = Read-Host "Username"
        if (-not $username) { 
            $username = "meetlink"
            Write-Info "Using default username: meetlink"
        }
        
        # Validate username
        while ($username -match '[^a-zA-Z0-9_]') {
            Write-Error "Username can only contain letters, numbers, and underscores."
            $username = Read-Host "Username (or press Enter for 'meetlink')"
            if (-not $username) { $username = "meetlink" }
        }
    }
    
    Write-Host ""
    
    # Database Password
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "DATABASE PASSWORD" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    
    if ($DbPassword) {
        Write-Success "Using provided password"
        $password = $DbPassword
    } else {
        Write-Host "Choose an option:" -ForegroundColor White
        Write-Host "  [1] Generate a secure random password (recommended)" -ForegroundColor Cyan
        Write-Host "  [2] Enter a custom password" -ForegroundColor Cyan
        Write-Host ""
        
        $choice = Read-Host "Option (1 or 2)"
        
        switch ($choice) {
            "1" {
                Write-Host ""
                Write-Host "Select password length:" -ForegroundColor White
                Write-Host "  [1] 16 characters" -ForegroundColor Cyan
                Write-Host "  [2] 20 characters (recommended)" -ForegroundColor Cyan
                Write-Host "  [3] 24 characters" -ForegroundColor Cyan
                Write-Host "  [4] 32 characters (maximum security)" -ForegroundColor Cyan
                Write-Host ""
                
                $lengthChoice = Read-Host "Length (1-4)"
                $length = switch ($lengthChoice) {
                    "1" { 16 }
                    "2" { 20 }
                    "3" { 24 }
                    "4" { 32 }
                    default { 20 }
                }
                
                $password = New-SecurePassword -Length $length
                
                Write-Host ""
                Write-Host "Generated Password: " -NoNewline
                Write-Host $password -ForegroundColor Green
                Write-Host ""
                Write-Warning "IMPORTANT: Save this password securely! It cannot be recovered."
                
                # Confirm saving
                Write-Host ""
                $confirm = Read-Host "Have you saved the password? (y/N)"
                if ($confirm -ne 'y' -and $confirm -ne 'Y') {
                    Write-Warning "Please save the password before continuing."
                    Write-Host "Password: $password" -ForegroundColor Green
                    $confirm = Read-Host "Ready to continue? (y/N)"
                    if ($confirm -ne 'y' -and $confirm -ne 'Y') {
                        Write-Error "Deployment cancelled. Please run the script again when ready."
                        exit 1
                    }
                }
            }
            
            "2" {
                Write-Host ""
                Write-Info "Enter a custom password for the database."
                Write-Info "Password requirements:"
                Write-Host "  - At least 8 characters" -ForegroundColor Gray
                Write-Host "  - Mix of uppercase and lowercase letters" -ForegroundColor Gray
                Write-Host "  - At least one number" -ForegroundColor Gray
                Write-Host "  - At least one special character (!@#$%^&*...)" -ForegroundColor Gray
                Write-Host ""
                
                do {
                    $password = Read-MaskedInput -Prompt "Enter password"
                    
                    if ($password.Length -lt 8) {
                        Write-Error "Password must be at least 8 characters."
                        continue
                    }
                    
                    $result = Test-PasswordStrength -Password $password
                    
                    Write-Host ""
                    Write-Host "Password Strength: " -NoNewline
                    switch ($result.Strength) {
                        "Weak" { Write-Host $result.Strength -ForegroundColor Red }
                        "Medium" { Write-Host $result.Strength -ForegroundColor Yellow }
                        "Strong" { Write-Host $result.Strength -ForegroundColor Green }
                        "Very Strong" { Write-Host $result.Strength -ForegroundColor Green }
                    }
                    
                    if (-not $result.IsValid) {
                        Write-Warning "Password is not strong enough. Suggestions:"
                        foreach ($item in $result.Feedback) {
                            Write-Host "  - $item" -ForegroundColor Yellow
                        }
                        Write-Host ""
                        $continue = Read-Host "Use this password anyway? (y/N)"
                        if ($continue -eq 'y' -or $continue -eq 'Y') {
                            break
                        }
                        continue
                    }
                    
                    break
                } while ($true)
                
                # Confirm password
                Write-Host ""
                $confirmPassword = Read-MaskedInput -Prompt "Confirm password"
                
                if ($password -ne $confirmPassword) {
                    Write-Error "Passwords do not match. Please try again."
                    return Get-Credentials  # Recursive call
                }
                
                Write-Success "Password confirmed!"
            }
            
            default {
                Write-Warning "Invalid option. Generating a secure password..."
                $password = New-SecurePassword -Length 20
                Write-Host "Generated Password: $password" -ForegroundColor Green
            }
        }
    }
    
    Write-Host ""
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Success "Credentials configured successfully!"
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    return @{
        Username = $username
        Password = $password
    }
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
    
    # Get credentials first
    $credentials = Get-Credentials
    
    # Generate application secrets
    $nextauthSecret = New-SecureSecret
    $jwtSecret = New-SecureSecret
    $encryptionKey = New-SecureSecret
    
    # Get domain and email
    Write-Host ""
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "APPLICATION SETTINGS" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    if (-not $Domain) {
        Write-Host "Enter your domain (e.g., meetlink.yourdomain.com)" -ForegroundColor Gray
        Write-Host "For local testing, use: localhost:3000" -ForegroundColor Gray
        Write-Host ""
        $Domain = Read-Host "Domain"
        if (-not $Domain) { $Domain = "localhost:3000" }
    }
    
    Write-Host ""
    
    if (-not $Email) {
        Write-Host "Enter admin email for notifications" -ForegroundColor Gray
        Write-Host ""
        $Email = Read-Host "Admin Email"
        if (-not $Email) { $Email = "admin@example.com" }
    }
    
    # Determine protocol
    $protocol = "http"
    if ($Domain -notlike "localhost*") {
        $protocol = "https"
    }
    
    # Database name
    $dbName = "meetlink"
    
    $envContent = @"
# MeetLink Environment Configuration
# Generated on $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# WARNING: Keep this file secure and never commit to version control!

# ============================================
# PostgreSQL Database
# ============================================
POSTGRES_USER=$($credentials.Username)
POSTGRES_PASSWORD=$($credentials.Password)
POSTGRES_DB=$dbName
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
DATABASE_URL=postgresql://$($credentials.Username):$($credentials.Password)@postgres:5432/$dbName

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
    
    Write-Host ""
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Success "Environment file created: $envFile"
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    
    Write-Warning "SECURITY NOTICE:"
    Write-Host "  - Keep .env.production secure and never commit it to version control" -ForegroundColor Gray
    Write-Host "  - Store your credentials in a password manager" -ForegroundColor Gray
    Write-Host "  - Database username: " -NoNewline
    Write-Host $credentials.Username -ForegroundColor Cyan
    Write-Host "  - Database password: [HIDDEN]" -ForegroundColor Gray
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
    $username = "meetlink"
    
    if (Test-Path $envFile) {
        $content = Get-Content $envFile
        $urlLine = $content | Where-Object { $_ -match "NEXT_PUBLIC_APP_URL=" }
        if ($urlLine) {
            $domain = $urlLine.Split('=')[1]
        }
        $userLine = $content | Where-Object { $_ -match "POSTGRES_USER=" }
        if ($userLine) {
            $username = $userLine.Split('=')[1]
        }
    }
    
    Write-Header "Deployment Summary"
    
    Write-Host "MeetLink has been deployed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "  Access URL:        $domain" -ForegroundColor Cyan
    Write-Host "  Database User:     $username" -ForegroundColor Cyan
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
    Write-Host "Usage: .\setup-meetlink.ps1 [command] [options]"
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
    Write-Host "Options:"
    Write-Host "  -Domain        Set the application domain"
    Write-Host "  -Email         Set the admin email"
    Write-Host "  -DbUsername    Set the database username"
    Write-Host "  -DbPassword    Set the database password"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\setup-meetlink.ps1 deploy"
    Write-Host "  .\setup-meetlink.ps1 -Domain 'meetlink.company.com' deploy"
    Write-Host "  .\setup-meetlink.ps1 -DbUsername 'admin' -DbPassword 'secret' deploy"
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
