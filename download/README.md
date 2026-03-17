# MeetLink - Self-Hosted Scheduling Platform

<div align="center">

![MeetLink Logo](https://via.placeholder.com/200x80/10B981/FFFFFF?text=MeetLink)

**A privacy-focused, self-hosted alternative to Calendly**

[![Version](https://img.shields.io/badge/version-1.0.0-emerald.svg)](https://github.com/meetlink/meetlink)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)](docker-compose.yml)
[![PostgreSQL](https://img.shields.io/badge/postgresql-16-blue.svg)](https://www.postgresql.org/)

[Features](#features) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Deployment](#deployment) • [Security](#security)

</div>

---

## Overview

MeetLink is a self-hosted scheduling application that replicates Calendly's core functionality with a modern, customizable interface designed for privacy-focused users. Perfect for IT security environments, government agencies, and organizations requiring CJIS/NIST compliance without relying on SaaS solutions.

### Why MeetLink?

- **🔒 Privacy First**: Your data stays on your servers. No third-party tracking.
- **🏢 Enterprise Ready**: Row-level security, audit logs, multi-tenant support.
- **🎨 Modern UI**: Clean, responsive interface matching Calendly's design.
- **🔗 Integrations**: Google Calendar, Outlook, Zoom, Teams, and more.
- **📱 Responsive**: Works seamlessly on desktop, tablet, and mobile.
- **🐳 Easy Deployment**: Docker Compose setup with one-command deployment.

---

## Features

### Event Types
- **One-on-One Meetings**: Classic individual scheduling
- **Group Events**: Multiple attendees with capacity limits
- **Round-Robin**: Distribute meetings across team members
- **Collective Scheduling**: Team availability-based booking

### Scheduling Options
- Customizable durations (15, 30, 45, 60, 90 minutes or custom)
- Buffer times before and after meetings
- Daily and weekly booking limits
- Minimum notice and maximum booking window
- Timezone-aware scheduling

### Calendar Integrations
- Google Calendar (bidirectional sync)
- Microsoft Outlook Calendar
- iCal feed support
- CardDAV for contacts
- Automatic conflict detection

### Video Conferencing
- Zoom integration with auto-generated links
- Microsoft Teams integration
- Google Meet integration
- Custom meeting links

### Contacts Module
- Full contact management
- Contact groups and tags
- VCF import/export
- CardDAV synchronization
- Booking history tracking

### Security & Compliance
- Row-level security (RLS) for data isolation
- Splunk-compatible audit logs
- Professional email validation
- Session management
- Two-factor authentication
- API key management

---

## Quick Start

### Prerequisites

- Docker Desktop 4.0+
- Docker Compose 2.0+
- PowerShell 5.1+ (for deployment script)
- 4GB RAM minimum (8GB recommended)
- 10GB disk space

### One-Command Deployment

```powershell
# Clone the repository
git clone https://github.com/meetlink/meetlink.git
cd meetlink

# Run the deployment script
.\deploy-meetlink.ps1
```

The interactive script will:
1. Check all prerequisites
2. Generate secure credentials
3. Create environment files
4. Initialize the database
5. Deploy all services

### Manual Deployment

```bash
# 1. Copy environment template
cp .env.example .env.production

# 2. Edit environment variables
nano .env.production

# 3. Start services
docker-compose up -d

# 4. Run database migrations
docker exec meetlink-app npx prisma migrate deploy

# 5. Access the application
open http://localhost:3000
```

---

## Documentation

### Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Database Schema](#database-schema)
4. [API Reference](#api-reference)
5. [Security Guide](#security-guide)
6. [Troubleshooting](#troubleshooting)

### Installation

#### Docker Installation (Recommended)

MeetLink is designed to run in Docker containers for easy deployment and isolation.

```bash
# Pull the latest image
docker pull meetlink/meetlink:latest

# Or build from source
docker build -t meetlink/meetlink .
```

#### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| CPU | 2 cores | 4 cores |
| RAM | 4 GB | 8 GB |
| Storage | 10 GB | 50 GB |
| Network | 100 Mbps | 1 Gbps |

### Configuration

#### Environment Variables

Create a `.env.production` file with the following variables:

```env
# Database
DATABASE_URL=postgresql://user:password@postgres:5432/meetlink
POSTGRES_USER=meetlink
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=meetlink

# Application
NEXT_PUBLIC_APP_URL=https://meetlink.yourdomain.com
NEXT_PUBLIC_APP_NAME=MeetLink

# Authentication
NEXTAUTH_SECRET=your_32_char_secret_here
NEXTAUTH_URL=https://meetlink.yourdomain.com

# Security
ENCRYPTION_KEY=your_32_char_encryption_key
JWT_SECRET=your_jwt_secret

# Email (Optional)
SMTP_HOST=smtp.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=your_smtp_password

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Database Schema

MeetLink uses PostgreSQL with Prisma ORM. Key models include:

- **User**: User accounts and profiles
- **EventType**: Meeting templates and configurations
- **Booking**: Scheduled meetings
- **Contact**: Contact directory
- **Availability**: Schedules and overrides
- **Calendar**: External calendar connections
- **Workflow**: Automation rules
- **AuditLog**: Security audit trail

Full schema documentation: [docs/database.md](docs/database.md)

---

## Deployment

### Production Deployment

#### Option 1: PowerShell Script

```powershell
.\deploy-meetlink.ps1 -Interactive
```

Features:
- Interactive configuration wizard
- Automatic secure password generation
- Password strength validation
- Prerequisite checking
- Docker health checks

#### Option 2: Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

#### Option 3: Kubernetes

Helm charts available in `/helm` directory.

### Reverse Proxy Configuration

For production, use Nginx or Traefik:

```nginx
# Nginx configuration
server {
    listen 443 ssl http2;
    server_name meetlink.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://meetlink-app:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### SSL/TLS Configuration

1. Obtain SSL certificates (Let's Encrypt recommended)
2. Configure in Nginx Proxy Manager or Traefik
3. Update `NEXTAUTH_URL` to use HTTPS

---

## Security

### Built-in Security Features

| Feature | Description |
|---------|-------------|
| Row-Level Security | PostgreSQL RLS for multi-tenant isolation |
| Audit Logging | Splunk-compatible JSON logs |
| Password Policy | Configurable strength requirements |
| Session Management | Configurable timeout, secure cookies |
| API Key Rotation | Automated key management |
| 2FA Ready | TOTP support (configuration ready) |

### Compliance

MeetLink supports compliance with:

- **CJIS**: Criminal Justice Information Services
- **NIST 800-53**: Security and Privacy Controls
- **SOC 2**: Service Organization Controls
- **GDPR**: General Data Protection Regulation

### Security Hardening

```bash
# Enable firewall rules (FortiGate example)
config firewall policy
edit 1
    set name "MeetLink-API"
    set srcintf "any"
    set dstintf "any"
    set action accept
    set schedule "always"
    set service "HTTPS"
    set logtraffic all
next
end
```

### Audit Log Format

```json
{
  "timestamp": "2025-03-17T10:30:00Z",
  "user_id": "user_abc123",
  "action": "BOOKING_CREATED",
  "entity_type": "Booking",
  "entity_id": "booking_xyz789",
  "ip_address": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "severity": "INFO",
  "is_sensitive": false
}
```

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      MeetLink Architecture                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │   Nginx     │    │   MeetLink  │    │  PostgreSQL │     │
│  │   :443      │───▶│   App:3000  │───▶│    :5432    │     │
│  │  (SSL/TLS)  │    │  (Next.js)  │    │  (Prisma)   │     │
│  └─────────────┘    └──────┬──────┘    └─────────────┘     │
│                            │                                │
│                            ▼                                │
│                     ┌─────────────┐                        │
│                     │    Redis    │                        │
│                     │    :6379    │                        │
│                     │  (Cache)    │                        │
│                     └─────────────┘                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              External Integrations                    │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐    │   │
│  │  │ Google  │ │ Outlook │ │  Zoom   │ │  Teams  │    │   │
│  │  │Calendar │ │Calendar │ │ Meeting │ │ Meeting │    │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| UI Components | shadcn/ui, Radix UI, Lucide Icons |
| State Management | Zustand, TanStack Query |
| Backend | Next.js API Routes, Server Actions |
| Database | PostgreSQL 16, Prisma ORM |
| Authentication | NextAuth.js v4 |
| Deployment | Docker, Docker Compose |
| Caching | Redis |
| Reverse Proxy | Nginx |

---

## Development

### Local Development

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run database migrations
bun run db:push

# Generate Prisma client
bun run db:generate
```

### Testing

```bash
# Run unit tests
bun test

# Run e2e tests
bun test:e2e

# Run linting
bun run lint
```

### Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

- 📖 [Documentation](https://docs.meetlink.io)
- 💬 [Discord Community](https://discord.gg/meetlink)
- 🐛 [Issue Tracker](https://github.com/meetlink/meetlink/issues)
- 📧 [Email Support](mailto:support@meetlink.io)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ by the MeetLink Team**

[Website](https://meetlink.io) • [Documentation](https://docs.meetlink.io) • [GitHub](https://github.com/meetlink)

</div>
