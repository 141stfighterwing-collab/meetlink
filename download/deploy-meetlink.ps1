# MeetLink 1-Click Deployment Script for Windows
# Version: 2.0.0
# Description: Complete automated deployment with PostgreSQL setup, progress tracking, and detailed logging
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
    - Database migrations
    - Service health verification
    
.PARAMETER InstallPath
    Installation directory. Default: C:\MeetLink
    
.PARAMETER Silent
    Run without interactive prompts
    
.PARAMETER LogLevel
    Log verbosity: Quiet, Normal, Detailed. Default: Normal
    
.PARAMETER SkipDocker
    Skip Docker Desktop installation check
    
.PARAMETER Force
    Force overwrite existing installation
    
.EXAMPLE
    .\deploy-meetlink.ps1
    Interactive deployment with default settings
    
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
    [string]$DbUsername = "",
    [string]$DbPassword = "",
    [string]$AdminEmail = "",
    [string]$Domain = ""
)

# Version and metadata
$ScriptVersion = "2.0.0"
$MeetLinkVersion = "1.0.0"
$RepoUrl = "https://github.com/141stfighterwing-collab/meetlink.git"

# Error handling
$ErrorActionPreference = "Stop"
$ProgressPreference = "Continue"

# Tracking variables
$Script:StartTime = Get-Date
$Script:CurrentStep = 0
$Script:TotalSteps = 20
$Script:Errors = @()
$Script:Warnings = @()
$Script:LogBuffer = @()

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
    
    # Initialize log file
    $header = @"
================================================================================
MeetLink Deployment Log
================================================================================
Script Version:    $ScriptVersion
MeetLink Version:  $MeetLinkVersion
Start Time:        $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Install Path:      $InstallPath
Log Level:         $LogLevel
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
    
    # Add to buffer
    $Script:LogBuffer += $logEntry
    
    # Write to log file
    Add-Content -Path $Script:LogFile -Value $logEntry
    
    # Console output based on log level
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
    
    # Progress formatting
    if ($Level -eq "PROGRESS") {
        $progressBar = ""
        $filled = [Math]::Floor($ProgressPercent / 5)
        $empty = 20 - $filled
        $progressBar = "[" + ("=" * $filled) + (" " * $empty) + "]"
        
        Write-Host "[$timestamp] $progressBar $ProgressPercent% - $Message" -ForegroundColor $color
    } else {
        Write-Host "[$timestamp] $prefix $Message" -ForegroundColor $color
    }
    
    # Track errors and warnings
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
    
    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-='
    $password = -join ((1..$Length) | ForEach-Object { 
        $chars[(Get-Random -Maximum $chars.Length)] 
    })
    return $password
}

function New-SecureSecret {
    return [Convert]::ToHexString([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
}

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
# DEPLOYMENT FUNCTIONS
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
    Write-Host ""
}

function Test-Prerequisites {
    Write-Header "Step 1: Checking Prerequisites"
    Write-StepProgress -StepName "Prerequisites Check"
    
    $issues = @()
    
    # Check Administrator
    Write-Log -Level INFO -Message "Checking administrator privileges..."
    if (-not (Test-Administrator)) {
        Write-Log -Level WARNING -Message "Not running as administrator. Some features may be limited."
        $issues += "Not running as Administrator"
    } else {
        Write-Log -Level SUCCESS -Message "Running as administrator"
    }
    
    # Check PowerShell version
    Write-Log -Level INFO -Message "PowerShell version: $($PSVersionTable.PSVersion)"
    if ($PSVersionTable.PSVersion.Major -lt 5) {
        Write-Log -Level ERROR -Message "PowerShell 5.1 or higher is required"
        $issues += "PowerShell version too old"
    }
    
    # Check Git
    Write-Log -Level INFO -Message "Checking Git installation..."
    try {
        $gitVersion = & git --version 2>$null
        if ($gitVersion) {
            Write-Log -Level SUCCESS -Message "Git installed: $gitVersion"
        }
    } catch {
        Write-Log -Level ERROR -Message "Git is not installed"
        Write-Log -Level INFO -Message "Download from: https://git-scm.com/download/win"
        $issues += "Git not installed"
    }
    
    # Check Docker
    Write-Log -Level INFO -Message "Checking Docker installation..."
    try {
        $dockerVersion = & docker --version 2>$null
        if ($dockerVersion) {
            Write-Log -Level SUCCESS -Message "Docker installed: $dockerVersion"
        }
    } catch {
        if (-not $SkipDocker) {
            Write-Log -Level ERROR -Message "Docker is not installed"
            Write-Log -Level INFO -Message "Download from: https://docs.docker.com/desktop/install/windows-install/"
            $issues += "Docker not installed"
        }
    }
    
    # Check Docker daemon
    if (-not $SkipDocker) {
        Write-Log -Level INFO -Message "Checking Docker daemon status..."
        try {
            $dockerInfo = & docker info 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Log -Level SUCCESS -Message "Docker daemon is running"
            } else {
                Write-Log -Level WARNING -Message "Docker daemon may not be running"
                $issues += "Docker daemon not running"
            }
        } catch {
            Write-Log -Level WARNING -Message "Cannot verify Docker daemon status"
            $issues += "Docker daemon status unknown"
        }
    }
    
    # Check Docker Compose
    Write-Log -Level INFO -Message "Checking Docker Compose..."
    try {
        $composeVersion = & docker-compose --version 2>$null
        if ($composeVersion) {
            Write-Log -Level SUCCESS -Message "Docker Compose installed: $composeVersion"
        }
    } catch {
        # Try newer docker compose command
        try {
            $composeVersion = & docker compose version 2>$null
            if ($composeVersion) {
                Write-Log -Level SUCCESS -Message "Docker Compose (plugin) installed: $composeVersion"
            }
        } catch {
            Write-Log -Level ERROR -Message "Docker Compose is not installed"
            $issues += "Docker Compose not installed"
        }
    }
    
    # Check available resources
    Write-Log -Level INFO -Message "Checking system resources..."
    $os = Get-CimInstance Win32_OperatingSystem
    $freeMemoryGB = [Math]::Round($os.FreePhysicalMemory / 1MB, 2)
    $totalMemoryGB = [Math]::Round($os.TotalVisibleMemorySize / 1MB, 2)
    
    Write-Log -Level INFO -Message "Memory: $freeMemoryGB GB free of $totalMemoryGB GB total"
    
    if ($totalMemoryGB -lt 4) {
        Write-Log -Level WARNING -Message "Less than 4GB RAM may cause performance issues"
    }
    
    $disk = Get-CimInstance Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeDiskGB = [Math]::Round($disk.FreeSpace / 1GB, 2)
    Write-Log -Level INFO -Message "Disk space (C:): $freeDiskGB GB free"
    
    if ($freeDiskGB -lt 10) {
        Write-Log -Level WARNING -Message "Less than 10GB free disk space"
    }
    
    # Check ports
    Write-Log -Level INFO -Message "Checking required ports..."
    $ports = @(3000, 5432, 6379, 80, 443)
    foreach ($port in $ports) {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $port)
        try {
            $listener.Start()
            $listener.Stop()
            Write-Log -Level DEBUG -Message "Port $port is available"
        } catch {
            Write-Log -Level WARNING -Message "Port $port is in use"
        }
    }
    
    if ($issues.Count -gt 0) {
        Write-Log -Level ERROR -Message "Prerequisites check failed with $($issues.Count) issue(s)"
        foreach ($issue in $issues) {
            Write-Log -Level ERROR -Message "  - $issue"
        }
        
        if (-not $Silent) {
            Write-Host ""
            $continue = Read-Host "Continue anyway? (y/N)"
            if ($continue -ne 'y' -and $continue -ne 'Y') {
                exit 1
            }
        } else {
            exit 1
        }
    } else {
        Write-Log -Level SUCCESS -Message "All prerequisites met"
    }
    
    return $issues.Count -eq 0
}

function Initialize-InstallationDirectory {
    Write-Header "Step 2: Setting Up Installation Directory"
    Write-StepProgress -StepName "Installation Directory"
    
    Write-Log -Level INFO -Message "Target directory: $InstallPath"
    
    if (Test-Path $InstallPath) {
        if ($Force) {
            Write-Log -Level WARNING -Message "Removing existing installation (Force mode)"
            Remove-Item -Recurse -Force $InstallPath
        } else {
            Write-Log -Level WARNING -Message "Directory already exists: $InstallPath"
            if (-not $Silent) {
                $overwrite = Read-Host "Overwrite existing installation? (y/N)"
                if ($overwrite -eq 'y' -or $overwrite -eq 'Y') {
                    Remove-Item -Recurse -Force $InstallPath
                }
            }
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
            Write-Log -Level DEBUG -Message "Created subdirectory: $subdir"
        }
    }
    
    Write-Log -Level SUCCESS -Message "Installation directory ready"
}

function Get-DeploymentCredentials {
    Write-Header "Step 3: Configuring Credentials"
    Write-StepProgress -StepName "Credential Configuration"
    
    if ($DbUsername -and $DbPassword) {
        Write-Log -Level INFO -Message "Using provided credentials"
        return @{
            Username = $DbUsername
            Password = $DbPassword
        }
    }
    
    if ($Silent) {
        Write-Log -Level INFO -Message "Generating credentials (Silent mode)"
        return @{
            Username = "meetlink"
            Password = New-SecurePassword -Length 24
        }
    }
    
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "DATABASE CREDENTIALS" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Configure your PostgreSQL database credentials." -ForegroundColor Gray
    Write-Host ""
    
    # Username
    Write-Host "Enter a username for the PostgreSQL database." -ForegroundColor White
    Write-Host "Default: " -NoNewline
    Write-Host "meetlink" -ForegroundColor Green
    Write-Host ""
    
    $username = Read-Host "Username"
    if (-not $username) { 
        $username = "meetlink"
        Write-Log -Level INFO -Message "Using default username: meetlink"
    }
    
    # Validate username
    while ($username -match '[^a-zA-Z0-9_]') {
        Write-Log -Level ERROR -Message "Username can only contain letters, numbers, and underscores."
        $username = Read-Host "Username (or press Enter for 'meetlink')"
        if (-not $username) { $username = "meetlink" }
    }
    
    Write-Host ""
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host "DATABASE PASSWORD" -ForegroundColor Yellow
    Write-Host "─────────────────────────────────────────" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "Choose an option:" -ForegroundColor White
    Write-Host "  [1] Generate a secure random password (recommended)" -ForegroundColor Cyan
    Write-Host "  [2] Enter a custom password" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Option (1 or 2)"
    $password = ""
    
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
            Write-Log -Level WARNING -Message "IMPORTANT: Save this password securely! It cannot be recovered."
            
            Write-Host ""
            $confirm = Read-Host "Have you saved the password? (y/N)"
            if ($confirm -ne 'y' -and $confirm -ne 'Y') {
                Write-Log -Level WARNING -Message "Please save the password before continuing."
                Write-Host "Password: $password" -ForegroundColor Green
                $confirm = Read-Host "Ready to continue? (y/N)"
                if ($confirm -ne 'y' -and $confirm -ne 'Y') {
                    Write-Log -Level ERROR -Message "Deployment cancelled."
                    exit 1
                }
            }
        }
        
        "2" {
            Write-Host ""
            Write-Log -Level INFO -Message "Enter a custom password for the database."
            Write-Host "  - At least 8 characters" -ForegroundColor Gray
            Write-Host "  - Mix of uppercase and lowercase letters" -ForegroundColor Gray
            Write-Host "  - At least one number" -ForegroundColor Gray
            Write-Host "  - At least one special character" -ForegroundColor Gray
            Write-Host ""
            
            do {
                $password = Read-MaskedInput -Prompt "Enter password"
                
                if ($password.Length -lt 8) {
                    Write-Log -Level ERROR -Message "Password must be at least 8 characters."
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
                    Write-Log -Level WARNING -Message "Password suggestions:"
                    foreach ($item in $result.Feedback) {
                        Write-Host "  - $item" -ForegroundColor Yellow
                    }
                    $continue = Read-Host "Use this password anyway? (y/N)"
                    if ($continue -eq 'y' -or $continue -eq 'Y') { break }
                    continue
                }
                break
            } while ($true)
            
            Write-Host ""
            $confirmPassword = Read-MaskedInput -Prompt "Confirm password"
            
            if ($password -ne $confirmPassword) {
                Write-Log -Level ERROR -Message "Passwords do not match."
                return Get-DeploymentCredentials
            }
            
            Write-Log -Level SUCCESS -Message "Password confirmed!"
        }
        
        default {
            Write-Log -Level WARNING -Message "Invalid option. Generating secure password..."
            $password = New-SecurePassword -Length 20
            Write-Host "Generated Password: $password" -ForegroundColor Green
        }
    }
    
    return @{
        Username = $username
        Password = $password
    }
}

function Initialize-Repository {
    Write-Header "Step 4: Cloning Repository"
    Write-StepProgress -StepName "Repository Clone"
    
    $repoDir = Join-Path $InstallPath "meetlink"
    
    if (Test-Path $repoDir) {
        if ($Force) {
            Remove-Item -Recurse -Force $repoDir
        } else {
            Write-Log -Level INFO -Message "Repository already exists, pulling updates..."
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
        Write-Log -Level ERROR -Message "Repository clone failed. Check network connection."
        exit 1
    }
    
    Set-Location $repoDir
    Write-Log -Level SUCCESS -Message "Repository cloned successfully"
}

function New-EnvironmentConfiguration {
    param($Credentials)
    
    Write-Header "Step 5: Creating Environment Configuration"
    Write-StepProgress -StepName "Environment Setup"
    
    $envFile = Join-Path $InstallPath "meetlink\.env.production"
    
    # Generate secrets
    $nextauthSecret = New-SecureSecret
    $jwtSecret = New-SecureSecret
    $encryptionKey = New-SecureSecret
    
    # Get domain
    if (-not $Domain) {
        if (-not $Silent) {
            Write-Host ""
            Write-Host "Enter your domain (e.g., meetlink.yourdomain.com)" -ForegroundColor Gray
            Write-Host "For local testing, use: localhost:3000" -ForegroundColor Gray
            Write-Host ""
            $Domain = Read-Host "Domain"
        }
        if (-not $Domain) { $Domain = "localhost:3000" }
    }
    
    # Get admin email
    if (-not $AdminEmail) {
        if (-not $Silent) {
            Write-Host ""
            Write-Host "Enter admin email for notifications" -ForegroundColor Gray
            $AdminEmail = Read-Host "Admin Email"
        }
        if (-not $AdminEmail) { $AdminEmail = "admin@example.com" }
    }
    
    $protocol = if ($Domain -like "localhost*") { "http" } else { "https" }
    
    $envContent = @"
# MeetLink Environment Configuration
# Generated by deploy-meetlink.ps1 v$ScriptVersion
# Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# WARNING: Keep this file secure and never commit to version control!

# ============================================
# PostgreSQL Database
# ============================================
POSTGRES_USER=$($Credentials.Username)
POSTGRES_PASSWORD=$($Credentials.Password)
POSTGRES_DB=meetlink
POSTGRES_PORT=5432

# ============================================
# Application
# ============================================
APP_PORT=3000
NEXT_PUBLIC_APP_URL=$protocol://$Domain
NEXT_PUBLIC_APP_NAME=MeetLink
NODE_ENV=production

# ============================================
# Authentication & Security
# ============================================
NEXTAUTH_SECRET=$nextauthSecret
NEXTAUTH_URL=$protocol://$Domain
JWT_SECRET=$jwtSecret
ENCRYPTION_KEY=$encryptionKey

# ============================================
# Database URL (internal Docker network)
# ============================================
DATABASE_URL=postgresql://$($Credentials.Username):$($Credentials.Password)@postgres:5432/meetlink

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
SMTP_FROM=noreply@$Domain

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
"@
    
    $envContent | Out-File -FilePath $envFile -Encoding UTF8 -Force
    
    Write-Log -Level SUCCESS -Message "Environment file created: $envFile"
    Write-Log -Level INFO -Message "Database Username: $($Credentials.Username)"
    Write-Log -Level INFO -Message "Database Password: [HIDDEN]"
    Write-Log -Level INFO -Message "Application URL: $protocol://$Domain"
    
    # Save credentials to a secure file for reference
    $credFile = Join-Path $InstallPath "config\credentials.txt"
    $credContent = @"
MeetLink Credentials
====================
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

Database:
  Host: localhost
  Port: 5432
  Database: meetlink
  Username: $($Credentials.Username)
  Password: $($Credentials.Password)

Application:
  URL: $protocol://$Domain
  Admin Email: $AdminEmail

IMPORTANT: Delete this file after saving credentials securely!
"@
    $credContent | Out-File -FilePath $credFile -Encoding UTF8 -Force
    Write-Log -Level WARNING -Message "Credentials saved to: $credFile (Delete after saving!)"
}

function Start-DockerDeployment {
    Write-Header "Step 6: Deploying with Docker"
    
    $repoDir = Join-Path $InstallPath "meetlink"
    Set-Location $repoDir
    
    # Copy environment file
    Write-StepProgress -StepName "Docker Setup" -Message "Preparing configuration"
    $envSource = Join-Path $InstallPath "meetlink\.env.production"
    $envTarget = Join-Path $repoDir ".env"
    
    if (Test-Path $envSource) {
        Copy-Item $envSource $envTarget -Force
        Write-Log -Level INFO -Message "Environment file copied to .env"
    }
    
    # Create docker-compose override if needed
    Write-StepProgress -StepName "Docker Setup" -Message "Creating Docker configuration"
    $dockerCompose = @"
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: meetlink-postgres
    environment:
      POSTGRES_USER: `\${POSTGRES_USER}
      POSTGRES_PASSWORD: `\${POSTGRES_PASSWORD}
      POSTGRES_DB: `\${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U `\${POSTGRES_USER} -d `\${POSTGRES_DB}"]
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
      - DATABASE_URL=`\${DATABASE_URL}
      - NEXTAUTH_SECRET=`\${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=`\${NEXTAUTH_URL}
      - NEXT_PUBLIC_APP_URL=`\${NEXT_PUBLIC_APP_URL}
      - REDIS_URL=`\${REDIS_URL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
"@
    
    $composeFile = Join-Path $repoDir "docker-compose.yml"
    $dockerCompose | Out-File -FilePath $composeFile -Encoding UTF8 -Force
    Write-Log -Level SUCCESS -Message "Docker Compose configuration created"
    
    # Pull images
    Write-StepProgress -StepName "Docker Images" -Message "Pulling base images"
    Write-Log -Level INFO -Message "Pulling Docker images..."
    
    $result = Invoke-SafeCommand -Command {
        & docker-compose pull 2>&1
    } -ErrorMessage "Failed to pull some images" -Retries 3 -RetryDelay 10
    
    # Build and start
    Write-StepProgress -StepName "Docker Build" -Message "Building containers"
    Write-Log -Level INFO -Message "Building and starting services..."
    
    $result = Invoke-SafeCommand -Command {
        & docker-compose up -d --build 2>&1
    } -ErrorMessage "Failed to start services" -Retries 2 -RetryDelay 15
    
    if (-not $result.Success) {
        Write-Log -Level ERROR -Message "Docker deployment failed"
        Write-Log -Level INFO -Message "Check Docker logs: docker-compose logs"
        exit 1
    }
    
    Write-Log -Level SUCCESS -Message "Docker containers started"
}

function Wait-ForServices {
    Write-Header "Step 7: Waiting for Services"
    Write-StepProgress -StepName "Service Health Check" -Message "Waiting for PostgreSQL..."
    
    $maxWait = 120
    $waited = 0
    $interval = 5
    
    # Wait for PostgreSQL
    Write-Log -Level INFO -Message "Waiting for PostgreSQL to be ready..."
    while ($waited -lt $maxWait) {
        try {
            $result = & docker exec meetlink-postgres pg_isready -U meetlink 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Log -Level SUCCESS -Message "PostgreSQL is ready"
                break
            }
        } catch {}
        
        Start-Sleep -Seconds $interval
        $waited += $interval
        Write-Log -Level DEBUG -Message "Waiting... ($waited/$maxWait seconds)"
    }
    
    if ($waited -ge $maxWait) {
        Write-Log -Level ERROR -Message "PostgreSQL failed to start within $maxWait seconds"
        exit 1
    }
    
    Write-StepProgress -StepName "Service Health Check" -Message "Waiting for Redis..."
    
    # Wait for Redis
    Write-Log -Level INFO -Message "Waiting for Redis to be ready..."
    $waited = 0
    while ($waited -lt 60) {
        try {
            $result = & docker exec meetlink-redis redis-cli ping 2>&1
            if ($result -like "*PONG*") {
                Write-Log -Level SUCCESS -Message "Redis is ready"
                break
            }
        } catch {}
        
        Start-Sleep -Seconds $interval
        $waited += $interval
    }
    
    Write-StepProgress -StepName "Service Health Check" -Message "Waiting for Application..."
    
    # Wait for App
    Write-Log -Level INFO -Message "Waiting for application to be ready..."
    $waited = 0
    while ($waited -lt 180) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Log -Level SUCCESS -Message "Application is healthy"
                break
            }
        } catch {}
        
        Start-Sleep -Seconds $interval
        $waited += $interval
        Write-Log -Level DEBUG -Message "Waiting for app... ($waited/180 seconds)"
    }
}

function Invoke-DatabaseSetup {
    Write-Header "Step 8: Database Setup"
    Write-StepProgress -StepName "Database Migration" -Message "Running migrations..."
    
    $repoDir = Join-Path $InstallPath "meetlink"
    Set-Location $repoDir
    
    Write-Log -Level INFO -Message "Running Prisma migrations..."
    
    $result = Invoke-SafeCommand -Command {
        & docker exec meetlink-app npx prisma migrate deploy 2>&1
    } -ErrorMessage "Migration failed" -Retries 3 -RetryDelay 10
    
    if ($result.Success) {
        Write-Log -Level SUCCESS -Message "Database migrations completed"
    } else {
        Write-Log -Level WARNING -Message "Some migrations may have issues. Check logs."
    }
    
    Write-StepProgress -StepName "Database Seed" -Message "Seeding initial data..."
    
    Write-Log -Level INFO -Message "Seeding initial data..."
    
    $result = Invoke-SafeCommand -Command {
        & docker exec meetlink-app npm run seed 2>&1
    } -ErrorMessage "Seeding failed" -Retries 2
    
    Write-Log -Level SUCCESS -Message "Database setup complete"
}

function Test-Deployment {
    Write-Header "Step 9: Verifying Deployment"
    Write-StepProgress -StepName "Deployment Verification"
    
    # Check container status
    Write-Log -Level INFO -Message "Checking container status..."
    $containers = & docker-compose ps 2>&1
    
    $allRunning = $true
    if ($containers -notmatch "meetlink-app.*Up") {
        Write-Log -Level ERROR -Message "App container is not running"
        $allRunning = $false
    }
    if ($containers -notmatch "meetlink-postgres.*Up") {
        Write-Log -Level ERROR -Message "PostgreSQL container is not running"
        $allRunning = $false
    }
    if ($containers -notmatch "meetlink-redis.*Up") {
        Write-Log -Level ERROR -Message "Redis container is not running"
        $allRunning = $false
    }
    
    if ($allRunning) {
        Write-Log -Level SUCCESS -Message "All containers are running"
    }
    
    # Test endpoints
    Write-Log -Level INFO -Message "Testing application endpoints..."
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log -Level SUCCESS -Message "Application is accessible"
        }
    } catch {
        Write-Log -Level WARNING -Message "Application may still be starting..."
    }
    
    # Test database connection
    try {
        $dbTest = & docker exec meetlink-postgres psql -U meetlink -d meetlink -c "SELECT 1" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Log -Level SUCCESS -Message "Database connection successful"
        }
    } catch {
        Write-Log -Level WARNING -Message "Database connection test failed"
    }
    
    return $allRunning
}

function Show-DeploymentSummary {
    Write-Header "Deployment Complete"
    Write-StepProgress -StepName "Complete" -Message "100%"
    
    $endTime = Get-Date
    $duration = $endTime - $Script:StartTime
    $durationStr = "{0:hh\:mm\:ss}" -f $duration
    
    Write-Host ""
    Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║                  DEPLOYMENT SUCCESSFUL                    ║" -ForegroundColor Green
    Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Duration:       $durationStr" -ForegroundColor Cyan
    Write-Host "Install Path:   $InstallPath" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Services:" -ForegroundColor Yellow
    Write-Host "  Application:  http://localhost:3000" -ForegroundColor White
    Write-Host "  PostgreSQL:   localhost:5432" -ForegroundColor White
    Write-Host "  Redis:        localhost:6379" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Logs:" -ForegroundColor Yellow
    Write-Host "  Deploy Log:   $Script:LogFile" -ForegroundColor White
    Write-Host "  Error Log:    $Script:ErrorLogFile" -ForegroundColor White
    Write-Host "  App Logs:     docker-compose logs -f app" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Useful Commands:" -ForegroundColor Yellow
    Write-Host "  View logs:    docker-compose logs -f" -ForegroundColor White
    Write-Host "  Stop:         docker-compose down" -ForegroundColor White
    Write-Host "  Restart:      docker-compose restart" -ForegroundColor White
    Write-Host "  Remove all:   docker-compose down -v" -ForegroundColor White
    Write-Host ""
    
    if ($Script:Warnings.Count -gt 0) {
        Write-Host "Warnings: $($Script:Warnings.Count)" -ForegroundColor Yellow
        foreach ($warning in $Script:Warnings) {
            Write-Host "  - $warning" -ForegroundColor Yellow
        }
        Write-Host ""
    }
    
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Access the application at http://localhost:3000" -ForegroundColor White
    Write-Host "  2. Create your admin account" -ForegroundColor White
    Write-Host "  3. Configure calendar integrations in Settings" -ForegroundColor White
    Write-Host "  4. Set up your event types" -ForegroundColor White
    Write-Host ""
    
    Write-Host "Documentation: https://github.com/141stfighterwing-collab/meetlink" -ForegroundColor Cyan
    Write-Host ""
    
    # Final log entry
    Write-Log -Level SUCCESS -Message "========== Deployment completed in $durationStr =========="
}

function Show-ErrorSummary {
    if ($Script:Errors.Count -gt 0) {
        Write-Host ""
        Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Red
        Write-Host "║                   DEPLOYMENT FAILED                       ║" -ForegroundColor Red
        Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Red
        Write-Host ""
        
        Write-Host "Errors encountered:" -ForegroundColor Red
        foreach ($error in $Script:Errors) {
            Write-Host "  - $error" -ForegroundColor Red
        }
        Write-Host ""
        
        Write-Host "Troubleshooting:" -ForegroundColor Yellow
        Write-Host "  1. Check the error log: $Script:ErrorLogFile" -ForegroundColor White
        Write-Host "  2. Verify Docker is running: docker info" -ForegroundColor White
        Write-Host "  3. Check container logs: docker-compose logs" -ForegroundColor White
        Write-Host "  4. Review documentation: https://github.com/141stfighterwing-collab/meetlink" -ForegroundColor White
        Write-Host ""
        
        Write-Log -Level ERROR -Message "Deployment failed with $($Script:Errors.Count) error(s)"
    }
}

# ============================================================================
# MAIN EXECUTION
# ============================================================================

try {
    # Initialize
    Show-Banner
    Initialize-Logging
    
    Write-Log -Level INFO -Message "========== MeetLink Deployment Started =========="
    Write-Log -Level INFO -Message "Script Version: $ScriptVersion"
    Write-Log -Level INFO -Message "Install Path: $InstallPath"
    Write-Log -Level INFO -Message "Silent Mode: $Silent"
    Write-Log -Level INFO -Message "Log Level: $LogLevel"
    
    # Execute deployment steps
    Test-Prerequisites
    Initialize-InstallationDirectory
    $credentials = Get-DeploymentCredentials
    Initialize-Repository
    New-EnvironmentConfiguration -Credentials $credentials
    Start-DockerDeployment
    Wait-ForServices
    Invoke-DatabaseSetup
    $success = Test-Deployment
    
    if ($success) {
        Show-DeploymentSummary
    } else {
        Show-ErrorSummary
        exit 1
    }
    
} catch {
    Write-Log -Level ERROR -Message "Unexpected error: $($_.Exception.Message)"
    Write-Log -Level ERROR -Message "Stack trace: $($_.ScriptStackTrace)"
    Show-ErrorSummary
    exit 1
}
