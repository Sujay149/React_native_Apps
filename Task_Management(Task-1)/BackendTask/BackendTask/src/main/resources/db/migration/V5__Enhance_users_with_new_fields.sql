-- Enhance users table with new fields for TaskTrack Field Operations
ALTER TABLE users ADD COLUMN employee_id VARCHAR(50) UNIQUE;
ALTER TABLE users ADD COLUMN age INT;
ALTER TABLE users ADD COLUMN gender ENUM('MALE', 'FEMALE', 'OTHER');
ALTER TABLE users ADD COLUMN category VARCHAR(100); -- Home Care, Marketing, Security, Health, Education
ALTER TABLE users ADD COLUMN parent_user_id BIGINT; -- For hierarchical structure
ALTER TABLE users ADD COLUMN village VARCHAR(100);
ALTER TABLE users ADD COLUMN mandal VARCHAR(100);
ALTER TABLE users ADD COLUMN district VARCHAR(100);
ALTER TABLE users ADD COLUMN state VARCHAR(100);

-- Create indexes for better query performance
CREATE INDEX idx_employee_id ON users(employee_id);
CREATE INDEX idx_parent_user_id ON users(parent_user_id);
CREATE INDEX idx_category ON users(category);
CREATE INDEX idx_location ON users(district, mandal, village);

-- Add foreign key constraint for hierarchical relationship
ALTER TABLE users ADD CONSTRAINT fk_parent_user 
  FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE SET NULL;
