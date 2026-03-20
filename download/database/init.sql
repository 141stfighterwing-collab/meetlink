-- MeetLink Database Initialization Script
-- Version: 1.0.0
-- Compatible with PostgreSQL 12+

-- ============================================
-- EXTENSIONS
-- ============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search optimization

-- ============================================
-- SCHEMAS
-- ============================================

-- Create audit schema for security logging
CREATE SCHEMA IF NOT EXISTS audit;

-- ============================================
-- AUDIT LOGGING
-- ============================================

-- Audit log table (Splunk-compatible format)
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
    severity VARCHAR(20) DEFAULT 'INFO' CHECK (severity IN ('INFO', 'WARNING', 'ERROR', 'CRITICAL')),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Audit log indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit.logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit.logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit.logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit.logs(entity_type, entity_id);

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit.trigger_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    old_data JSONB;
    new_data JSONB;
BEGIN
    IF TG_OP = 'DELETE' THEN
        old_data := to_jsonb(OLD);
        new_data := NULL;
    ELSIF TG_OP = 'UPDATE' THEN
        old_data := to_jsonb(OLD);
        new_data := to_jsonb(NEW);
    ELSIF TG_OP = 'INSERT' THEN
        old_data := NULL;
        new_data := to_jsonb(NEW);
    END IF;

    INSERT INTO audit.logs (
        action,
        entity_type,
        entity_id,
        old_value,
        new_value
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_data,
        new_data
    );

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ROW-LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on core tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "EventType" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Booking" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Calendar" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Workflow" ENABLE ROW LEVEL SECURITY;

-- Create policies for User table
CREATE POLICY "Users can view own data" ON "User"
    FOR SELECT USING (id = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY "Users can update own data" ON "User"
    FOR UPDATE USING (id = current_setting('app.current_user_id', TRUE)::UUID);

-- Create policies for EventType table
CREATE POLICY "Users can view own events" ON "EventType"
    FOR SELECT USING (
        userId = current_setting('app.current_user_id', TRUE)::UUID 
        OR isPublic = TRUE
    );

CREATE POLICY "Users can manage own events" ON "EventType"
    FOR ALL USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

-- Create policies for Booking table
CREATE POLICY "Users can view own bookings" ON "Booking"
    FOR SELECT USING (
        hostId = current_setting('app.current_user_id', TRUE)::UUID
        OR guestId = current_setting('app.current_user_id', TRUE)::UUID
    );

CREATE POLICY "Users can manage own bookings" ON "Booking"
    FOR ALL USING (hostId = current_setting('app.current_user_id', TRUE)::UUID);

-- Create policies for Contact table
CREATE POLICY "Users can view own contacts" ON "Contact"
    FOR SELECT USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY "Users can manage own contacts" ON "Contact"
    FOR ALL USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

-- Create policies for Availability table
CREATE POLICY "Users can view own availability" ON "Availability"
    FOR SELECT USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY "Users can manage own availability" ON "Availability"
    FOR ALL USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

-- Create policies for Calendar table
CREATE POLICY "Users can view own calendars" ON "Calendar"
    FOR SELECT USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY "Users can manage own calendars" ON "Calendar"
    FOR ALL USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

-- Create policies for Workflow table
CREATE POLICY "Users can view own workflows" ON "Workflow"
    FOR SELECT USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

CREATE POLICY "Users can manage own workflows" ON "Workflow"
    FOR ALL USING (userId = current_setting('app.current_user_id', TRUE)::UUID);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_username ON "User"(username);

-- EventType indexes
CREATE INDEX IF NOT EXISTS idx_event_type_user ON "EventType"(userId);
CREATE INDEX IF NOT EXISTS idx_event_type_slug ON "EventType"(slug);

-- Booking indexes
CREATE INDEX IF NOT EXISTS idx_booking_event_type ON "Booking"(eventTypeId);
CREATE INDEX IF NOT EXISTS idx_booking_host ON "Booking"(hostId);
CREATE INDEX IF NOT EXISTS idx_booking_guest ON "Booking"(guestId);
CREATE INDEX IF NOT EXISTS idx_booking_guest_email ON "Booking"(guestEmail);
CREATE INDEX IF NOT EXISTS idx_booking_start_time ON "Booking"(startTime);
CREATE INDEX IF NOT EXISTS idx_booking_status ON "Booking"(status);

-- Contact indexes
CREATE INDEX IF NOT EXISTS idx_contact_user ON "Contact"(userId);
CREATE INDEX IF NOT EXISTS idx_contact_email ON "Contact"(email);
CREATE INDEX IF NOT EXISTS idx_contact_carddav ON "Contact"(carddavUid);

-- Full-text search index for contacts
CREATE INDEX IF NOT EXISTS idx_contact_search ON "Contact" 
    USING gin (
        to_tsvector('english', 
            COALESCE(firstName, '') || ' ' || 
            COALESCE(lastName, '') || ' ' || 
            COALESCE(email, '') || ' ' || 
            COALESCE(company, '')
        )
    );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to validate professional email
CREATE OR REPLACE FUNCTION validate_professional_email(email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    blocked_domains TEXT[] := ARRAY[
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
        'aol.com', 'icloud.com', 'mail.com', 'protonmail.com'
    ];
    domain TEXT;
BEGIN
    -- Extract domain from email
    domain := LOWER(SPLIT_PART(email, '@', 2));
    
    -- Check if domain is in blocked list
    IF domain = ANY(blocked_domains) THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to generate booking statistics
CREATE OR REPLACE FUNCTION get_booking_stats(
    p_user_id UUID,
    p_start_date TIMESTAMPTZ DEFAULT NULL,
    p_end_date TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
    total_bookings BIGINT,
    confirmed_bookings BIGINT,
    cancelled_bookings BIGINT,
    no_show_bookings BIGINT,
    completion_rate NUMERIC,
    no_show_rate NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) AS total_bookings,
        COUNT(*) FILTER (WHERE status = 'CONFIRMED') AS confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'CANCELLED') AS cancelled_bookings,
        COUNT(*) FILTER (WHERE status = 'NO_SHOW') AS no_show_bookings,
        ROUND(
            COUNT(*) FILTER (WHERE status = 'CONFIRMED')::NUMERIC / 
            NULLIF(COUNT(*), 0) * 100, 
            2
        ) AS completion_rate,
        ROUND(
            COUNT(*) FILTER (WHERE status = 'NO_SHOW')::NUMERIC / 
            NULLIF(COUNT(*), 0) * 100, 
            2
        ) AS no_show_rate
    FROM "Booking"
    WHERE hostId = p_user_id
    AND (p_start_date IS NULL OR startTime >= p_start_date)
    AND (p_end_date IS NULL OR startTime <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- INITIAL DATA
-- ============================================

-- Log database initialization
INSERT INTO audit.logs (action, entity_type, severity, is_sensitive) 
VALUES ('SYSTEM_INIT', 'Database', 'INFO', FALSE);

-- Create default system configuration
INSERT INTO "SystemConfig" (key, value, description)
VALUES 
    ('app.version', '1.0.0', 'Application version'),
    ('app.installed_at', NOW()::TEXT, 'Installation timestamp'),
    ('security.password_min_length', '8', 'Minimum password length'),
    ('security.require_uppercase', 'true', 'Require uppercase in passwords'),
    ('security.require_numbers', 'true', 'Require numbers in passwords'),
    ('security.require_special', 'true', 'Require special characters in passwords'),
    ('booking.default_buffer_before', '5', 'Default buffer before meetings (minutes)'),
    ('booking.default_buffer_after', '5', 'Default buffer after meetings (minutes)'),
    ('booking.default_duration', '30', 'Default meeting duration (minutes)')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- PERMISSIONS
-- ============================================

-- Grant permissions to application user
GRANT USAGE ON SCHEMA audit TO meetlink;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA audit TO meetlink;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA audit TO meetlink;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO meetlink;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'MeetLink Database Initialization Complete';
    RAISE NOTICE 'Version: 1.0.0';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Security features enabled:';
    RAISE NOTICE '  - Row-Level Security (RLS)';
    RAISE NOTICE '  - Audit logging';
    RAISE NOTICE '  - Professional email validation';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '  1. Run Prisma migrations';
    RAISE NOTICE '  2. Configure environment variables';
    RAISE NOTICE '  3. Start the application';
END $$;
