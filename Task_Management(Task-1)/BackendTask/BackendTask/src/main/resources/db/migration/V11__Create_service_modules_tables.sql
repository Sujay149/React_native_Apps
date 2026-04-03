-- Home Care Module
CREATE TABLE home_care_patients (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_by BIGINT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    age INT,
    medical_issue VARCHAR(500),
    location VARCHAR(255),
    village VARCHAR(100),
    mandal VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    contact_number VARCHAR(20),
    status ENUM('ACTIVE', 'INACTIVE', 'DISCHARGED') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_location (district, mandal, village)
);

-- Health Services Module
CREATE TABLE health_service_intakes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_by BIGINT NOT NULL,
    patient_name VARCHAR(100) NOT NULL,
    age INT,
    contact_number VARCHAR(20),
    problem_description VARCHAR(1000),
    hospital_name VARCHAR(100),
    doctor_name VARCHAR(100),
    village VARCHAR(100),
    mandal VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    status ENUM('OPEN', 'IN_TREATMENT', 'RESOLVED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- Security Services Module
CREATE TABLE security_complaints (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_by BIGINT NOT NULL,
    complaint_text VARCHAR(1000) NOT NULL,
    location VARCHAR(255),
    severity ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL') DEFAULT 'MEDIUM',
    status ENUM('REPORTED', 'ASSIGNED', 'RESOLVED') DEFAULT 'REPORTED',
    assigned_to BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status)
);

-- Marketing Module
CREATE TABLE marketing_entries (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_by BIGINT NOT NULL,
    prospect_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    product_service VARCHAR(100),
    village VARCHAR(100),
    mandal VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100),
    lead_status ENUM('WEAK', 'MEDIUM', 'STRONG') DEFAULT 'MEDIUM',
    approval_status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
    approved_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_approval_status (approval_status)
);

-- Education Module
CREATE TABLE education_guidance_requests (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    created_by BIGINT NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20),
    guidance_type VARCHAR(100), -- COLLEGE, JOB, APPLICATION
    current_status VARCHAR(100),
    requirements VARCHAR(1000),
    status ENUM('OPEN', 'IN_PROGRESS', 'COMPLETED') DEFAULT 'OPEN',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_status (status)
);

-- Activity Gallery for Home Care Module
CREATE TABLE activity_gallery (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    home_care_patient_id BIGINT NOT NULL,
    media_type VARCHAR(50), -- IMAGE, VIDEO, DOCUMENT
    media_url VARCHAR(500),
    file_name VARCHAR(255),
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (home_care_patient_id) REFERENCES home_care_patients(id) ON DELETE CASCADE,
    INDEX idx_patient (home_care_patient_id)
);

-- Create indexes for reporting
CREATE INDEX idx_hcp_dates ON home_care_patients(created_at);
CREATE INDEX idx_hsi_dates ON health_service_intakes(created_at);
CREATE INDEX idx_me_dates ON marketing_entries(created_at);
CREATE INDEX idx_egr_dates ON education_guidance_requests(created_at);
