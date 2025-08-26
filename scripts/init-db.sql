-- Database initialization script for Visiobook Core Database Service
-- This script sets up the required PostgreSQL extensions and initial configuration

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create a schema for the database service if it doesn't exist
CREATE SCHEMA IF NOT EXISTS visiobook_core;

-- Set default search path
ALTER DATABASE visiobook_core_db SET search_path TO visiobook_core, public;

-- Create a user for the application (optional, for production use)
-- DO $$
-- BEGIN
--     IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'visiobook_app') THEN
--         CREATE ROLE visiobook_app WITH LOGIN PASSWORD 'app_password';
--         GRANT CONNECT ON DATABASE visiobook_core_db TO visiobook_app;
--         GRANT USAGE ON SCHEMA visiobook_core TO visiobook_app;
--         GRANT CREATE ON SCHEMA visiobook_core TO visiobook_app;
--     END IF;
-- END
-- $$;

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'Visiobook Core Database initialized successfully';
    RAISE NOTICE 'Extensions enabled: uuid-ossp, pgcrypto';
    RAISE NOTICE 'Schema created: visiobook_core';
END
$$;
