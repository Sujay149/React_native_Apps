-- Create assignment table for managing user assignments within hierarchy
CREATE TABLE assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assigned_by_id BIGINT NOT NULL,
    assigned_to_id BIGINT NOT NULL,
    resource_type VARCHAR(50) NOT NULL, -- VILLAGE, MANDAL, CLUSTER, etc
    resource_id BIGINT,
    resource_name VARCHAR(100),
    status ENUM('ACTIVE', 'INACTIVE', 'PENDING') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assigned_by_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to_id) REFERENCES users(id) ON DELETE CASCADE,
    
    INDEX idx_assigned_to (assigned_to_id),
    INDEX idx_assigned_by (assigned_by_id),
    INDEX idx_status (status),
    INDEX idx_resource (resource_type, resource_id)
);

-- Create task assignments table
CREATE TABLE task_assignments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    assignment_id BIGINT NOT NULL,
    task_type VARCHAR(50), -- ATTENDANCE, LEAD, COMPLAINT, etc
    status ENUM('PENDING', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
    
    INDEX idx_status (status),
    INDEX idx_task_type (task_type)
);
