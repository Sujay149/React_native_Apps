-- Create leads table
CREATE TABLE leads (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_by BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    email VARCHAR(100),
    category VARCHAR(100), -- Home Care, Marketing, etc
    lead_status ENUM('WEAK', 'MEDIUM', 'STRONG') DEFAULT 'MEDIUM',
    location VARCHAR(255),
    village VARCHAR(100),
    mandal VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    notes VARCHAR(1000),
    approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    approved_by BIGINT,
    approval_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_created_by (created_by),
    INDEX idx_lead_status (lead_status),
    INDEX idx_approval_status (approval_status),
    INDEX idx_category (category),
    INDEX idx_location (district, mandal, village)
);

-- Create index on dates for reporting
CREATE INDEX idx_leads_dates ON leads(created_at);
