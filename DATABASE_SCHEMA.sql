-- ========================================
-- CHARGEPE EV CHARGING STATION DATABASE
-- Complete Schema for Real-time Features
-- ========================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ========================================
-- CORE TABLES (Enhanced)
-- ========================================

-- Enhanced charging stations table
ALTER TABLE charging_stations 
ADD COLUMN IF NOT EXISTS live_available_slots INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS queue_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS charging_speeds JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS utilization_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS estimated_wait_time INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS maintenance_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS peak_hours JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS amenities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS weather_impact_score DECIMAL(3,2) DEFAULT 1.0;

-- Enhanced bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER,
ADD COLUMN IF NOT EXISTS actual_duration INTEGER,
ADD COLUMN IF NOT EXISTS cost DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS booking_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS qr_code TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS energy_delivered DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS charging_progress DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_power DECIMAL(8,2) DEFAULT 0;

-- ========================================
-- FEATURE 1: REAL-TIME STATION STATUS
-- ========================================

-- Station status history for analytics
CREATE TABLE IF NOT EXISTS station_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    available_slots INTEGER NOT NULL,
    queue_time INTEGER DEFAULT 0,
    utilization_rate DECIMAL(5,2) DEFAULT 0,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Real-time station metrics
CREATE TABLE IF NOT EXISTS station_realtime_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    current_sessions INTEGER DEFAULT 0,
    average_session_duration INTEGER DEFAULT 0,
    peak_demand INTEGER DEFAULT 0,
    demand_score DECIMAL(5,2) DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FEATURE 2: ADVANCED SEARCH & FILTERING
-- ========================================

-- Station amenities for filtering
CREATE TABLE IF NOT EXISTS station_amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    amenity_type VARCHAR(50) NOT NULL, -- wifi, restroom, food, parking, shelter, security, etc.
    is_available BOOLEAN DEFAULT true,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, amenity_type)
);

-- Station connector details
CREATE TABLE IF NOT EXISTS station_connectors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    connector_type VARCHAR(50) NOT NULL,
    power_output_kw DECIMAL(8,2) NOT NULL,
    count INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FEATURE 3: SMART ROUTE PLANNING
-- ========================================

-- Route plans
CREATE TABLE IF NOT EXISTS route_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_lat DECIMAL(10,8) NOT NULL,
    start_lng DECIMAL(11,8) NOT NULL,
    end_lat DECIMAL(10,8) NOT NULL,
    end_lng DECIMAL(11,8) NOT NULL,
    waypoints JSONB DEFAULT '[]',
    total_distance DECIMAL(8,2) NOT NULL,
    total_time INTEGER NOT NULL,
    total_cost DECIMAL(10,2) NOT NULL,
    charging_stops JSONB DEFAULT '[]',
    vehicle_profile JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Route optimization cache
CREATE TABLE IF NOT EXISTS route_optimization_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    start_lat DECIMAL(10,8) NOT NULL,
    start_lng DECIMAL(11,8) NOT NULL,
    end_lat DECIMAL(10,8) NOT NULL,
    end_lng DECIMAL(11,8) NOT NULL,
    vehicle_profile JSONB NOT NULL,
    optimized_route JSONB NOT NULL,
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '1 hour'),
    UNIQUE(start_lat, start_lng, end_lat, end_lng, md5(vehicle_profile::text))
);

-- ========================================
-- FEATURE 4: REAL-TIME BOOKING SYSTEM
-- ========================================

-- Booking sessions (enhanced)
CREATE TABLE IF NOT EXISTS booking_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending',
    energy_delivered DECIMAL(8,2) DEFAULT 0,
    current_power DECIMAL(8,2) DEFAULT 0,
    charging_progress DECIMAL(5,2) DEFAULT 0,
    time_remaining INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active charging sessions
CREATE TABLE IF NOT EXISTS active_charging_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES booking_sessions(id) ON DELETE CASCADE,
    connector_id UUID REFERENCES station_connectors(id),
    current_power DECIMAL(8,2) DEFAULT 0,
    voltage DECIMAL(8,2) DEFAULT 0,
    current DECIMAL(8,2) DEFAULT 0,
    temperature DECIMAL(5,2) DEFAULT 0,
    session_progress DECIMAL(5,2) DEFAULT 0,
    estimated_completion TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FEATURE 5: USER DASHBOARD & ANALYTICS
-- ========================================

-- User analytics
CREATE TABLE IF NOT EXISTS user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_sessions INTEGER DEFAULT 0,
    total_energy_consumed DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    average_session_duration DECIMAL(8,2) DEFAULT 0,
    co2_saved DECIMAL(10,2) DEFAULT 0,
    total_distance DECIMAL(8,2) DEFAULT 0,
    money_saved_vs_gas DECIMAL(10,2) DEFAULT 0,
    favorite_station UUID REFERENCES charging_stations(id),
    preferred_connector_type VARCHAR(50),
    peak_charging_time VARCHAR(10),
    last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly user statistics
CREATE TABLE IF NOT EXISTS monthly_user_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    sessions INTEGER DEFAULT 0,
    energy DECIMAL(10,2) DEFAULT 0,
    cost DECIMAL(10,2) DEFAULT 0,
    co2_saved DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month)
);

-- Favorite stations
CREATE TABLE IF NOT EXISTS favorite_stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    visits INTEGER DEFAULT 0,
    total_energy DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, station_id)
);

-- ========================================
-- FEATURE 6: SMART NOTIFICATIONS
-- ========================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'medium',
    action_url TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notification preferences
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    station_available BOOLEAN DEFAULT true,
    booking_reminders BOOLEAN DEFAULT true,
    price_drops BOOLEAN DEFAULT true,
    queue_updates BOOLEAN DEFAULT true,
    session_complete BOOLEAN DEFAULT true,
    stations_nearby BOOLEAN DEFAULT true,
    favorite_station_updates BOOLEAN DEFAULT true,
    quiet_hours_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00:00',
    quiet_hours_end TIME DEFAULT '08:00:00',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ========================================
-- FEATURE 7: PAYMENT INTEGRATION
-- ========================================

-- Payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    last4 VARCHAR(4),
    brand VARCHAR(50),
    expiry_month INTEGER,
    expiry_year INTEGER,
    is_default BOOLEAN DEFAULT false,
    nickname VARCHAR(100),
    billing_address JSONB,
    is_verified BOOLEAN DEFAULT false,
    gateway_customer_id VARCHAR(255),
    gateway_payment_method_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment transactions
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(20) DEFAULT 'pending',
    payment_method_id UUID REFERENCES payment_methods(id),
    payment_method_type VARCHAR(50),
    gateway_transaction_id VARCHAR(255),
    gateway_response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10,2),
    refund_reason TEXT
);

-- Subscription plans
CREATE TABLE IF NOT EXISTS subscription_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL,
    features JSONB NOT NULL,
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    max_monthly_kwh DECIMAL(10,2),
    is_popular BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User subscriptions
CREATE TABLE IF NOT EXISTS user_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES subscription_plans(id),
    status VARCHAR(20) DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    gateway_subscription_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- FEATURE 8: COMMUNITY FEATURES
-- ========================================

-- Station reviews
CREATE TABLE IF NOT EXISTS station_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    content TEXT,
    photos JSONB DEFAULT '[]',
    tags JSONB DEFAULT '[]',
    helpful_count INTEGER DEFAULT 0,
    response_content TEXT,
    response_created_at TIMESTAMP WITH TIME ZONE,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Station tips
CREATE TABLE IF NOT EXISTS station_tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Q&A system
CREATE TABLE IF NOT EXISTS station_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS question_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES station_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    helpful_count INTEGER DEFAULT 0,
    is_from_station_owner BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community events
CREATE TABLE IF NOT EXISTS community_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    location VARCHAR(255),
    event_date DATE NOT NULL,
    event_time TIME NOT NULL,
    max_attendees INTEGER,
    organizer_id UUID REFERENCES auth.users(id),
    category VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event attendees
CREATE TABLE IF NOT EXISTS event_attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES community_events(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'attending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ========================================
-- FEATURE 9: ADVANCED MAP FEATURES
-- ========================================

-- Map layers and preferences
CREATE TABLE IF NOT EXISTS user_map_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    default_lat DECIMAL(10,8),
    default_lng DECIMAL(11,8),
    default_zoom INTEGER DEFAULT 12,
    preferred_layers JSONB DEFAULT '[]',
    traffic_layer_enabled BOOLEAN DEFAULT false,
    weather_layer_enabled BOOLEAN DEFAULT false,
    heatmap_enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Offline map downloads
CREATE TABLE IF NOT EXISTS offline_maps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    radius INTEGER NOT NULL,
    map_data JSONB,
    downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
    file_size BIGINT,
    UNIQUE(user_id, lat, lng, radius)
);

-- Construction alerts
CREATE TABLE IF NOT EXISTS construction_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    affected_stations JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Traffic data cache
CREATE TABLE IF NOT EXISTS traffic_data_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lat DECIMAL(10,8) NOT NULL,
    lng DECIMAL(11,8) NOT NULL,
    traffic_level VARCHAR(20),
    speed DECIMAL(5,2),
    incidents JSONB DEFAULT '[]',
    data_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '15 minutes'),
    UNIQUE(lat, lng)
);

-- ========================================
-- FEATURE 10: BUSINESS DASHBOARD
-- ========================================

-- Station owner profiles
CREATE TABLE IF NOT EXISTS station_owner_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    company_name VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    business_address JSONB,
    tax_id VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    verification_documents JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Station ownership
CREATE TABLE IF NOT EXISTS station_ownership (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    ownership_percentage DECIMAL(5,2) DEFAULT 100,
    is_primary_owner BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, owner_id)
);

-- Station metrics (daily)
CREATE TABLE IF NOT EXISTS station_daily_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    average_session_duration DECIMAL(8,2) DEFAULT 0,
    utilization_rate DECIMAL(5,2) DEFAULT 0,
    peak_hours JSONB DEFAULT '[]',
    energy_consumed DECIMAL(10,2) DEFAULT 0,
    unique_customers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id, date)
);

-- Operational alerts
CREATE TABLE IF NOT EXISTS operational_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    description TEXT,
    action_required BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance schedules
CREATE TABLE IF NOT EXISTS maintenance_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    equipment_type VARCHAR(100) NOT NULL,
    scheduled_date TIMESTAMP WITH TIME ZONE NOT NULL,
    estimated_duration INTEGER NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'scheduled',
    cost DECIMAL(10,2),
    technician VARCHAR(255),
    notes TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pricing strategies
CREATE TABLE IF NOT EXISTS pricing_strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    station_id UUID REFERENCES charging_stations(id) ON DELETE CASCADE,
    base_price DECIMAL(8,2) NOT NULL,
    peak_hour_multiplier DECIMAL(5,2) DEFAULT 1.0,
    off_peak_discount DECIMAL(5,2) DEFAULT 0.0,
    demand_pricing BOOLEAN DEFAULT false,
    competitor_prices JSONB DEFAULT '[]',
    recommended_price DECIMAL(8,2),
    price_elasticity DECIMAL(5,2) DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(station_id)
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Core tables
CREATE INDEX IF NOT EXISTS idx_charging_stations_location ON charging_stations USING GIST (point(longitude, latitude));
CREATE INDEX IF NOT EXISTS idx_charging_stations_status ON charging_stations (status, is_approved);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_station_id ON bookings (station_id, start_time);

-- Real-time features
CREATE INDEX IF NOT EXISTS idx_station_status_history_station_time ON station_status_history (station_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_booking_sessions_active ON booking_sessions (status, start_time);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id, is_read, created_at DESC);

-- Search and filtering
CREATE INDEX IF NOT EXISTS idx_station_amenities_type ON station_amenities (amenity_type);
CREATE INDEX IF NOT EXISTS idx_station_connectors_type ON station_connectors (connector_type, power_output_kw);

-- Analytics
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics (user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_user_stats_user_month ON monthly_user_stats (user_id, month DESC);

-- Community features
CREATE INDEX IF NOT EXISTS idx_station_reviews_station_rating ON station_reviews (station_id, rating DESC);
CREATE INDEX IF NOT EXISTS idx_community_events_date ON community_events (event_date, event_time);

-- Business dashboard
CREATE INDEX IF NOT EXISTS idx_station_daily_metrics_date ON station_daily_metrics (station_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_operational_alerts_station ON operational_alerts (station_id, resolved_at NULL);

-- ========================================
-- TRIGGERS AND FUNCTIONS
-- ========================================

-- Update station last_updated timestamp
CREATE OR REPLACE FUNCTION update_station_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE charging_stations 
    SET last_updated = NOW() 
    WHERE id = NEW.station_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_station_timestamp
    AFTER INSERT OR UPDATE ON station_status_history
    FOR EACH ROW
    EXECUTE FUNCTION update_station_timestamp();

-- Update booking updated_at timestamp
CREATE OR REPLACE FUNCTION update_booking_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_booking_timestamp
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_booking_timestamp();

-- Calculate utilization rate
CREATE OR REPLACE FUNCTION calculate_utilization_rate()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE charging_stations 
    SET utilization_rate = CASE 
        WHEN total_slots > 0 THEN 
            ROUND(((total_slots - live_available_slots)::DECIMAL / total_slots) * 100, 2)
        ELSE 0 
    END
    WHERE id = NEW.station_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_utilization
    AFTER UPDATE OF live_available_slots ON charging_stations
    FOR EACH ROW
    EXECUTE FUNCTION calculate_utilization_rate();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- Station performance view
CREATE OR REPLACE VIEW station_performance_view AS
SELECT 
    cs.id,
    cs.name,
    cs.total_slots,
    cs.live_available_slots,
    cs.utilization_rate,
    cs.price_per_kwh,
    COALESCE(sdm.total_revenue, 0) as daily_revenue,
    COALESCE(sdm.total_sessions, 0) as daily_sessions,
    COALESCE(sdm.unique_customers, 0) as daily_customers,
    AVG(sr.rating) as average_rating,
    COUNT(sr.id) as total_reviews
FROM charging_stations cs
LEFT JOIN station_daily_metrics sdm ON cs.id = sdm.station_id AND sdm.date = CURRENT_DATE
LEFT JOIN station_reviews sr ON cs.id = sr.station_id
WHERE cs.is_approved = true
GROUP BY cs.id, cs.name, cs.total_slots, cs.live_available_slots, cs.utilization_rate, cs.price_per_kwh, sdm.total_revenue, sdm.total_sessions, sdm.unique_customers;

-- User activity view
CREATE OR REPLACE VIEW user_activity_view AS
SELECT 
    u.id,
    u.email,
    COALESCE(ua.total_sessions, 0) as total_sessions,
    COALESCE(ua.total_energy_consumed, 0) as total_energy_consumed,
    COALESCE(ua.total_cost, 0) as total_cost,
    COALESCE(ua.co2_saved, 0) as co2_saved,
    COUNT(b.id) as recent_bookings,
    MAX(b.created_at) as last_booking_date
FROM auth.users u
LEFT JOIN user_analytics ua ON u.id = ua.user_id
LEFT JOIN bookings b ON u.id = b.user_id AND b.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.email, ua.total_sessions, ua.total_energy_consumed, ua.total_cost, ua.co2_saved;

-- ========================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ========================================

-- Enable RLS on all user-specific tables
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE station_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_map_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_maps ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own notifications" ON notifications
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own notification preferences" ON notification_preferences
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own payment methods" ON payment_methods
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payment transactions" ON payment_transactions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own subscriptions" ON user_subscriptions
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- SAMPLE DATA INSERTION
-- ========================================

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features, discount_percentage, is_popular) VALUES
('ChargePe Basic', 'Perfect for occasional EV drivers', 0, 'monthly', 
 '["Basic station access", "Standard charging rates", "Mobile app access"]', 0, false),
('ChargePe Plus', 'Great for daily commuters', 9.99, 'monthly',
 '["10% discount on charging", "Priority booking", "Advanced analytics", "Route planning"]', 10, true),
('ChargePe Premium', 'Ultimate experience for power users', 19.99, 'monthly',
 '["20% discount on charging", "Exclusive station access", "Concierge service", "Free roaming", "Family sharing"]', 20, false)
ON CONFLICT DO NOTHING;

-- Insert sample amenities
INSERT INTO station_amenities (station_id, amenity_type, is_available, description) 
SELECT id, 'wifi', true, 'Free high-speed WiFi available' FROM charging_stations 
ON CONFLICT (station_id, amenity_type) DO NOTHING;

INSERT INTO station_amenities (station_id, amenity_type, is_available, description) 
SELECT id, 'parking', true, 'Dedicated EV parking spots' FROM charging_stations 
ON CONFLICT (station_id, amenity_type) DO NOTHING;

-- Insert sample construction alerts
INSERT INTO construction_alerts (lat, lng, title, description, severity, start_date, end_date) VALUES
(12.9716, 77.5946, 'MG Road Construction', 'Lane reduction due to metro construction. Expect delays.', 'high', 
 CURRENT_DATE, CURRENT_DATE + INTERVAL '3 months'),
(12.9856, 77.6096, 'Parking Lot Renovation', 'Limited parking available at nearby stations.', 'medium',
 CURRENT_DATE + INTERVAL '1 week', CURRENT_DATE + INTERVAL '2 weeks')
ON CONFLICT DO NOTHING;

-- ========================================
-- COMPLETED SCHEMA
-- ========================================

-- This comprehensive schema supports all 10 real-time features:
-- 1. Real-time station status with WebSocket integration
-- 2. Advanced search and filtering system  
-- 3. Smart route planning with multi-stop support
-- 4. Real-time booking system with session management
-- 5. User dashboard with analytics and history
-- 6. Smart notifications and alerts system
-- 7. Payment integration with multiple methods
-- 8. Station reviews and community features
-- 9. Advanced map features with heat maps
-- 10. Business dashboard for station owners

-- The schema is optimized for performance with proper indexes,
-- includes triggers for automated updates, and implements
-- row-level security for data protection.
