-- MEDROUTE Supabase Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS hospitals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  phone VARCHAR(50),
  emergency_status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, LIMITED, CRITICAL, OFFLINE
  emergency_load INTEGER DEFAULT 42,
  reliability_score DOUBLE PRECISION DEFAULT 98.5,
  last_verified_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. BEDS TABLE
CREATE TABLE IF NOT EXISTS beds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  bed_number VARCHAR(50) NOT NULL,
  bed_type VARCHAR(50) NOT NULL, -- ICU, GENERAL, EMERGENCY, PEDIATRIC
  department VARCHAR(100),
  status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, RESERVED, OCCUPIED, PREPARING, OUT_OF_SERVICE
  reserved_for VARCHAR(255),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RESOURCES TABLE
CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL, -- VENTILATOR, CT, MRI, BLOOD_BANK, OPERATING_THEATRE, ECG, DEFIBRILLATOR
  total_count INTEGER DEFAULT 5,
  available_count INTEGER DEFAULT 3,
  status VARCHAR(50) DEFAULT 'AVAILABLE',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SPECIALISTS TABLE
CREATE TABLE IF NOT EXISTS specialists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  specialization VARCHAR(100) NOT NULL, -- CARDIOLOGIST, TRAUMA_SURGEON, NEUROLOGIST, ANESTHESIOLOGIST, CRITICAL_CARE, GENERAL_SURGEON, PEDIATRICIAN
  status VARCHAR(50) DEFAULT 'AVAILABLE', -- AVAILABLE, ON_CALL, UNAVAILABLE
  shift VARCHAR(50) DEFAULT 'DAY',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EMERGENCY REQUESTS TABLE
CREATE TABLE IF NOT EXISTS emergency_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_latitude DOUBLE PRECISION,
  patient_longitude DOUBLE PRECISION,
  emergency_type VARCHAR(100) NOT NULL,
  urgency VARCHAR(50) DEFAULT 'HIGH',
  requirements JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RESERVATIONS TABLE
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emergency_request_id UUID REFERENCES emergency_requests(id) ON DELETE SET NULL,
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  bed_id UUID REFERENCES beds(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, CONFIRMED, DECLINED, EXPIRED, CANCELLED
  expires_at TIMESTAMPTZ,
  confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HOSPITAL UPDATES TABLE (Audit/Activity log)
CREATE TABLE IF NOT EXISTS hospital_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  hospital_id UUID REFERENCES hospitals(id) ON DELETE CASCADE,
  update_type VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- INDEXES FOR FAST QUERYING & REALTIME
CREATE INDEX IF NOT EXISTS idx_beds_hospital ON beds(hospital_id);
CREATE INDEX IF NOT EXISTS idx_beds_status ON beds(status);
CREATE INDEX IF NOT EXISTS idx_resources_hospital ON resources(hospital_id);
CREATE INDEX IF NOT EXISTS idx_specialists_hospital ON specialists(hospital_id);
CREATE INDEX IF NOT EXISTS idx_reservations_hospital ON reservations(hospital_id);

-- ENABLE PUBLICATION FOR REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE beds, resources, reservations, hospital_updates;
