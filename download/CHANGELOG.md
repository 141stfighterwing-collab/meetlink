# MeetLink Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-03-17

### Added

#### Core Features
- **Event Types Management**
  - One-on-one meeting scheduling
  - Group event booking with attendee limits
  - Round-robin scheduling with configurable strategies
  - Collective scheduling for team meetings
  - Customizable durations (15, 30, 45, 60, 90 minutes or custom)
  - Buffer times (before and after meetings)
  - Daily and weekly booking limits
  - Minimum booking notice and maximum booking window settings

- **Booking System**
  - Calendar views (month, week, day)
  - Real-time availability display
  - Booking status management (pending, confirmed, cancelled, no-show)
  - Rescheduling and cancellation support
  - Video conference auto-generation
  - Location support (video, phone, in-person, custom)
  - Timezone detection and selection

- **Contacts Module**
  - Contact management with full profile details
  - Contact groups and tagging
  - VCF import/export support
  - CardDAV sync configuration (UI ready)
  - Contact search and filtering
  - Booking history per contact
  - Source tracking (manual, booking, import, CardDAV, API)

- **Availability Management**
  - Weekly schedule configuration
  - Multiple time slots per day
  - Date-specific overrides
  - Holiday and time-off management
  - Timezone support

- **Calendar Integrations**
  - Google Calendar integration (OAuth flow ready)
  - Microsoft Outlook Calendar integration (OAuth flow ready)
  - iCal feed support
  - Bidirectional sync configuration
  - Conflict detection settings

- **Video Conferencing**
  - Zoom integration
  - Microsoft Teams integration
  - Google Meet integration
  - Auto-generate meeting links

- **Workflows & Automation**
  - Trigger-based automation (booking created, confirmed, cancelled, before/after event)
  - Email actions
  - SMS actions (configuration ready)
  - Notification actions
  - Webhook support
  - Event type targeting

- **Security Features**
  - Row-level security (RLS) for multi-tenant isolation
  - Audit logging in Splunk-compatible format
  - Session management
  - API key management
  - Two-factor authentication (configuration ready)
  - Password strength validation
  - Secure credential storage

#### User Interface
- Modern, responsive design with Tailwind CSS v4
- Dark/Light theme support
- Collapsible sidebar navigation
- Real-time notifications dropdown
- Quick actions panel
- Dashboard with statistics and upcoming bookings
- Recent activity feed

#### Database
- PostgreSQL-compatible Prisma schema
- Comprehensive models for:
  - Users and authentication
  - Event types and scheduling
  - Bookings and reminders
  - Contacts and groups
  - Availability and schedules
  - Calendar integrations
  - Workflows and notifications
  - Audit logs

#### Deployment
- Docker Compose configuration
- Multi-stage Dockerfile for optimized production builds
- Nginx reverse proxy configuration
- Redis for caching and sessions
- Health checks for all services

#### PowerShell Deployment
- Interactive configuration wizard
- Automatic password generation
- Password strength validation
- Prerequisite checking
- Environment file generation
- Database initialization script creation
- Automatic Docker deployment

### Security
- Professional email validation (blocks Gmail, Yahoo for enterprise use)
- Secure password generation (24 characters with special characters)
- Encrypted credential storage
- JWT-based authentication
- Session timeout configuration
- Audit trail for all sensitive operations

### Documentation
- Comprehensive README
- API documentation structure
- Deployment guide
- Security considerations
- Environment variables reference

---

## Upcoming Features (Roadmap)

### [1.1.0] - Planned
- Email notification system integration
- SMS notification via Twilio
- Zoom/Teams OAuth integration
- Custom booking form builder
- Team scheduling
- Analytics dashboard

### [1.2.0] - Planned
- CRM integrations (Salesforce, HubSpot)
- Webhook API
- Public API for developers
- Custom branding
- White-label support

### [2.0.0] - Future
- Mobile application
- AI-powered scheduling suggestions
- Advanced reporting
- Multi-language support
- Custom themes

---

## Version History

| Version | Release Date | Major Changes |
|---------|--------------|---------------|
| 1.0.0 | 2025-03-17 | Initial release with core scheduling features |

---

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
