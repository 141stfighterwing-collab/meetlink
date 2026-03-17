# MeetLink

**Self-Hosted Scheduling Platform** - A comprehensive Calendly alternative with enterprise-grade features.

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/141stfighterwing-collab/meetlink)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15%2B-blue.svg)](https://www.postgresql.org/)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Quick Start (1-Click Deploy)](#quick-start-1-click-deploy)
- [Installation Methods](#installation-methods)
  - [Docker Deployment (Recommended)](#docker-deployment-recommended)
  - [Manual Installation](#manual-installation)
  - [Cloud Deployment](#cloud-deployment)
- [Database Configuration](#database-configuration)
  - [On-Premises Database](#on-premises-database)
  - [Cloud Database Options](#cloud-database-options)
  - [Database Recommendations](#database-recommendations)
- [PowerShell Deployment](#powershell-deployment)
- [Configuration](#configuration)
- [Versioning & Updates](#versioning--updates)
- [API Documentation](#api-documentation)
- [Troubleshooting](#troubleshooting)
- [Frequently Asked Questions (FAQ)](#frequently-asked-questions-faq)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

MeetLink is a fully-featured, self-hosted scheduling application that replicates and extends Calendly's core functionality. Built with modern technologies and designed for enterprises requiring complete data sovereignty.

### Technology Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui |
| Backend | Next.js API Routes |
| Database | PostgreSQL 15+ (Prisma ORM) |
| Cache | Redis 7+ |
| Deployment | Docker, Docker Compose |
| Web Server | Nginx (SSL, Rate Limiting) |

---

## Features

### Core Scheduling
- **Event Types**: Create unlimited event types with custom durations, buffers, and availability
- **Booking Calendar**: Month, week, and day views with real-time availability
- **Timezone Support**: Automatic timezone detection and conversion
- **Recurring Events**: Daily, weekly, and custom recurrence patterns

### Contact Management
- **Contact Database**: Full CRM-style contact management
- **Contact Groups**: Organize contacts into groups for targeted scheduling
- **CardDAV Integration**: Sync contacts from external sources
- **Tags & Notes**: Rich contact metadata

### Availability & Scheduling
- **Multiple Schedules**: Create separate availability for different event types
- **Schedule Overrides**: Temporary availability changes
- **Buffer Times**: Configure buffers before/after meetings
- **Meeting Limits**: Daily and weekly meeting caps

### Integrations
- **Calendar Sync**: Google Calendar, Outlook, CalDAV support
- **Video Conferencing**: Zoom, Google Meet, Microsoft Teams
- **Webhooks**: Real-time event notifications
- **Workflows**: Automated email sequences and reminders

### Security & Compliance
- **Row-Level Security (RLS)**: Multi-tenant data isolation
- **Audit Logging**: Splunk-compatible audit trails
- **SSO Ready**: SAML 2.0, OAuth 2.0 support
- **API Keys**: Secure API access management

### Theming
- **6 Built-in Themes**: Light, Dark, Classy, Sunset, Mocha, Forest
- **Custom Themes**: Create your own color schemes
- **Real-time Preview**: See changes instantly

---

## Quick Start (1-Click Deploy)

### Prerequisites
- Docker Desktop installed and running
- PowerShell 5.1+ (Windows) or Bash (Linux/macOS)
- 4GB RAM minimum, 8GB recommended
- 10GB disk space minimum

### Windows (PowerShell)

```powershell
# Download and run the 1-click installer
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/141stfighterwing-collab/meetlink/main/download/deploy-meetlink.ps1" -OutFile "deploy-meetlink.ps1"
.\deploy-meetlink.ps1
```

### Linux/macOS (Bash)

```bash
# Download and run the 1-click installer
curl -fsSL https://raw.githubusercontent.com/141stfighterwing-collab/meetlink/main/download/deploy-meetlink.sh | bash
```

The 1-click installer will:
1. ✅ Check system prerequisites
2. ✅ Clone the repository
3. ✅ Set up PostgreSQL database
4. ✅ Configure environment variables
5. ✅ Build and start Docker containers
6. ✅ Run database migrations
7. ✅ Seed initial data
8. ✅ Display access URLs

---

## Installation Methods

### Docker Deployment (Recommended)

Docker is the recommended deployment method for production environments.

#### Step 1: Clone Repository

```bash
git clone https://github.com/141stfighterwing-collab/meetlink.git
cd meetlink
```

#### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env
```

#### Step 3: Deploy with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

#### Step 4: Access Application

- **Application**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379

### Manual Installation

For development or custom deployments without Docker.

#### Prerequisites
- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optional, for caching)

#### Installation Steps

```bash
# Clone repository
git clone https://github.com/141stfighterwing-collab/meetlink.git
cd meetlink

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# Seed initial data (optional)
npm run seed

# Start development server
npm run dev

# Or build for production
npm run build
npm start
```

### Cloud Deployment

MeetLink can be deployed to various cloud platforms:

#### AWS

```yaml
# Using AWS ECS with Fargate
# See: docs/deployment/aws.md
```

#### Google Cloud Platform

```yaml
# Using Cloud Run with Cloud SQL
# See: docs/deployment/gcp.md
```

#### Azure

```yaml
# Using Azure Container Apps with Azure Database for PostgreSQL
# See: docs/deployment/azure.md
```

#### Vercel (Frontend Only)

```bash
# Note: Requires external PostgreSQL and Redis
vercel deploy
```

---

## Database Configuration

### On-Premises Database

For on-premises deployments, we recommend PostgreSQL 15 or higher.

#### Minimum Requirements

| Environment | CPU | RAM | Storage | Connections |
|-------------|-----|-----|---------|-------------|
| Development | 2 cores | 2GB | 10GB | 20 |
| Staging | 4 cores | 4GB | 50GB | 50 |
| Production | 8 cores | 16GB | 100GB+ | 100+ |

#### PostgreSQL Configuration

```ini
# postgresql.conf optimizations for production
max_connections = 200
shared_buffers = 4GB
effective_cache_size = 12GB
maintenance_work_mem = 1GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 20MB
min_wal_size = 1GB
max_wal_size = 4GB
```

### Cloud Database Options

#### Supabase (Recommended for Quick Start)

Supabase provides managed PostgreSQL with built-in authentication and real-time features.

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Pros:**
- Free tier available (500MB)
- Automatic backups
- Built-in authentication
- Real-time subscriptions
- Dashboard and SQL editor

**Cons:**
- Connection pooling required for serverless
- Limited customization

#### Neon (Serverless PostgreSQL)

Neon is a serverless PostgreSQL platform with automatic scaling.

```env
DATABASE_URL="postgresql://[USER]:[PASSWORD]@[ENDPOINT].neon.tech/neondb?sslmode=require"
```

**Pros:**
- Serverless scaling
- Branching for development
- Generous free tier
- Auto-suspend when inactive

**Cons:**
- Cold start latency
- Limited regions

#### AWS RDS for PostgreSQL

Enterprise-grade managed PostgreSQL on AWS.

```env
DATABASE_URL="postgresql://meetlink:[PASSWORD]@[RDS-ENDPOINT]:5432/meetlink"
```

**Pros:**
- Enterprise SLA
- Multi-AZ availability
- Point-in-time recovery
- Integration with AWS services

**Cons:**
- Higher cost
- AWS knowledge required

#### Azure Database for PostgreSQL

Fully managed PostgreSQL on Microsoft Azure.

```env
DATABASE_URL="postgresql://meetlink@[SERVER]@[SERVER].postgres.database.azure.com:5432/meetlink?sslmode=require"
```

#### Google Cloud SQL for PostgreSQL

Managed PostgreSQL on Google Cloud Platform.

```env
DATABASE_URL="postgresql://meetlink:[PASSWORD]@/meetlink?host=/cloudsql/[PROJECT]:[REGION]:[INSTANCE]"
```

### Database Recommendations

| Use Case | Recommended | Reason |
|----------|-------------|--------|
| Development | Local PostgreSQL or Supabase Free | Zero cost, easy setup |
| Small Team (< 10 users) | Supabase Pro or Neon | Managed, cost-effective |
| Medium Team (10-50 users) | AWS RDS or Azure PostgreSQL | Reliability, support |
| Enterprise (50+ users) | AWS RDS Multi-AZ or Self-hosted | Control, compliance |
| Self-Hosted Production | PostgreSQL 15+ on dedicated server | Full control, data sovereignty |

---

## PowerShell Deployment

The PowerShell deployment script provides automated, logged deployment with progress tracking.

### Download

```powershell
# Download the latest script
Invoke-WebRequest -Uri "https://raw.githubusercontent.com/141stfighterwing-collab/meetlink/main/download/setup-meetlink.ps1" -OutFile "setup-meetlink.ps1"
```

### Usage

```powershell
# Run with default settings (interactive prompts)
.\setup-meetlink.ps1

# Run with specific parameters
.\setup-meetlink.ps1 -InstallPath "C:\MeetLink" -DatabaseHost "localhost" -DatabasePort 5432

# Run silently with all parameters specified
.\setup-meetlink.ps1 `
    -InstallPath "C:\MeetLink" `
    -DatabaseHost "localhost" `
    -DatabasePort 5432 `
    -DatabaseName "meetlink" `
    -DatabaseUser "meetlink_admin" `
    -DatabasePassword "YourSecurePassword123!" `
    -AdminEmail "admin@company.com" `
    -AdminPassword "AdminSecurePass456!" `
    -Silent
```

### Parameters

| Parameter | Description | Default |
|-----------|-------------|---------|
| `-InstallPath` | Installation directory | `C:\MeetLink` |
| `-DatabaseHost` | PostgreSQL host | `localhost` |
| `-DatabasePort` | PostgreSQL port | `5432` |
| `-DatabaseName` | Database name | `meetlink` |
| `-DatabaseUser` | Database username | Prompt |
| `-DatabasePassword` | Database password | Prompt |
| `-AdminEmail` | Admin user email | Prompt |
| `-AdminPassword` | Admin user password | Prompt |
| `-Silent` | Run without prompts | `false` |
| `-SkipDocker` | Skip Docker installation | `false` |
| `-LogLevel` | Log verbosity (Quiet/Normal/Detailed) | `Normal` |

### Logging

All deployment activities are logged with timestamps and progress percentages:

```
[2025-01-15 10:30:45] [INFO] ========== MeetLink Deployment Started ==========
[2025-01-15 10:30:45] [INFO] PowerShell Version: 5.1.19041.4648
[2025-01-15 10:30:45] [INFO] OS: Microsoft Windows 10 Pro
[2025-01-15 10:30:45] [INFO] ========================================
[2025-01-15 10:30:46] [PROGRESS] 5% - Checking prerequisites...
[2025-01-15 10:30:47] [INFO] Docker Desktop is installed and running
[2025-01-15 10:30:48] [SUCCESS] All prerequisites met
[2025-01-15 10:30:48] [PROGRESS] 10% - Creating installation directory...
...
[2025-01-15 10:35:22] [PROGRESS] 95% - Verifying deployment...
[2025-01-15 10:35:25] [SUCCESS] MeetLink is running at http://localhost:3000
[2025-01-15 10:35:25] [PROGRESS] 100% - Deployment complete!
```

Log files are saved to:
- Windows: `C:\MeetLink\logs\deploy-YYYYMMDD-HHMMSS.log`
- Linux/macOS: `/var/log/meetlink/deploy-YYYYMMDD-HHMMSS.log`

### Error Handling

The script includes comprehensive error handling:

```powershell
# Example error log entry
[2025-01-15 10:30:50] [ERROR] Failed to connect to PostgreSQL
[2025-01-15 10:30:50] [ERROR] Details: Connection refused - Is PostgreSQL running?
[2025-01-15 10:30:50] [INFO] Attempting recovery: Starting PostgreSQL container...
[2025-01-15 10:30:55] [SUCCESS] PostgreSQL started successfully
[2025-01-15 10:30:55] [INFO] Retrying database connection...
```

---

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://meetlink.yourcompany.com
NEXT_PUBLIC_APP_NAME=MeetLink

# Database
DATABASE_URL=postgresql://meetlink:password@localhost:5432/meetlink?schema=public

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_SECRET=your-super-secret-key-change-in-production
NEXTAUTH_URL=https://meetlink.yourcompany.com

# Email (SMTP)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
EMAIL_FROM=noreply@yourcompany.com

# Calendar Integrations
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
ZOOM_CLIENT_ID=your-zoom-client-id
ZOOM_CLIENT_SECRET=your-zoom-client-secret

# Security
CORS_ORIGINS=https://meetlink.yourcompany.com
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Logging
LOG_LEVEL=info
AUDIT_LOG_ENABLED=true
```

### Docker Compose Configuration

The `docker-compose.yml` file includes:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://meetlink:${DB_PASSWORD}@postgres:5432/meetlink
    depends_on:
      - postgres
      - redis

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: meetlink
      POSTGRES_USER: meetlink
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl

volumes:
  postgres_data:
  redis_data:
```

---

## Versioning & Updates

### Versioning Scheme

MeetLink follows [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

Examples:
1.0.0 - Initial release
1.1.0 - New features (backward compatible)
1.1.1 - Bug fixes
2.0.0 - Breaking changes
```

### Current Version

| Version | Release Date | Status |
|---------|--------------|--------|
| 1.0.0 | 2025-01-15 | Current (Stable) |

### Checking Your Version

```bash
# Check installed version
npm run version

# Or check package.json
cat package.json | grep '"version"'
```

### Updating MeetLink

#### Patch Updates (Bug Fixes)

```bash
# Pull latest patch version
git pull origin main
docker-compose build --no-cache
docker-compose up -d

# Run any pending migrations
npx prisma migrate deploy
```

#### Minor Updates (New Features)

```bash
# Pull latest minor version
git fetch --tags
git checkout $(git describe --tags `git rev-list --tags --max-count=1`)

# Rebuild and restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# Run migrations
npx prisma migrate deploy
```

#### Major Updates (Breaking Changes)

⚠️ **Always backup before major updates!**

```bash
# 1. Backup database
pg_dump -U meetlink -d meetlink > backup-$(date +%Y%m%d).sql

# 2. Backup environment
cp .env .env.backup

# 3. Pull new version
git fetch --tags
git checkout v2.0.0

# 4. Review migration notes
cat docs/migrations/v2.0.0.md

# 5. Update configuration
# ... follow migration guide ...

# 6. Rebuild and deploy
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 7. Run migrations
npx prisma migrate deploy

# 8. Verify deployment
npm run health-check
```

### Update Notifications

Subscribe to release notifications:

1. **GitHub Watch**: Watch the repository for releases
2. **RSS Feed**: `https://github.com/141stfighterwing-collab/meetlink/releases.atom`
3. **Webhook**: Configure webhook for automated update checks

### Changelog

All changes are documented in [CHANGELOG.md](CHANGELOG.md).

---

## API Documentation

### REST API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/event-types` | GET, POST | Manage event types |
| `/api/bookings` | GET, POST | Manage bookings |
| `/api/contacts` | GET, POST, PUT, DELETE | Contact management |
| `/api/availabilities` | GET, POST | Availability settings |
| `/api/calendars` | GET, POST | Calendar integrations |
| `/api/workflows` | GET, POST | Workflow automation |
| `/api/dashboard` | GET | Dashboard statistics |

### Authentication

API requests require authentication via Bearer token:

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://meetlink.yourcompany.com/api/bookings
```

### Rate Limits

| Plan | Requests/minute | Requests/day |
|------|-----------------|--------------|
| Free | 60 | 1,000 |
| Pro | 300 | 10,000 |
| Enterprise | Unlimited | Unlimited |

---

## Troubleshooting

### Common Issues

#### Database Connection Failed

```
Error: Connection refused to database
```

**Solution:**
1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check connection string in `.env`
3. Verify network connectivity: `docker-compose exec app ping postgres`

#### Docker Container Won't Start

```
Error: Container exits immediately
```

**Solution:**
1. Check logs: `docker-compose logs app`
2. Verify environment variables
3. Check port conflicts: `netstat -tlnp | grep 3000`

#### Migration Fails

```
Error: Migration failed
```

**Solution:**
1. Check database permissions
2. Run: `npx prisma migrate reset` (⚠️ deletes data)
3. Restore from backup if needed

### Health Checks

```bash
# Application health
curl http://localhost:3000/api/health

# Database health
docker-compose exec postgres pg_isready

# Redis health
docker-compose exec redis redis-cli ping
```

### Log Locations

| Component | Log Location |
|-----------|--------------|
| Application | `/var/log/meetlink/app.log` |
| PostgreSQL | `/var/log/meetlink/postgres.log` |
| Nginx | `/var/log/meetlink/nginx/` |
| Deployment | `C:\MeetLink\logs\` (Windows) |

### Getting Help

1. **Documentation**: Check this README and `/docs` folder
2. **Issues**: [GitHub Issues](https://github.com/141stfighterwing-collab/meetlink/issues)
3. **Discussions**: [GitHub Discussions](https://github.com/141stfighterwing-collab/meetlink/discussions)

---

## Frequently Asked Questions (FAQ)

### General Questions

#### What is MeetLink?

MeetLink is a self-hosted scheduling platform similar to Calendly. It allows users to create booking pages, manage appointments, and integrate with various calendar services. Unlike Calendly, MeetLink gives you complete control over your data as it runs on your own infrastructure.

#### Is MeetLink free?

Yes! MeetLink is open-source and free to use under the MIT license. You only pay for your own hosting infrastructure (server, database, etc.).

#### How does MeetLink compare to Calendly?

| Feature | MeetLink | Calendly |
|---------|----------|----------|
| Self-hosted | ✅ Yes | ❌ No |
| Data ownership | ✅ Full control | ❌ Stored on Calendly servers |
| Custom branding | ✅ Full customization | 💰 Paid plans only |
| API access | ✅ Free | 💰 Paid plans only |
| Unlimited events | ✅ Yes | 💰 Paid plans only |
| Cost | Free (hosting only) | $8-$16/user/month |

### Installation & Setup

#### What are the minimum system requirements?

- **CPU**: 2 cores minimum, 4+ recommended
- **RAM**: 4GB minimum, 8GB+ recommended
- **Storage**: 10GB minimum, 50GB+ for production
- **Software**: Docker & Docker Compose, or Node.js 20+

#### Can I run MeetLink without Docker?

Yes, you can run MeetLink manually with:
- Node.js 20+
- PostgreSQL 15+
- Redis 7+ (optional)

See [Manual Installation](#manual-installation) for details.

#### Does the PowerShell script work on Windows 7?

No, the PowerShell script requires PowerShell 5.1+ which comes with Windows 10/11 and Windows Server 2016+. For older systems, use the manual installation method.

#### Why does the script require Administrator privileges?

Administrator privileges are needed to:
- Create installation directories in protected paths
- Configure Windows Firewall rules
- Install Docker if not present

You can run without admin rights by specifying a user-writable `-InstallPath`.

#### How do I run MeetLink on a different port?

Modify your `.env` file:

```env
APP_PORT=8080
```

Or in `docker-compose.yml`:

```yaml
services:
  app:
    ports:
      - "8080:3000"  # Maps host port 8080 to container port 3000
```

### Database Questions

#### Which database does MeetLink support?

MeetLink is designed for **PostgreSQL 15+**. Other databases (MySQL, SQLite) are not officially supported.

#### Should I use a cloud database or self-hosted?

| Scenario | Recommendation |
|----------|----------------|
| Development/Testing | Local PostgreSQL in Docker |
| Small Team (< 10 users) | Supabase or Neon (free tiers) |
| Medium Team (10-50) | AWS RDS or Azure PostgreSQL |
| Enterprise (50+ users) | Self-hosted PostgreSQL or AWS RDS Multi-AZ |
| Compliance requirements | Self-hosted PostgreSQL |

#### How do I migrate from one database to another?

1. **Export data**:
   ```bash
   pg_dump -U meetlink -d meetlink > backup.sql
   ```

2. **Update DATABASE_URL** in `.env`

3. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

4. **Import data**:
   ```bash
   psql -U meetlink -d meetlink < backup.sql
   ```

#### How do I backup my database?

**Manual backup**:
```bash
# PostgreSQL
pg_dump -U meetlink -d meetlink > backup-$(date +%Y%m%d).sql

# Docker volume backup
docker run --rm -v meetlink_postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz /data
```

**Automated backup script**:
```bash
#!/bin/bash
# Add to cron: 0 2 * * * /path/to/backup.sh
BACKUP_DIR="/backups/meetlink"
mkdir -p $BACKUP_DIR
pg_dump -U meetlink -d meetlink | gzip > $BACKUP_DIR/meetlink-$(date +%Y%m%d-%H%M%S).sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete
```

### Docker & Deployment

#### Docker containers won't start. What should I do?

1. **Check logs**:
   ```bash
   docker-compose logs -f
   ```

2. **Verify environment**:
   ```bash
   cat .env  # Ensure all required variables are set
   ```

3. **Check port conflicts**:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   
   # Linux/macOS
   lsof -i :3000
   ```

4. **Reset containers**:
   ```bash
   docker-compose down -v  # Removes volumes too
   docker-compose up -d --build
   ```

#### How do I update MeetLink to the latest version?

```bash
cd meetlink
git pull origin main
docker-compose down
docker-compose up -d --build
npx prisma migrate deploy
```

See [Versioning & Updates](#versioning--updates) for detailed instructions.

#### Can I run MeetLink behind a reverse proxy?

Yes! MeetLink works well behind Nginx, Traefik, or Caddy:

**Nginx example**:
```nginx
server {
    listen 80;
    server_name meetlink.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### How do I enable HTTPS?

**Using Let's Encrypt with Certbot**:
```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d meetlink.yourdomain.com

# Auto-renewal
sudo systemctl enable certbot.timer
```

**Using Docker with Caddy**:
```yaml
# docker-compose.yml addition
caddy:
  image: caddy:2
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile
    - caddy_data:/data
```

### Troubleshooting

#### "Permission denied" errors during installation

```bash
# Linux/macOS
sudo chown -R $USER:$USER /opt/meetlink
chmod -R 755 /opt/meetlink

# Windows (run as Administrator)
icacls "C:\MeetLink" /grant Users:F /T
```

#### Database migration errors

```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or manually fix:
npx prisma migrate resolve --applied <migration_name>
npx prisma migrate deploy
```

#### Application shows blank page

1. Check browser console for JavaScript errors
2. Verify `NEXT_PUBLIC_APP_URL` matches your actual URL
3. Clear browser cache and rebuild:
   ```bash
   rm -rf .next
   npm run build
   ```

#### PowerShell script says "execution restricted"

```powershell
# Temporarily allow script execution
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Or run with bypass
powershell -ExecutionPolicy Bypass -File .\deploy-meetlink.ps1
```

#### Port 3000 is already in use

```bash
# Find what's using port 3000
# Windows
netstat -ano | findstr :3000

# Linux/macOS
lsof -i :3000

# Kill the process or change MeetLink's port in .env
APP_PORT=3001
```

### Feature Questions

#### Can I customize the booking page?

Yes! MeetLink supports:
- Custom themes (6 built-in themes)
- Custom colors via CSS variables
- Custom branding (logo, company name)
- Custom email templates

#### Does MeetLink support team scheduling?

Yes, MeetLink supports:
- Multiple users with individual calendars
- Team event types (round-robin coming soon)
- Shared availability
- Team member management

#### How do I integrate with Google Calendar?

1. Create a Google Cloud project
2. Enable Google Calendar API
3. Configure OAuth credentials
4. Add to `.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```
5. Restart MeetLink

#### Is there a mobile app?

MeetLink is a Progressive Web App (PWA) that works on mobile browsers. You can add it to your home screen for an app-like experience. Native mobile apps are on the roadmap.

### Security Questions

#### Is MeetLink secure?

MeetLink includes several security features:
- Row-Level Security (RLS) for multi-tenant isolation
- Audit logging (Splunk-compatible)
- Encrypted sessions and tokens
- HTTPS enforcement
- Rate limiting
- Input validation and sanitization

#### How do I enable two-factor authentication?

1. Go to Settings → Security
2. Click "Enable 2FA"
3. Scan QR code with your authenticator app
4. Enter verification code

#### Where are passwords stored?

Passwords are hashed using bcrypt and stored in the PostgreSQL database. They are never stored in plain text or logs.

#### How do I rotate API keys?

1. Go to Settings → Security → API Keys
2. Click "Generate New API Key"
3. Update your integrations with the new key
4. Revoke the old key after verification

### Support

#### Where can I get help?

1. **Documentation**: This README and `/docs` folder
2. **FAQ**: This section
3. **GitHub Issues**: [Report bugs](https://github.com/141stfighterwing-collab/meetlink/issues)
4. **Discussions**: [Ask questions](https://github.com/141stfighterwing-collab/meetlink/discussions)

#### How do I report a bug?

1. Check existing issues first
2. Create a new issue with:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment details (OS, Node.js version, etc.)
   - Logs (redact sensitive info)

#### Can I request a feature?

Yes! Open a GitHub issue with the "enhancement" label and describe:
- The feature you want
- Why it would be useful
- Any implementation ideas

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR-USERNAME/meetlink.git
cd meetlink

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/my-feature

# Run development server
npm run dev

# Run tests
npm test

# Submit pull request
```

---

## License

MIT License - See [LICENSE](LICENSE) for details.

---

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
- Inspired by [Calendly](https://calendly.com/)

---

**MeetLink** - *Self-hosted scheduling, your data, your control.*
