-- Daily Analytics Snapshot
CREATE TABLE daily_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    analytics_date DATE NOT NULL,
    role VARCHAR(50),
    total_attendance INT DEFAULT 0,
    total_leads INT DEFAULT 0,
    approved_leads INT DEFAULT 0,
    total_complaints INT DEFAULT 0,
    resolved_complaints INT DEFAULT 0,
    lead_conversion_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_date_role (analytics_date, role),
    INDEX idx_date (analytics_date)
);

-- Weekly Analytics Summary
CREATE TABLE weekly_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    week_start_date DATE NOT NULL,
    week_end_date DATE NOT NULL,
    role VARCHAR(50),
    total_attendance INT DEFAULT 0,
    total_leads INT DEFAULT 0,
    approved_leads INT DEFAULT 0,
    total_complaints INT DEFAULT 0,
    resolved_complaints INT DEFAULT 0,
    lead_conversion_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_week (week_start_date)
);

-- Monthly Analytics Summary
CREATE TABLE monthly_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    month_year VARCHAR(7), -- YYYY-MM
    role VARCHAR(50),
    total_attendance INT DEFAULT 0,
    total_leads INT DEFAULT 0,
    approved_leads INT DEFAULT 0,
    total_complaints INT DEFAULT 0,
    resolved_complaints INT DEFAULT 0,
    lead_conversion_rate DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE KEY unique_month_role (month_year, role),
    INDEX idx_month (month_year)
);

-- Product/Service Performance Analytics
CREATE TABLE service_analytics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_type VARCHAR(100), -- Home Care, Marketing, Health, Security, Education
    analytics_date DATE,
    total_entries INT DEFAULT 0,
    active_entries INT DEFAULT 0,
    completed_entries INT DEFAULT 0,
    performance_score DECIMAL(5, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_service_date (service_type, analytics_date)
);

-- Dashboard Cache (for quick rendering)
CREATE TABLE dashboard_cache (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    role VARCHAR(50),
    cache_data JSON,
    cache_key VARCHAR(255) UNIQUE,
    last_updated TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_role (user_id, role)
);
