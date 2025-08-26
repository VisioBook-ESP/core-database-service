-- Development seed data for Visiobook Core Database Service
-- This script is only loaded in development environment

-- Insert sample registered databases for testing
DO $$
BEGIN
    -- Only insert if tables exist (after Prisma migrations)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'registered_databases') THEN

        -- Sample microservice database registrations
        INSERT INTO registered_databases (
            id, service_name, database_type, orm_type, connection_string,
            schema_version, status, metadata, created_at, updated_at
        ) VALUES
        (
            'dev-user-service-001',
            'user-service',
            'postgresql',
            'prisma',
            'postgresql://user:pass@user-db:5432/users',
            '1.0.0',
            'registered',
            '{"description": "User management service", "team": "backend", "priority": "high"}',
            NOW(),
            NOW()
        ),
        (
            'dev-project-service-001',
            'project-service',
            'postgresql',
            'sqlalchemy',
            'postgresql://user:pass@project-db:5432/projects',
            '1.2.1',
            'registered',
            '{"description": "Project management service", "team": "backend", "priority": "medium"}',
            NOW(),
            NOW()
        ),
        (
            'dev-ai-service-001',
            'ai-analysis-service',
            'postgresql',
            'gorm',
            'postgresql://user:pass@ai-db:5432/ai_analysis',
            '2.0.0',
            'extracting',
            '{"description": "AI analysis and processing", "team": "ai", "priority": "high"}',
            NOW(),
            NOW()
        )
        ON CONFLICT (service_name) DO NOTHING;

        RAISE NOTICE 'Development seed data inserted successfully';
    ELSE
        RAISE NOTICE 'Tables not yet created - seed data will be available after Prisma migrations';
    END IF;
END
$$;
