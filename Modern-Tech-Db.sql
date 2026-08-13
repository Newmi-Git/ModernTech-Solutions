CREATE SCHEMA `modern_tech_db` ;
USE modern_tech_db;

-- 1. EMPLOYEES TABLE
CREATE TABLE employees (
    employee_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(50) NOT NULL,
    salary DECIMAL(10, 2) NOT NULL CHECK (salary >= 0),
    employment_history TEXT,
    contact VARCHAR(100) UNIQUE NOT NULL,
    score INT CHECK (score BETWEEN 0 AND 100),
    goals_met INT DEFAULT 0 CHECK (goals_met >= 0),
    goals_total INT DEFAULT 0 CHECK (goals_total >= 0)
);

-- 2. USERS TABLE (Authentication)
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('hr', 'manager', 'employee') NOT NULL DEFAULT 'employee',
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE SET NULL
);

-- 3. PAYROLL TABLE
CREATE TABLE payroll (
    payroll_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    hours_worked DECIMAL(5, 2) NOT NULL CHECK (hours_worked >= 0),
    leave_deductions DECIMAL(5, 2) DEFAULT 0 CHECK (leave_deductions >= 0),
    final_salary DECIMAL(10, 2) NOT NULL CHECK (final_salary >= 0),
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 4. ATTENDANCE TABLE
CREATE TABLE attendance (
    attendance_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent', 'Leave') NOT NULL,
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);

-- 5. LEAVE REQUESTS TABLE
CREATE TABLE leave_requests (
    request_id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    reason VARCHAR(255) NOT NULL,
    status ENUM('Pending', 'Approved', 'Denied') NOT NULL DEFAULT 'Pending',
    FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
);


-- 1. INSERT EMPLOYEES (from employee_info.json)

INSERT INTO employees (employee_id, name, position, department, salary, employment_history, contact, score, goals_met, goals_total) VALUES
(1, 'Sibongile Nkosi', 'Software Engineer', 'Development', 70000.00, 'Joined in 2015, promoted to Senior in 2018', 'sibongile.nkosi@moderntech.com', 94, 5, 5),
(2, 'Lungile Moyo', 'HR Manager', 'HR', 80000.00, 'Joined in 2013, promoted to Manager in 2017', 'lungile.moyo@moderntech.com', 88, 4, 5),
(3, 'Thabo Molefe', 'Quality Analyst', 'QA', 55000.00, 'Joined in 2018', 'thabo.molefe@moderntech.com', 72, 3, 5),
(4, 'Keshav Naidoo', 'Sales Representative', 'Sales', 60000.00, 'Joined in 2020', 'keshav.naidoo@moderntech.com', 65, 3, 5),
(5, 'Zanele Khumalo', 'Marketing Specialist', 'Marketing', 58000.00, 'Joined in 2019', 'zanele.khumalo@moderntech.com', 81, 4, 5),
(6, 'Sipho Zulu', 'UI/UX Designer', 'Design', 65000.00, 'Joined in 2016', 'sipho.zulu@moderntech.com', 90, 5, 5),
(7, 'Naledi Moeketsi', 'DevOps Engineer', 'IT', 72000.00, 'Joined in 2017', 'naledi.moeketsi@moderntech.com', 78, 4, 5),
(8, 'Farai Gumbo', 'Content Strategist', 'Marketing', 56000.00, 'Joined in 2021', 'farai.gumbo@moderntech.com', 55, 2, 5),
(9, 'Karabo Dlamini', 'Accountant', 'Finance', 62000.00, 'Joined in 2018', 'karabo.dlamini@moderntech.com', 67, 3, 5),
(10, 'Fatima Patel', 'Customer Support Lead', 'Support', 58000.00, 'Joined in 2016', 'fatima.patel@moderntech.com', 84, 4, 5);

-- 2. INSERT USERS (Authentication accounts linked to employees)
-- Note: Replace '$2b$10$SampleHashedPassword...' with real hashed passwords when testing authentication
INSERT INTO users (employee_id, email, password_hash, role) VALUES
(2, 'lungile.moyo@moderntech.com', '$2b$10$SampleHashedPassword1', 'hr'),
(1, 'sibongile.nkosi@moderntech.com', '$2b$10$SampleHashedPassword2', 'manager'),
(3, 'thabo.molefe@moderntech.com', '$2b$10$SampleHashedPassword3', 'employee'),
(4, 'keshav.naidoo@moderntech.com', '$2b$10$SampleHashedPassword4', 'employee'),
(5, 'zanele.khumalo@moderntech.com', '$2b$10$SampleHashedPassword5', 'employee'),
(6, 'sipho.zulu@moderntech.com', '$2b$10$SampleHashedPassword6', 'employee'),
(7, 'naledi.moeketsi@moderntech.com', '$2b$10$SampleHashedPassword7', 'employee'),
(8, 'farai.gumbo@moderntech.com', '$2b$10$SampleHashedPassword8', 'employee'),
(9, 'karabo.dlamini@moderntech.com', '$2b$10$SampleHashedPassword9', 'employee'),
(10, 'fatima.patel@moderntech.com', '$2b$10$SampleHashedPassword10', 'employee');

-- 3. INSERT PAYROLL (from payroll_data.json)
INSERT INTO payroll (employee_id, hours_worked, leave_deductions, final_salary) VALUES
(1, 160.00, 8.00, 69500.00),
(2, 150.00, 10.00, 79000.00),
(3, 170.00, 4.00, 54800.00),
(4, 165.00, 6.00, 59700.00),
(5, 158.00, 5.00, 57850.00),
(6, 168.00, 2.00, 64800.00),
(7, 175.00, 3.00, 71800.00),
(8, 160.00, 0.00, 56000.00),
(9, 155.00, 5.00, 61500.00),
(10, 162.00, 4.00, 57750.00);

-- 4. INSERT ATTENDANCE (from attendance.json)
INSERT INTO attendance (employee_id, date, status) VALUES
(1, '2025-07-25', 'Present'), (1, '2025-07-26', 'Absent'), (1, '2025-07-27', 'Present'), (1, '2025-07-28', 'Present'), (1, '2025-07-29', 'Present'),
(2, '2025-07-25', 'Present'), (2, '2025-07-26', 'Present'), (2, '2025-07-27', 'Absent'), (2, '2025-07-28', 'Present'), (2, '2025-07-29', 'Present'),
(3, '2025-07-25', 'Present'), (3, '2025-07-26', 'Present'), (3, '2025-07-27', 'Present'), (3, '2025-07-28', 'Absent'), (3, '2025-07-29', 'Present'),
(4, '2025-07-25', 'Absent'), (4, '2025-07-26', 'Present'), (4, '2025-07-27', 'Present'), (4, '2025-07-28', 'Present'), (4, '2025-07-29', 'Present'),
(5, '2025-07-25', 'Present'), (5, '2025-07-26', 'Present'), (5, '2025-07-27', 'Absent'), (5, '2025-07-28', 'Present'), (5, '2025-07-29', 'Present'),
(6, '2025-07-25', 'Present'), (6, '2025-07-26', 'Present'), (6, '2025-07-27', 'Absent'), (6, '2025-07-28', 'Present'), (6, '2025-07-29', 'Present'),
(7, '2025-07-25', 'Present'), (7, '2025-07-26', 'Present'), (7, '2025-07-27', 'Present'), (7, '2025-07-28', 'Absent'), (7, '2025-07-29', 'Present'),
(8, '2025-07-25', 'Present'), (8, '2025-07-26', 'Absent'), (8, '2025-07-27', 'Present'), (8, '2025-07-28', 'Present'), (8, '2025-07-29', 'Present'),
(9, '2025-07-25', 'Present'), (9, '2025-07-26', 'Present'), (9, '2025-07-27', 'Present'), (9, '2025-07-28', 'Absent'), (9, '2025-07-29', 'Present'),
(10, '2025-07-25', 'Present'), (10, '2025-07-26', 'Present'), (10, '2025-07-27', 'Absent'), (10, '2025-07-28', 'Present'), (10, '2025-07-29', 'Present');

-- 5. INSERT LEAVE REQUESTS (from attendance.json)
INSERT INTO leave_requests (employee_id, date, reason, status) VALUES
(1, '2025-07-22', 'Sick Leave', 'Approved'),
(1, '2024-12-01', 'Personal', 'Pending'),
(2, '2025-07-15', 'Family Responsibility', 'Denied'),
(2, '2024-12-02', 'Vacation', 'Approved'),
(3, '2025-07-10', 'Medical Appointment', 'Approved'),
(3, '2024-12-05', 'Personal', 'Pending'),
(4, '2025-07-20', 'Bereavement', 'Approved'),
(5, '2024-12-01', 'Childcare', 'Pending'),
(6, '2025-07-18', 'Sick Leave', 'Approved'),
(7, '2025-07-22', 'Vacation', 'Pending'),
(8, '2024-12-02', 'Medical Appointment', 'Approved'),
(9, '2025-07-19', 'Childcare', 'Denied'),
(10, '2024-12-03', 'Vacation', 'Pending');


SELECT COUNT(*) FROM employees;      -- Should return 10
SELECT COUNT(*) FROM users;          -- Should return 10
SELECT COUNT(*) FROM payroll;        -- Should return 10
SELECT COUNT(*) FROM attendance;     -- Should return 50
SELECT COUNT(*) FROM leave_requests; -- Should return 13