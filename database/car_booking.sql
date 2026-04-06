-- LUXEDRIVE Database Schema (Production Ready)
CREATE DATABASE IF NOT EXISTS car_booking;
USE car_booking;

-- Users Table (With Email Indexing)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    mobile VARCHAR(40),
    profile_image VARCHAR(255) DEFAULT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- Cars Table (With Searchable Status Index)
CREATE TABLE IF NOT EXISTS cars (
    id INT AUTO_INCREMENT PRIMARY KEY,
    car_name VARCHAR(100) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price_per_day INT NOT NULL,
    image VARCHAR(255),
    description TEXT,
    type VARCHAR(50) DEFAULT 'Luxury',
    availability_status VARCHAR(20) NOT NULL DEFAULT 'available',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_car_status (availability_status)
) ENGINE=InnoDB;

-- Bookings Table (With Date & FK Indexing)
CREATE TABLE IF NOT EXISTS bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    car_id INT NOT NULL,
    pickup_date DATE NOT NULL,
    return_date DATE NOT NULL,
    total_price INT NOT NULL,
    pickup_location VARCHAR(255) NOT NULL,
    destination VARCHAR(255),
    status VARCHAR(20) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_booking_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    INDEX idx_booking_car_dates (car_id, pickup_date, return_date)
) ENGINE=InnoDB;

-- Index for booking overlap checks
CREATE INDEX idx_booking_car_date ON bookings(car_id, pickup_date);

-- Contact Messages (Support Log)
CREATE TABLE IF NOT EXISTS contact_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- OTPs for Mobile Verification
CREATE TABLE IF NOT EXISTS otps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Seed Data (Featured Premium Fleet)
INSERT INTO cars (car_name, brand, price_per_day, image, description, type) VALUES
('Tesla Model S', 'Tesla', 150, 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=800&q=80', 'Experience the pinnacle of electric performance and luxury with autopilot capabilities.', 'Luxury'),
('BMW M4', 'BMW', 200, 'https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&w=800&q=80', 'High-performance sports coupe with precision handling and aggressive styling.', 'Sports'),
('Audi Q7', 'Audi', 120, 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80', 'Spacious luxury SUV perfect for family trips and off-road adventures.', 'SUV'),
('Mercedes S-Class', 'Mercedes', 250, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80', 'The ultimate statement of success. Unmatched comfort and state-of-the-art technology.', 'Luxury'),
('Range Rover Sport', 'Land Rover', 180, 'https://images.unsplash.com/photo-1606148632349-43a29035272a?auto=format&fit=crop&w=800&q=80', 'Rugged luxury for all terrains. Command the road with style.', 'SUV');
