-- ==============================================================================
-- TBF INDUSTRIAL SCADA & PREDICTIVE MAINTENANCE
-- Supabase PostgreSQL Production Schema & Row-Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Enums
DO $$ BEGIN
    CREATE TYPE fan_status_enum AS ENUM ('Normal', 'Warning', 'Critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE fan_mode_enum AS ENUM ('Random', 'Good', 'Worst');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE alert_severity_enum AS ENUM ('INFO', 'WARNING', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. FANS TABLE (Primary Asset Registry)
CREATE TABLE IF NOT EXISTS public.fans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fan_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150) NOT NULL,
    status fan_status_enum DEFAULT 'Normal' NOT NULL,
    current_rul DOUBLE PRECISION DEFAULT 100.0 NOT NULL,
    current_fault VARCHAR(100) DEFAULT 'Normal' NOT NULL,
    is_anomaly BOOLEAN DEFAULT FALSE NOT NULL,
    simulation_mode fan_mode_enum DEFAULT 'Random' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. TELEMETRY READINGS TABLE (High-Frequency Time-Series)
CREATE TABLE IF NOT EXISTS public.telemetry_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fan_id INTEGER NOT NULL REFERENCES public.fans(fan_id) ON DELETE CASCADE,
    speed DOUBLE PRECISION NOT NULL,
    vibration DOUBLE PRECISION NOT NULL,
    temperature DOUBLE PRECISION NOT NULL,
    power DOUBLE PRECISION NOT NULL,
    gas DOUBLE PRECISION DEFAULT 0.01 NOT NULL,
    pressure DOUBLE PRECISION DEFAULT 101300.0 NOT NULL,
    predicted_rul DOUBLE PRECISION NOT NULL,
    predicted_fault VARCHAR(100) DEFAULT 'Normal' NOT NULL,
    is_anomaly BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. FAULT ALERTS TABLE (System Alarm & Event Log)
CREATE TABLE IF NOT EXISTS public.fault_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fan_id INTEGER NOT NULL REFERENCES public.fans(fan_id) ON DELETE CASCADE,
    alert_type VARCHAR(50) NOT NULL,
    severity alert_severity_enum DEFAULT 'WARNING' NOT NULL,
    message TEXT NOT NULL,
    is_acknowledged BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Indexes for High-Speed Queries
CREATE INDEX IF NOT EXISTS idx_telemetry_fan_created ON public.telemetry_readings(fan_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_unack ON public.fault_alerts(is_acknowledged, created_at DESC);

-- 7. Seed Initial 4 Tunnel Booster Fans
INSERT INTO public.fans (fan_id, name, location, status, current_rul, current_fault, simulation_mode)
VALUES 
    (1, 'Tunnel Booster Fan #1', 'Zone A • Portal Ch. 1000', 'Normal', 191.0, 'Normal', 'Random'),
    (2, 'Tunnel Booster Fan #2', 'Zone B • Portal Ch. 2000', 'Normal', 92.1, 'Normal', 'Random'),
    (3, 'Tunnel Booster Fan #3', 'Zone C • Portal Ch. 3000', 'Normal', 88.5, 'Normal', 'Random'),
    (4, 'Tunnel Booster Fan #4', 'Zone D • Portal Ch. 4000', 'Normal', 85.0, 'Normal', 'Random')
ON CONFLICT (fan_id) DO UPDATE SET
    name = EXCLUDED.name,
    location = EXCLUDED.location;

-- 8. Enable Realtime Broadcasting
ALTER PUBLICATION supabase_realtime ADD TABLE public.fans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.fault_alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.telemetry_readings;

-- 9. Enable Row-Level Security (RLS)
ALTER TABLE public.fans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fault_alerts ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies
-- Allow anyone (public/anon + authenticated) to view SCADA monitoring data
DROP POLICY IF EXISTS "Public and authenticated can read fans" ON public.fans;
CREATE POLICY "Public and authenticated can read fans"
ON public.fans FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public and authenticated can update fans" ON public.fans;
CREATE POLICY "Public and authenticated can update fans"
ON public.fans FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public and authenticated can read telemetry" ON public.telemetry_readings;
CREATE POLICY "Public and authenticated can read telemetry"
ON public.telemetry_readings FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public and authenticated can insert telemetry" ON public.telemetry_readings;
CREATE POLICY "Public and authenticated can insert telemetry"
ON public.telemetry_readings FOR INSERT TO public WITH CHECK (true);

DROP POLICY IF EXISTS "Public and authenticated can read alerts" ON public.fault_alerts;
CREATE POLICY "Public and authenticated can read alerts"
ON public.fault_alerts FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "Public and authenticated can update alerts" ON public.fault_alerts;
CREATE POLICY "Public and authenticated can update alerts"
ON public.fault_alerts FOR UPDATE TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public and authenticated can insert alerts" ON public.fault_alerts;
CREATE POLICY "Public and authenticated can insert alerts"
ON public.fault_alerts FOR INSERT TO public WITH CHECK (true);
