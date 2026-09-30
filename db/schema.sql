-- ==============================================================================
-- JAY REAL ESTATE - NEON POSTGRESQL SCHEMA
-- ==============================================================================

-- 1. Developers Table (5 Fictional Luxury Developers)
CREATE TABLE IF NOT EXISTS developers (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tagline VARCHAR(255),
  description TEXT,
  headquarters VARCHAR(255) DEFAULT 'Dubai, UAE',
  founded_year INT,
  completed_projects INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Staff Logins & Luxury Property Agents (Admin + 3 Agents)
CREATE TABLE IF NOT EXISTS staff_logins (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'agent', -- 'admin' or 'agent'
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  rera_number VARCHAR(100),
  specialization VARCHAR(255),
  languages VARCHAR(255),
  photo_url TEXT,
  bio TEXT,
  target_sales_aed NUMERIC(14, 2) DEFAULT 25000000,
  target_commission_aed NUMERIC(14, 2) DEFAULT 500000,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Off-Plan Projects Table (6 Projects)
CREATE TABLE IF NOT EXISTS off_plan_projects (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  developer_id INT REFERENCES developers(id) ON DELETE SET NULL,
  developer_name VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  sub_location VARCHAR(255),
  starting_price_aed NUMERIC(14, 2) NOT NULL,
  handover_date VARCHAR(100) NOT NULL,
  payment_plan VARCHAR(255) NOT NULL,
  units_type VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  payment_milestones JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Properties Table (15 Ready Properties across Marina, Downtown, Palm, Business Bay, Dubai Hills, JVC)
CREATE TABLE IF NOT EXISTS properties (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  developer_id INT REFERENCES developers(id) ON DELETE SET NULL,
  developer_name VARCHAR(255),
  property_type VARCHAR(100) NOT NULL, -- Villa, Penthouse, Apartment, Duplex, Mansion
  location VARCHAR(100) NOT NULL, -- Dubai Marina, Downtown Dubai, Palm Jumeirah, Business Bay, Dubai Hills, JVC
  sub_location VARCHAR(255),
  price_aed NUMERIC(14, 2) NOT NULL,
  bedrooms INT NOT NULL,
  bathrooms INT NOT NULL,
  area_sqft NUMERIC(10, 2) NOT NULL,
  plot_sqft NUMERIC(10, 2),
  status VARCHAR(50) DEFAULT 'Ready', -- 'Ready', 'Under Offer', 'Sold'
  tag VARCHAR(100),
  image_url TEXT NOT NULL,
  gallery_urls JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  amenities JSONB DEFAULT '[]'::jsonb,
  assigned_agent_id INT REFERENCES staff_logins(id) ON DELETE SET NULL,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Buyer Leads (40 Sample Leads with Scoring 0-100 & Temperature)
CREATE TABLE IF NOT EXISTS buyer_leads (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  interested_in VARCHAR(255),
  property_id INT REFERENCES properties(id) ON DELETE SET NULL,
  off_plan_id INT REFERENCES off_plan_projects(id) ON DELETE SET NULL,
  budget_aed NUMERIC(14, 2),
  preferred_community VARCHAR(100),
  source_form VARCHAR(100) DEFAULT 'Website Form',
  lead_source VARCHAR(100) DEFAULT 'Website Form',
  is_cash_buyer BOOLEAN DEFAULT false,
  timeframe VARCHAR(100) DEFAULT '1-3 months',
  score INT DEFAULT 50, -- 0 to 100
  temperature VARCHAR(20) DEFAULT 'WARM', -- 'HOT', 'WARM', 'COLD'
  status VARCHAR(50) DEFAULT 'New', -- 'New', 'Contacted', 'Viewing Scheduled', 'Offer Made', 'Negotiating', 'Won', 'Lost'
  assigned_agent_id INT REFERENCES staff_logins(id) ON DELETE SET NULL,
  last_activity_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Lead & Property Notes
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  lead_id INT REFERENCES buyer_leads(id) ON DELETE CASCADE,
  agent_id INT REFERENCES staff_logins(id) ON DELETE SET NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Viewings Table (10 Viewings)
CREATE TABLE IF NOT EXISTS viewings (
  id SERIAL PRIMARY KEY,
  property_id INT REFERENCES properties(id) ON DELETE CASCADE,
  lead_id INT REFERENCES buyer_leads(id) ON DELETE CASCADE,
  agent_id INT REFERENCES staff_logins(id) ON DELETE SET NULL,
  viewing_date DATE NOT NULL,
  viewing_time VARCHAR(50) NOT NULL,
  viewing_type VARCHAR(50) DEFAULT 'In-Person', -- In-Person, Virtual VIP Walkthrough
  status VARCHAR(50) DEFAULT 'Scheduled', -- Scheduled, Completed, Cancelled
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Completed Sales Table (5 Sales with 2% Commission Calculation)
CREATE TABLE IF NOT EXISTS completed_sales (
  id SERIAL PRIMARY KEY,
  property_id INT REFERENCES properties(id) ON DELETE SET NULL,
  off_plan_id INT REFERENCES off_plan_projects(id) ON DELETE SET NULL,
  lead_id INT REFERENCES buyer_leads(id) ON DELETE SET NULL,
  property_title VARCHAR(255) NOT NULL,
  buyer_name VARCHAR(255) NOT NULL,
  buyer_contact VARCHAR(100),
  agent_id INT REFERENCES staff_logins(id) ON DELETE SET NULL,
  sale_price_aed NUMERIC(14, 2) NOT NULL,
  commission_aed NUMERIC(14, 2) NOT NULL, -- 2% of sale price
  sale_date DATE NOT NULL,
  transaction_id VARCHAR(100) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes for Fast Queries
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(location);
CREATE INDEX IF NOT EXISTS idx_properties_price ON properties(price_aed);
CREATE INDEX IF NOT EXISTS idx_offplan_location ON off_plan_projects(location);
CREATE INDEX IF NOT EXISTS idx_leads_status ON buyer_leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_agent ON buyer_leads(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_score ON buyer_leads(score);
