# Changelog

All notable changes to MeetLink will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-01-15

### Added

#### Mobile Responsive Design
- **Mobile Navigation Drawer**: Slide-in hamburger menu for mobile devices replacing sidebar
- **Responsive Dashboard Stats**: 2-column grid on mobile, 4-column on desktop
- **Touch-Friendly Components**: Increased tap targets and spacing for mobile interaction
- **Mobile-Optimized Layouts**: All dashboard pages adapt seamlessly to mobile screens
- **Mobile Footer**: Minimal footer with essential quick links for mobile users

#### Environment Variables Configuration UI
- **Settings Config Tab**: New tab in Settings panel for environment configuration
- **Environment Variables Editor**: Full-featured editor for modifying .env values
- **Categorized Variables**: Variables organized by category (App, Database, Auth, Email, Calendar, Security, Logging)
- **Password Masking**: Sensitive values hidden by default with reveal toggle
- **Save & Reload**: Save changes and reload application from UI
- **Backup Support**: Automatic backup before changes with restore capability
- **API Endpoint**: `/api/config/env` endpoint for reading and writing environment configuration

#### PowerShell Deployment Script v3.1.0
- **One-Click Mode**: `-OneClick` parameter for fully automated deployment
- **Auto-Configuration**: All settings pre-configured with sensible defaults
- **Temporary Admin Password**: Memorable auto-generated password for initial access
- **Password Display**: Clear, impossible-to-miss password display during deployment
- **Credentials File**: Temp credentials saved to `config\TEMP_ADMIN_CREDENTIALS.txt`
- **Password Change Reminder**: Multiple reminders to change password after first login
- **Environment Variable Pre-fill**: All known values auto-filled in .env file
- **Docker Environment Support**: Separate `.env.docker` for container networking
- **Comprehensive Validation**: Full deployment validation including:
  - SQL Database validation (connectivity, tables, port access)
  - Container health checks (running status, Docker network, resource stats)
  - App health and ports (health endpoint, API endpoints, static assets)
  - URL functionality testing (all main pages, booking routes)
  - Main functionality verification (dashboard, events, contacts, config APIs)
- **Validation Report**: Detailed pass/fail report with totals and error details

### Changed
- **Mobile Navigation**: Desktop sidebar now hidden on mobile, replaced with slide-in drawer
- **Header Component**: Added hamburger menu for mobile, responsive logo display
- **Dashboard Components**: All updated with responsive breakpoints
- **Theme Support**: All new components support the 6 built-in themes

### Technical Details

#### New Components
- `mobile-nav.tsx`: Sheet-based mobile navigation drawer
- `env-variables-config.tsx`: Environment variables configuration panel

#### New API Routes
- `GET /api/config/env`: Read environment configuration
- `POST /api/config/env`: Update environment configuration
- `POST /api/config/env/backup`: Create backup before changes

#### Updated Components
- `header.tsx`: Added mobile hamburger menu and responsive layout
- `settings-panel.tsx`: Added Config tab with EnvVariablesConfig
- All dashboard components: Mobile-responsive grids and spacing

---

## [1.0.0] - 2025-01-15

### Added

#### Core Features
- **Event Types Management**: Create, edit, and delete event types with custom durations, buffers, and availability settings
- **Booking Calendar**: Month, week, and day views with real-time availability display
- **Contact Management**: Full CRM-style contact database with groups, tags, and CardDAV support
- **Availability Scheduling**: Multiple schedules with override capabilities
- **Workflow Automation**: Email sequences, reminders, and follow-ups
- **Calendar Integrations**: Google Calendar, Outlook, CalDAV support
- **Video Conferencing**: Zoom, Google Meet, Microsoft Teams integration

#### Theming
- **6 Built-in Themes**: Light, Dark, Classy, Sunset, Mocha, Forest
- **Real-time Theme Preview**: See theme changes instantly
- **CSS Variable-based**: Easy customization of all colors

#### Security & Compliance
- **Row-Level Security (RLS)**: Multi-tenant data isolation at database level
- **Audit Logging**: Splunk-compatible audit trails
- **API Key Management**: Secure API access with key rotation
- **Session Management**: Configurable timeout settings

#### Deployment
- **Docker Compose**: Complete containerized deployment with PostgreSQL, Redis, and Nginx
- **PowerShell Script**: Automated Windows deployment with progress tracking and logging
- **Bash Script**: Linux/macOS deployment automation
- **Environment Configuration**: Comprehensive .env file management

#### Database
- **PostgreSQL 15+ Support**: Optimized schema with proper indexing
- **Prisma ORM**: Type-safe database access
- **Migration System**: Version-controlled database changes
- **Seed Data**: Initial data for quick start

#### API
- **RESTful API**: Complete CRUD operations for all resources
- **Dashboard Statistics**: Real-time booking analytics
- **Health Check Endpoint**: Service monitoring support

### Technical Details

#### Frontend
- Next.js 16 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui components
- Zustand for state management

#### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL with RLS
- Redis for caching

#### Infrastructure
- Docker multi-stage builds
- Nginx reverse proxy
- SSL/TLS support
- Rate limiting

### Deployment Scripts

#### PowerShell (v2.0.0)
- Progress percentage display
- Comprehensive logging with timestamps
- Error tracking and recovery
- Interactive credential configuration
- Password strength validation
- Service health verification

#### Bash
- Linux/macOS support
- Docker Compose integration
- Environment configuration

### Documentation
- Comprehensive README with:
  - Installation guides
  - Database recommendations (on-prem vs cloud)
  - Versioning and update procedures
  - API documentation
  - Troubleshooting guide
- CHANGELOG.md for version tracking
- Inline code documentation

---

## Version History

| Version | Release Date | Type | Description |
|---------|--------------|------|-------------|
| 1.1.0 | 2025-01-15 | Minor | Mobile responsive design, Environment Variables UI, PowerShell v3.0.0 |
| 1.0.0 | 2025-01-15 | Major | Initial release |

---

## Upgrade Guide

### From Development to 1.0.0

If you were using a development version before the 1.0.0 release:

1. **Backup your data**:
   ```bash
   pg_dump -U meetlink -d meetlink > backup.sql
   ```

2. **Pull the latest version**:
   ```bash
   git pull origin main
   git checkout v1.0.0
   ```

3. **Review configuration changes**:
   - Check `.env.example` for new environment variables
   - Update your `.env` file accordingly

4. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

5. **Restart services**:
   ```bash
   docker-compose down
   docker-compose up -d --build
   ```

---

## Roadmap

### [1.1.0] - Planned

#### New Features
- [x] ~~Mobile responsive improvements~~ ✅ Completed in v1.1.0
- [ ] Team scheduling with round-robin assignment
- [ ] Payment integration (Stripe, PayPal)
- [ ] SMS notifications via Twilio
- [ ] Custom booking pages with branding
- [ ] Calendar sync improvements

#### Enhancements
- [x] ~~Mobile responsive improvements~~ ✅ Completed in v1.1.0
- [ ] Performance optimizations
- [ ] Accessibility (WCAG 2.1 AA)
- [ ] Internationalization (i18n)

### [1.2.0] - Planned

#### New Features
- [ ] Zapier integration
- [ ] Webhook management UI
- [ ] Advanced analytics dashboard
- [ ] Custom themes builder
- [ ] API rate limiting per user

### [2.0.0] - Future

#### Breaking Changes
- [ ] API v2 with GraphQL support
- [ ] Microservices architecture
- [ ] Kubernetes deployment manifests

---

## Support

- **Documentation**: [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/141stfighterwing-collab/meetlink/issues)
- **Discussions**: [GitHub Discussions](https://github.com/141stfighterwing-collab/meetlink/discussions)

---

## License

MIT License - See [LICENSE](LICENSE) for details.
