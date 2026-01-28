CREATE DATABASE angelmed_db;
USE angelmed_db;

-- Users table (for authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Donors table (base table for all donors including life members)
CREATE TABLE donors (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    donor_type ENUM('Individual', 'Organization', 'Anonymous', 'Life Member') DEFAULT 'Individual',
    status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_name (name),
    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_donor_type (donor_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Life Members table (extends donors table)
CREATE TABLE life_members (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT UNIQUE NOT NULL,
    aadhar_number VARCHAR(12),
    join_date DATE NOT NULL,
    join_time TIME,
    membership_status ENUM('Active', 'Inactive') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    
    INDEX idx_donor_id (donor_id),
    INDEX idx_membership_status (membership_status),
    INDEX idx_join_date (join_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MONETARY DONATIONS TABLE
CREATE TABLE donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    payment_mode ENUM('Cash', 'UPI', 'Bank Transfer', 'Credit Card', 'Debit Card') NOT NULL,
    purpose VARCHAR(255) NOT NULL,
    status ENUM('Completed', 'Pending') DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    
    INDEX idx_donor_id (donor_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- MEDICAL DONATIONS TABLE
CREATE TABLE medical_donations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    donor_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    category ENUM('Medicine', 'Supplement', 'Equipment') NOT NULL,
    strength VARCHAR(100) COMMENT 'Only applicable for Medicine/Supplement (e.g., 500mg, 10ml)',
    quantity INT NOT NULL DEFAULT 0,
    expiry_date DATE COMMENT 'Only applicable for Medicine/Supplement',
    status ENUM('pending', 'approved', 'rejected', 'collected') DEFAULT 'pending',
    donation_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (donor_id) REFERENCES donors(id) ON DELETE CASCADE,
    
    INDEX idx_donor_id (donor_id),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_expiry_date (expiry_date),
    INDEX idx_donation_date (donation_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Constraints for medical_donations
ALTER TABLE medical_donations
ADD CONSTRAINT chk_strength_category 
CHECK (
    (category IN ('Medicine', 'Supplement') OR strength IS NULL)
);

ALTER TABLE medical_donations
ADD CONSTRAINT chk_expiry_category 
CHECK (
    (category IN ('Medicine', 'Supplement') OR expiry_date IS NULL)
);

-- Clients table
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    age INT,
    gender ENUM('Male', 'Female', 'Other'),
    phone VARCHAR(20),
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip VARCHAR(20) NOT NULL,
    aadhaar VARCHAR(20) UNIQUE NOT NULL,
    status ENUM('Active', 'Inactive', 'Dead') DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- DISTRIBUTIONS TABLE
CREATE TABLE distributions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    assistance_type ENUM('money', 'medicine', 'equipment') NOT NULL,
    item_name VARCHAR(255) COMMENT 'Medicine or equipment name',
    strength VARCHAR(100) COMMENT 'Medicine strength (e.g., 500mg, 10ml) - only for medicine',
    amount DECIMAL(10, 2) COMMENT 'Only for money type',
    quantity INT COMMENT 'Only for medicine/equipment',
    unit VARCHAR(50) COMMENT 'tablets, bottles, strips, units, pieces, etc.',
    description TEXT COMMENT 'Additional details - optional',
    assistance_date DATE NOT NULL,
    status ENUM('provided', 'pending', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    
    INDEX idx_client_id (client_id),
    INDEX idx_assistance_type (assistance_type),
    INDEX idx_status (status),
    INDEX idx_assistance_date (assistance_date),
    INDEX idx_item_name (item_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Events table
CREATE TABLE events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATETIME NOT NULL,
    location VARCHAR(255),
    status ENUM('Upcoming', 'Completed', 'Cancelled') DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    
    INDEX idx_client_id (client_id),
    INDEX idx_status (status),
    INDEX idx_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

