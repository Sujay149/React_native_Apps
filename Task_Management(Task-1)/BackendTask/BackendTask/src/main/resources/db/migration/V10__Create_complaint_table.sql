-- Create complaints table
CREATE TABLE complaints (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    complaint_type VARCHAR(100),
    complaint_description VARCHAR(1000) NOT NULL,
    complaint_status ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') DEFAULT 'OPEN',
    priority ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') DEFAULT 'MEDIUM',
    reviewed_by BIGINT,
    review_notes VARCHAR(500),
    resolution_notes VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    
    INDEX idx_user_status (user_id, complaint_status),
    INDEX idx_complaint_status (complaint_status),
    INDEX idx_priority (priority),
    INDEX idx_dates (created_at)
);
