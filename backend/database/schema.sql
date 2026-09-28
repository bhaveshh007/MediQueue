CREATE DATABASE IF NOT EXISTS mediqueue;

USE mediqueue;

-- =========================================
-- 1. PATIENTS
-- =========================================

CREATE TABLE patients (
    patient_id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    mobile VARCHAR(15) NOT NULL,
    email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uk_patient_mobile (mobile),
    INDEX idx_patient_name (name)
);


-- =========================================
-- 2. ADMINS
-- =========================================

CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 3. DEPARTMENTS
-- =========================================

CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- =========================================
-- 4. DOCTORS
-- =========================================

CREATE TABLE doctors (
    doctor_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    status ENUM('ACTIVE', 'INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_doctor_department
        FOREIGN KEY (department_id)
        REFERENCES departments(department_id),

    INDEX idx_doctor_department (department_id)
);


-- =========================================
-- 5. DOCTOR SCHEDULES
-- =========================================

CREATE TABLE doctor_schedules (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    doctor_id INT NOT NULL,
    schedule_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration INT NOT NULL DEFAULT 15,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_schedule_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(doctor_id)
        ON DELETE CASCADE,

    UNIQUE KEY uk_doctor_schedule (
        doctor_id,
        schedule_date,
        start_time,
        end_time
    ),

    INDEX idx_schedule_date (schedule_date)
);


-- =========================================
-- 6. APPOINTMENTS
-- =========================================

CREATE TABLE appointments (
    appointment_id VARCHAR(20) PRIMARY KEY,
    patient_id VARCHAR(20) NOT NULL,
    doctor_id INT NOT NULL,
    schedule_id INT NOT NULL,

    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,

    status ENUM(
        'BOOKED',
        'CONFIRMED',
        'WAITING',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'BOOKED',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id)
        REFERENCES patients(patient_id),

    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES doctors(doctor_id),

    CONSTRAINT fk_appointment_schedule
        FOREIGN KEY (schedule_id)
        REFERENCES doctor_schedules(schedule_id),

    UNIQUE KEY uk_doctor_slot (
        doctor_id,
        appointment_date,
        appointment_time
    ),

    INDEX idx_appointment_patient (patient_id),
    INDEX idx_appointment_doctor (doctor_id),
    INDEX idx_appointment_status (status),
    INDEX idx_appointment_date (appointment_date)
);


-- =========================================
-- 7. APPOINTMENT HISTORY
-- =========================================

CREATE TABLE appointment_history (
    history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id VARCHAR(20) NOT NULL,

    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,

    changed_by VARCHAR(100) NOT NULL,
    remark VARCHAR(500),

    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_history_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id)
        ON DELETE CASCADE,

    INDEX idx_history_appointment (appointment_id),
    INDEX idx_history_changed_at (changed_at)
);


-- =========================================
-- 8. QUEUE ENTRIES
-- =========================================

CREATE TABLE queue_entries (
    queue_id BIGINT AUTO_INCREMENT PRIMARY KEY,

    appointment_id VARCHAR(20) NOT NULL UNIQUE,

    token_number INT NOT NULL,

    queue_status ENUM(
        'WAITING',
        'IN_PROGRESS',
        'COMPLETED',
        'CANCELLED'
    ) DEFAULT 'WAITING',

    estimated_wait_minutes INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_queue_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES appointments(appointment_id)
        ON DELETE CASCADE,

    INDEX idx_queue_token (token_number),
    INDEX idx_queue_status (queue_status)
);