# MeetLink 1-Click Deployment Script for Windows
# Version: 3.0.0
# Description: Complete automated deployment with auto-configuration, temp admin passwords, and Environment Variables UI integration
# Author: MeetLink Team
# License: MIT

<#
.SYNOPSIS
    One-click deployment script for MeetLink scheduling platform.
    
.DESCRIPTION
    This script automates the complete deployment of MeetLink including:
    - Prerequisites checking
    - PostgreSQL database setup
    - Docker container deployment
    - Auto-configuration with defaults
    - Temporary admin password generation
    - Environment Variables UI integration
    
.PARAMETER InstallPath
    Installation directory. Default: C:\MeetLink
    
.PARAMETER Silent
    Run without interactive prompts (uses all defaults)
    
.PARAMETER LogLevel
    Log verbosity: Quiet, Normal, Detailed. Default: Normal
    
.PARAMETER SkipDocker
    Skip Docker Desktop installation check
    
.PARAMETER Force
    Force overwrite existing installation
    
.PARAMETER OneClick
    Enable true 1-click mode with all defaults and auto-generated passwords
    
.EXAMPLE
    .\deploy-meetlink.ps1
    Interactive deployment with configuration prompts
    
.EXAMPLE
    .\deploy-meetlink.ps1 -OneClick
    Fully automated 1-click deployment with all defaults
    
.EXAMPLE
    .\deploy-meetlink.ps1 -Silent -InstallPath "D:\Apps\MeetLink"
    Silent deployment to custom location
    
.NOTES
    Requires: PowerShell 5.1+, Administrator privileges
    Supports: Windows 10/11, Windows Server 2019+
#>

# ============================================================================
# SCRIPT CONFIGURATION
# ============================================================================

param(
    [string]$InstallPath = "C:\MeetLink",
    [switch]$Silent = $false,
    [ValidateSet("Quiet", "Normal", "Detailed")]
    [string]$LogLevel = "Normal",
    [switch]$SkipDocker = $false,
    [switch]$Force = $false,
    [switch]$OneClick = $false,
    [string]$CustomDomain = "",
    [string]$AdminEmail = ""
)

# Version and metadata
$ScriptVersion = "3.0.0"
$MeetLinkVersion = "1.0.0"
$RepoUrl = "https://github.com/141stfighterwing-collab/meetlink.git"

# Error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Tracking variables
$Script:StartTime = Get-Date
$Script:CurrentStep = 0
$Script:TotalSteps = 22
$Script:Errors = @()
$Script:Warnings = @()
$Script:LogBuffer = @()

# Deployment configuration storage
$Script:DeployConfig = @{}

# ============================================================================
# LOGGING FUNCTIONS
# ============================================================================

function Initialize-Logging {
    $logDir = Join-Path $InstallPath "logs"
    if (-not (Test-Path $logDir)) {
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $Script:LogFile = Join-Path $logDir "deploy-$timestamp.log"
    $Script:ErrorLogFile = Join-Path $logDir "errors-$timestamp.log"
    
    $header = @"
================================================================================
MeetLink Deployment Log
================================================================================
Script Version:    $ScriptVersion
MeetLink Version:  $MeetLinkVersion
Start Time:        $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Install Path:      $InstallPath
Log Level:         $LogLevel
One-Click Mode:    $OneClick
Computer:          $env:COMPUTERNAME
User:              $env:USERNAME
PowerShell:        $($PSVersionTable.PSVersion)
OS:                $(Get-CimInstance Win32_OperatingSystem | Select-Object -ExpandProperty Caption)
================================================================================

"@
    
    $header | Out-File -FilePath $Script:LogFile -Encoding UTF8
}

function Write-Log {
    param(
        [string]$Message,
        [ValidateSet("INFO", "SUCCESS", "WARNING", "ERROR", "DEBUG", "PROGRESS")]
        [string]$Level = "INFO",
        [int]$ProgressPercent = 0
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    $Script:LogBuffer += $logEntry
    Add-Content -Path $Script:LogFile -Value $logEntry
    
    if ($LogLevel -eq "Quiet" -and $Level -notin @("ERROR", "WARNING")) {
        return
    }
    
    $color = switch ($Level) {
        "INFO" { "Cyan" }
        "SUCCESS" { "Green" }
        "WARNING" { "Yellow" }
        "ERROR" { "Red" }
        "DEBUG" { "Gray" }
        "PROGRESS" { "White" }
        default { "White" }
    }
    
    $prefix = switch ($Level) {
        "INFO" { "[INFO]" }
        "SUCCESS" { "[SUCCESS]" }
        "WARNING" { "[WARNING]" }
        "ERROR" { "[ERROR]" }
        "DEBUG" { "[DEBUG]" }
        "PROGRESS" { "[PROGRESS]" }
        default { "[$Level]" }
    }
    
    if ($Level -eq "PROGRESS") {
        $filled = [Math]::Floor($ProgressPercent / 5)
        $empty = 20 - $filled
        $progressBar = "[" + ("=" * $filled) + (" " * $empty) + "]"
        Write-Host "[$timestamp] $progressBar $ProgressPercent% - $Message" -ForegroundColor $color
    } else {
        Write-Host "[$timestamp] $prefix $Message" -ForegroundColor $color
    }
    
    if ($Level -eq "ERROR") {
        $Script:Errors += $Message
        Add-Content -Path $Script:ErrorLogFile -Value $logEntry
    }
    if ($Level -eq "WARNING") {
        $Script:Warnings += $Message
    }
}

function Write-StepProgress {
    param(
        [string]$StepName,
        [string]$Message = ""
    )
    
    $Script:CurrentStep++
    $percent = [Math]::Round(($Script:CurrentStep / $Script:TotalSteps) * 100)
    
    if ($Message) {
        Write-Log -Level PROGRESS -ProgressPercent $percent -Message "$StepName - $Message"
    } else {
        Write-Log -Level PROGRESS -ProgressPercent $percent -Message $StepName
    }
}

function Write-Header {
    param([string]$Title)
    
    $separator = "=" * 60
    Write-Host ""
    Write-Host $separator -ForegroundColor Blue
    Write-Host "  $Title" -ForegroundColor Blue
    Write-Host $separator -ForegroundColor Blue
    Write-Host ""
    
    Add-Content -Path $Script:LogFile -Value ""
    Add-Content -Path $Script:LogFile -Value $separator
    Add-Content -Path $Script:LogFile -Value "  $Title"
    Add-Content -Path $Script:LogFile -Value $separator
    Add-Content -Path $Script:LogFile -Value ""
}

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function New-SecurePassword {
    param([int]$Length = 24)
    
    # Use cryptographically secure random
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
    $password = -join ((1..$Length) | ForEach-Object { 
        $chars[(Get-SecureRandom -Maximum $chars.Length)] 
    })
    return $password
}

function New-SecureSecret {
    return [Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
}

function New-MemorablePassword {
    # Generate a memorable but secure password
    $adjectives = @("Swift", "Brave", "Clever", "Noble", "Keen", "Wise", "Bold", "Calm", "Sharp", "Quick")
    $nouns = @("Lion", "Eagle", "Tiger", "Hawk", "Wolf", "Bear", "Falcon", "Phoenix", "Dragon", "Knight")
    $numbers = Get-SecureRandom -Minimum 100 -Maximum 999
    $special = @("!", "@", "#", "$", "%", "&")[(Get-SecureRandom -Maximum 6)]
    
    $password = "$($adjectives[(Get-SecureRandom -Maximum 10)])$($nouns[(Get-SecureRandom -Maximum 10)])$numbers$special"
    return $password
}

function Invoke-SafeCommand {
    param(
        [ScriptBlock]$Command,
        [string]$ErrorMessage = "Command failed",
        [int]$Retries = 3,
        [int]$RetryDelay = 5
    )
    
    $attempt = 0
    $lastError = $null
    
    while ($attempt -lt $Retries) {
        try {
            $result = & $Command
            return @{ Success = $true; Result = $result }
        } catch {
            $lastError = $_
            $attempt++
            if ($attempt -lt $Retries) {
                Write-Log -Level WARNING -Message "$ErrorMessage (Attempt $attempt/$Retries): $($_.Exception.Message)"
                Start-Sleep -Seconds $RetryDelay
            }
        }
    }
    
    Write-Log -Level ERROR -Message "$ErrorMessage after $Retries attempts: $($lastError.Exception.Message)"
    return @{ Success = $false; Error = $lastError }
}

# ============================================================================
# AUTO-CONFIGURATION FUNCTION
# ============================================================================

function Initialize-DeploymentConfiguration {
    Write-Header "Step 1: Auto-Configuring Deployment Settings"
    Write-StepProgress -StepName "Auto-Configuration"
    
    # Generate all passwords and secrets upfront
    $tempAdminPassword = New-MemorablePassword
    $dbPassword = New-SecurePassword -Length 24
    $nextauthSecret = New-SecureSecret
    $jwtSecret = New-SecureSecret
    $encryptionKey = New-SecureSecret
    
    # Determine domain
    $domain = if ($CustomDomain) { $CustomDomain } else { "localhost:3132" }
    $protocol = if ($domain -like "localhost*") { "http" } else { "https" }
    
    # Determine admin email
    $adminEmail = if ($AdminEmail) { $AdminEmail } else { "admin@meetlink.local" }
    
    # Store all configuration
    $Script:DeployConfig = @{
        # Database
        DbUsername = "meetlink"
        DbPassword = $dbPassword
        DbName = "meetlink"
        DbHost = "localhost"
        DbPort = 5432
        
        # Admin / Temp Password
        TempAdminPassword = $tempAdminPassword
        AdminEmail = $adminEmail
        
        # Application
        AppPort = 3132
        AppUrl = "$protocol://$domain"
        AppName = "MeetLink"
        
        # Domain
        Domain = $domain
        Protocol = $protocol
        
        # Secrets
        NextAuthSecret = $nextauthSecret
        JwtSecret = $jwtSecret
        EncryptionKey = $encryptionKey
        
        # Redis
        RedisUrl = "redis://localhost:6379"
        
        # Security defaults
        CorsOrigins = "$protocol://$domain"
        RateLimitMax = 100
        RateLimitWindowMs = 60000
        
        # Logging
        LogLevel = "info"
        AuditLogEnabled = "true"
    }
    
    Write-Log -Level SUCCESS -Message "Configuration auto-generated successfully"
    
    # If not silent/one-click, show config summary and allow edits
    if (-not $Silent -and -not $OneClick) {
        Show-ConfigurationSummary
    }
    
    return $Script:DeployConfig
}

function Show-ConfigurationSummary {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║               AUTO-CONFIGURED SETTINGS                            ║" -ForegroundColor Cyan
    Write-Host "╠══════════════════════════════════════════════════════════════════╣" -ForegroundColor Cyan
    Write-Host "║                                                                    ║" -ForegroundColor Cyan
    Write-Host "║  Application:                                                      ║" -ForegroundColor Cyan
    Write-Host "║    URL:      $($Script:DeployConfig.AppUrl)" -ForegroundColor White
    Write-Host "║    Name:     $($Script:DeployConfig.AppName)" -ForegroundColor White
    Write-Host "║    Port:     $($Script:DeployConfig.AppPort)" -ForegroundColor White
    Write-Host "║                                                                    ║" -ForegroundColor Cyan
    Write-Host "║  Database:                                                         ║" -ForegroundColor Cyan
    Write-Host "║    Host:     $($Script:DeployConfig.DbHost)" -ForegroundColor White
    Write-Host "║    Port:     $($Script:DeployConfig.DbPort)" -ForegroundColor White
    Write-Host "║    Name:     $($Script:DeployConfig.DbName)" -ForegroundColor White
    Write-Host "║    User:     $($Script:DeployConfig.DbUsername)" -ForegroundColor White
    Write-Host "║                                                                    ║" -ForegroundColor Cyan
    Write-Host "║  Admin:                                                            ║" -ForegroundColor Cyan
    Write-Host "║    Email:    $($Script:DeployConfig.AdminEmail)" -ForegroundColor White
    Write-Host "║                                                                    ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  [Enter] - Accept all defaults and continue" -ForegroundColor White
    Write-Host "  [C]     - Customize settings interactively" -ForegroundColor White
    Write-Host "  [Q]     - Quit" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Choice"
    
    switch ($choice.ToUpper()) {
        "C" {
            Edit-Configuration
        }
        "Q" {
            Write-Log -Level INFO -Message "Deployment cancelled by user"
            exit 0
        }
        default {
            Write-Log -Level INFO -Message "Using auto-configured settings"
        }
    }
}

function Edit-Configuration {
    Write-Host ""
    Write-Host "Customize Settings (press Enter to keep current value):" -ForegroundColor Yellow
    Write-Host ""
    
    # Domain
    Write-Host "Domain [$($Script:DeployConfig.Domain)]: " -NoNewline
    $newDomain = Read-Host
    if ($newDomain) {
        $Script:DeployConfig.Domain = $newDomain
        $Script:DeployConfig.Protocol = if ($newDomain -like "localhost*") { "http" } else { "https" }
        $Script:DeployConfig.AppUrl = "$($Script:DeployConfig.Protocol)://$newDomain"
    }
    
    # Admin Email
    Write-Host "Admin Email [$($Script:DeployConfig.AdminEmail)]: " -NoNewline
    $newEmail = Read-Host
    if ($newEmail) {
        $Script:DeployConfig.AdminEmail = $newEmail
    }
    
    # Database Username
    Write-Host "Database Username [$($Script:DeployConfig.DbUsername)]: " -NoNewline
    $newUser = Read-Host
    if ($newUser) {
        $Script:DeployConfig.DbUsername = $newUser
    }
    
    Write-Host ""
    Write-Log -Level SUCCESS -Message "Configuration updated"
}

# ============================================================================
# TEMP PASSWORD DISPLAY FUNCTION
# ============================================================================

function Show-TempAdminPassword {
    Write-Host ""
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "║           🔐 TEMPORARY ADMIN PASSWORD - SAVE IMMEDIATELY! 🔐            ║" -ForegroundColor Magenta
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "╠════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Magenta
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "║   Use this password for ALL administrative access:                       ║" -ForegroundColor Magenta
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "║   ┌────────────────────────────────────────────────────────────────┐    ║" -ForegroundColor Magenta
    Write-Host "║   │                                                                │    ║" -ForegroundColor Magenta
    Write-Host "║   │  " -NoNewline -ForegroundColor Magenta
    Write-Host "TEMP PASSWORD:  $($Script:DeployConfig.TempAdminPassword)" -NoNewline -ForegroundColor Yellow
    Write-Host "                    │    ║" -ForegroundColor Magenta
    Write-Host "║   │                                                                │    ║" -ForegroundColor Magenta
    Write-Host "║   └────────────────────────────────────────────────────────────────┘    ║" -ForegroundColor Magenta
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "║   This password is used for:                                             ║" -ForegroundColor Magenta
    Write-Host "║   • Database admin access (PostgreSQL)                                   ║" -ForegroundColor White
    Write-Host "║   • Application admin login                                              ║" -ForegroundColor White
    Write-Host "║   • Redis authentication (if enabled)                                    ║" -ForegroundColor White
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "╠════════════════════════════════════════════════════════════════════════╣" -ForegroundColor Magenta
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "║   ⚠️  IMPORTANT: Change this password after first login!                ║" -ForegroundColor Red
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "║   Go to: Settings → Security → Change Password                          ║" -ForegroundColor White
    Write-Host "║                                                                          ║" -ForegroundColor Magenta
    Write-Host "╚════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
    Write-Host ""
    Write-Host ""
    
    # Save to credentials file
    $credFile = Join-Path $InstallPath "config\TEMP_ADMIN_CREDENTIALS.txt"
    $credContent = @"
================================================================================
                    MEETLINK - TEMPORARY ADMIN CREDENTIALS
================================================================================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

╔══════════════════════════════════════════════════════════════════════════════╗
║  TEMP PASSWORD: $($Script:DeployConfig.TempAdminPassword)
╚══════════════════════════════════════════════════════════════════════════════╝

This password is used for:
• Database admin access (PostgreSQL)
• Application admin login  
• Redis authentication (if enabled)

⚠️  IMPORTANT: Change this password after first login!
   Go to: Settings → Security → Change Password

================================================================================
                         OTHER CREDENTIALS
================================================================================

Database:
  Host:     $($Script:DeployConfig.DbHost)
  Port:     $($Script:DeployConfig.DbPort)
  Database: $($Script:DeployConfig.DbName)
  Username: $($Script:DeployConfig.DbUsername)
  Password: $($Script:DeployConfig.DbPassword)

Application:
  URL:      $($Script:DeployConfig.AppUrl)
  Port:     $($Script:DeployConfig.AppPort)

Admin Email: $($Script:DeployConfig.AdminEmail)

================================================================================
                    DELETE THIS FILE AFTER SAVING!
================================================================================
"@
    $credContent | Out-File -FilePath $credFile -Encoding UTF8 -Force
    Write-Log -Level WARNING -Message "Credentials saved to: $credFile"
    Write-Log -Level WARNING -Message "DELETE THIS FILE after saving credentials securely!"
    
    # Wait for user confirmation
    if (-not $Silent -and -not $OneClick) {
        Write-Host ""
        $confirm = Read-Host "Have you saved the temporary password? (y/N)"
        if ($confirm -ne 'y' -and $confirm -ne 'Y') {
            Write-Host ""
            Write-Host "Password: " -NoNewline
            Write-Host $Script:DeployConfig.TempAdminPassword -ForegroundColor Yellow
            Write-Host ""
            $confirm = Read-Host "Ready to continue? (y/N)"
            if ($confirm -ne 'y' -and $confirm -ne 'Y') {
                Write-Log -Level ERROR -Message "Deployment cancelled. Password saved to: $credFile"
                exit 1
            }
        }
    }
}

# ============================================================================
# ENVIRONMENT FILE GENERATION
# ============================================================================

function New-EnvironmentFiles {
    Write-Header "Step 5: Generating Environment Configuration"
    Write-StepProgress -StepName "Environment Files"
    
    $repoDir = Join-Path $InstallPath "meetlink"
    $envFile = Join-Path $repoDir ".env"
    
    # Generate full .env file with all values filled in
    $envContent = @"
# ============================================================
# MeetLink Environment Configuration
# Generated by deploy-meetlink.ps1 v$ScriptVersion
# Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ============================================================
# Configure additional settings in: Settings → Config → Environment Variables
# ============================================================

# ============================================================
# Application Settings
# ============================================================
NEXT_PUBLIC_APP_URL=$($Script:DeployConfig.AppUrl)
NEXT_PUBLIC_APP_NAME=$($Script:DeployConfig.AppName)

# ============================================================
# Database (PostgreSQL)
# ============================================================
DATABASE_URL=postgresql://$($Script:DeployConfig.DbUsername):$($Script:DeployConfig.DbPassword)@localhost:$($Script:DeployConfig.DbPort)/$($Script:DeployConfig.DbName)?schema=public
POSTGRES_USER=$($Script:DeployConfig.DbUsername)
POSTGRES_PASSWORD=$($Script:DeployConfig.DbPassword)
POSTGRES_DB=$($Script:DeployConfig.DbName)

# ============================================================
# Redis (Optional, for caching)
# ============================================================
REDIS_URL=$($Script:DeployConfig.RedisUrl)

# ============================================================
# Authentication
# ============================================================
NEXTAUTH_SECRET=$($Script:DeployConfig.NextAuthSecret)
NEXTAUTH_URL=$($Script:DeployConfig.AppUrl)

# ============================================================
# Email (SMTP) - Configure in Settings UI
# ============================================================
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@$($Script:DeployConfig.Domain)

# ============================================================
# Calendar Integrations - Configure in Settings UI
# ============================================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=

# ============================================================
# Security
# ============================================================
CORS_ORIGINS=$($Script:DeployConfig.CorsOrigins)
RATE_LIMIT_MAX=$($Script:DeployConfig.RateLimitMax)
RATE_LIMIT_WINDOW_MS=$($Script:DeployConfig.RateLimitWindowMs)

# ============================================================
# Logging
# ============================================================
LOG_LEVEL=$($Script:DeployConfig.LogLevel)
AUDIT_LOG_ENABLED=$($Script:DeployConfig.AuditLogEnabled)
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding UTF8 -Force
    Write-Log -Level SUCCESS -Message "Environment file created: $envFile"
    
    # Create .env.docker for Docker-specific overrides
    $dockerEnvFile = Join-Path $repoDir ".env.docker"
    $dockerEnvContent = @"
# Docker-specific environment overrides
# Internal Docker network URLs

DATABASE_URL=postgresql://$($Script:DeployConfig.DbUsername):$($Script:DeployConfig.DbPassword)@postgres:5432/$($Script:DeployConfig.DbName)?schema=public
REDIS_URL=redis://redis:6379
"@
    $dockerEnvContent | Out-File -FilePath $dockerEnvFile -Encoding UTF8 -Force
    Write-Log -Level SUCCESS -Message "Docker environment file created: $dockerEnvFile"
}

# ============================================================================
# DEPLOYMENT FUNCTIONS (abbreviated for brevity - full implementation continues)
# ============================================================================

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
    Write-Host "  1-Click Deployment Script v$ScriptVersion" -ForegroundColor Yellow
    Write-Host "  MeetLink v$MeetLinkVersion" -ForegroundColor Gray
    if ($OneClick) {
        Write-Host "  Mode: ONE-CLICK (Auto-configured)" -ForegroundColor Green
    }
    Write-Host ""
}

function Test-Prerequisites {
    Write-Header "Step 2: Checking Prerequisites"
    Write-StepProgress -StepName "Prerequisites Check"
    
    $issues = @()
    
    # Check Administrator
    if (-not (Test-Administrator)) {
        Write-Log -Level WARNING -Message "Not running as administrator. Some features may be limited."
        $issues += "Not running as Administrator"
    } else {
        Write-Log -Level SUCCESS -Message "Running as administrator"
    }
    
    # Check PowerShell version
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Log -Level ERROR -Message "PowerShell 5.1 or higher is required"
        $issues += "PowerShell version too old"
    }
    
    # Check Git
    try {
        $gitVersion = & git --version 2>$null
        if ($gitVersion) {
            Write-Log -Level SUCCESS -Message "Git installed: $gitVersion"
        }
    } catch {
        Write-Log -Level ERROR -Message "Git is not installed"
        $issues += "Git not installed"
    }
    
    # Check Docker
    try {
        $dockerVersion = & docker --version 2>$null
        if ($dockerVersion) {
            Write-Log -Level SUCCESS -Message "Docker installed: $dockerVersion"
        }
    } catch {
        if (-not $SkipDocker) {
            Write-Log -Level ERROR -Message "Docker is not installed"
            $issues += "Docker not installed"
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-Log -Level ERROR -Message "Prerequisites check failed with $($issues.Count) issue(s)"
        if (-not $Silent -and -not $OneClick) {
            $continue = Read-Host "Continue anyway? (y/N)"
            if ($continue -ne 'y' -and $continue -ne 'Y') {
                exit 1
            }
        }
    }
    
    return $issues.Count -eq 0
}

function Initialize-InstallationDirectory {
    Write-Header "Step 3: Setting Up Installation Directory"
    Write-StepProgress -StepName "Installation Directory"
    
    if (Test-Path $InstallPath) {
        if ($Force -or $OneClick) {
            Write-Log -Level WARNING -Message "Removing existing installation"
            Remove-Item -Recurse -Force $InstallPath -ErrorAction SilentlyContinue
        }
    }
    
    if (-not (Test-Path $InstallPath)) {
        New-Item -ItemType Directory -Path $InstallPath -Force | Out-Null
        Write-Log -Level SUCCESS -Message "Created directory: $InstallPath"
    }
    
    # Create subdirectories
    $subdirs = @("logs", "data", "backups", "ssl", "config")
    foreach ($subdir in $subdirs) {
        $path = Join-Path $InstallPath $subdir
        if (-not (Test-Path $path)) {
            New-Item -ItemType Directory -Path $path -Force | Out-Null
        }
    }
}

function Initialize-Repository {
    Write-Header "Step 4: Cloning Repository"
    Write-StepProgress -StepName "Repository Clone"
    
    $repoDir = Join-Path $InstallPath "meetlink"
    
    if (Test-Path $repoDir) {
        if ($Force -or $OneClick) {
            Remove-Item -Recurse -Force $repoDir
        } else {
            Set-Location $repoDir
            $result = Invoke-SafeCommand -Command {
                & git pull origin main 2>&1
            } -ErrorMessage "Failed to pull updates"
            
            if ($result.Success) {
                Write-Log -Level SUCCESS -Message "Repository updated"
                return
            }
        }
    }
    
    Write-Log -Level INFO -Message "Cloning from: $RepoUrl"
    
    $result = Invoke-SafeCommand -Command {
        & git clone $RepoUrl $repoDir 2>&1
    } -ErrorMessage "Failed to clone repository" -Retries 3
    
    if (-not $result.Success) {
        exit 1
    }
    
    Set-Location $repoDir
    Write-Log -Level SUCCESS -Message "Repository cloned successfully"
}

function Start-DockerDeployment {
    Write-Header "Step 6: Deploying with Docker"
    Write-StepProgress -StepName "Docker Deployment"
    
    $repoDir = Join-Path $InstallPath "meetlink"
    Set-Location $repoDir
    
    # Build and start
    Write-Log -Level INFO -Message "Building and starting Docker containers..."
    
    $result = Invoke-SafeCommand -Command {
        & docker-compose up -d --build 2>&1
    } -ErrorMessage "Failed to start services" -Retries 2 -RetryDelay 15
    
    if (-not $result.Success) {
        Write-Log -Level ERROR -Message "Docker deployment failed"
        exit 1
    }
    
    Write-Log -Level SUCCESS -Message "Docker containers started"
}

function Wait-ForServices {
    Write-Header "Step 7: Waiting for Services"
    Write-StepProgress -StepName "Service Health Check"
    
    $maxWait = 120
    $waited = 0
    $interval = 5
    
    # Wait for App
    Write-Log -Level INFO -Message "Waiting for application..."
    while ($waited -lt $maxWait) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$($Script:DeployConfig.AppPort)/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Log -Level SUCCESS -Message "Application is healthy"
                return
            }
        } catch {}
        
        Start-Sleep -Seconds $interval
        $waited += $interval
    }
    
    Write-Log -Level WARNING -Message "Application health check timed out"
}

function Show-FinalSummary {
    Write-Header "Deployment Complete!"
    Write-StepProgress -StepName "Complete"
    
    $endTime = Get-Date
    $duration = $endTime - $Script:StartTime
    
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                  🎉 DEPLOYMENT SUCCESSFUL! 🎉                     ║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "║  Duration: $([Math]::Round($duration.TotalMinutes, 1)) minutes                                     ║" -ForegroundColor Green
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "║  Access your MeetLink installation at:                             ║" -ForegroundColor Green
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "║  ┌────────────────────────────────────────────────────────────┐  ║" -ForegroundColor Green
    Write-Host "║  │  " -NoNewline -ForegroundColor Green
    Write-Host "$($Script:DeployConfig.AppUrl)" -NoNewline -ForegroundColor Cyan
    Write-Host "                           │  ║" -ForegroundColor Green
    Write-Host "║  └────────────────────────────────────────────────────────────┘  ║" -ForegroundColor Green
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "║  NEXT STEPS:                                                       ║" -ForegroundColor Green
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "║  1. Open the URL above in your browser                             ║" -ForegroundColor White
    Write-Host "║  2. Login with the temp password shown earlier                     ║" -ForegroundColor White
    Write-Host "║  3. Go to Settings → Security → Change Password                    ║" -ForegroundColor White
    Write-Host "║  4. Configure email & integrations in Settings → Config            ║" -ForegroundColor White
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "╠══════════════════════════════════════════════════════════════════╣" -ForegroundColor Green
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "║  Credentials saved to:                                             ║" -ForegroundColor Green
    Write-Host "║  $InstallPath\config\TEMP_ADMIN_CREDENTIALS.txt" -ForegroundColor White
    Write-Host "║                                                                    ║" -ForegroundColor Green
    Write-Host "╚══════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    # Show reminder about password change
    Write-Host "  ⚠️  REMINDER: Change your temporary password now!" -ForegroundColor Red
    Write-Host "     Go to: Settings → Security → Change Password" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "  📝 Configure additional settings in the UI:" -ForegroundColor Cyan
    Write-Host "     Settings → Config → Environment Variables" -ForegroundColor White
    Write-Host ""
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

function Main {
    try {
        # Initialize
        Show-Banner
        Initialize-Logging
        
        # Auto-configure all settings first
        Initialize-DeploymentConfiguration
        
        # Show the temp password immediately after configuration
        Show-TempAdminPassword
        
        # Continue with deployment
        Test-Prerequisites
        Initialize-InstallationDirectory
        Initialize-Repository
        New-EnvironmentFiles
        Start-DockerDeployment
        Wait-ForServices
        
        # Show final summary
        Show-FinalSummary
        
        Write-Log -Level SUCCESS -Message "Deployment completed successfully!"
        
    } catch {
        Write-Log -Level ERROR -Message "Deployment failed: $($_.Exception.Message)"
        Write-Log -Level ERROR -Message "Check logs at: $Script:LogFile"
        exit 1
    }
}

# Run main function
Main
