-- Create location hierarchy tables
CREATE TABLE states (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE districts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    state_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE CASCADE,
    UNIQUE KEY unique_district_per_state (state_id, name)
);

CREATE TABLE mandals (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    district_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (district_id) REFERENCES districts(id) ON DELETE CASCADE,
    UNIQUE KEY unique_mandal_per_district (district_id, name)
);

CREATE TABLE villages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    mandal_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mandal_id) REFERENCES mandals(id) ON DELETE CASCADE,
    UNIQUE KEY unique_village_per_mandal (mandal_id, name)
);

-- Create role hierarchy mapping table
CREATE TABLE role_hierarchy (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    hierarchy_level INT NOT NULL,
    can_manage_below_level INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES role_entity(id) ON DELETE CASCADE,
    UNIQUE KEY unique_role_hierarchy (role_id)
);

-- Create indexes for location queries
CREATE INDEX idx_states ON states(name);
CREATE INDEX idx_districts ON districts(state_id, name);
CREATE INDEX idx_mandals ON mandals(district_id, name);
CREATE INDEX idx_villages ON villages(mandal_id, name);
