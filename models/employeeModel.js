import pool from "../config/db.js";

const getEmployees = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM employees"
    );

    return rows;
};

const getEmployeeById = async (employee_id) => {
    const [rows] = await pool.query(
        "SELECT * FROM employees WHERE employee_id = ?",
        [employee_id]
    );

    return rows;
};

const createEmployee = async (
    name,
    position,
    department,
    salary,
    employment_history,
    contact,
    score,
    goals_met,
    goals_total
) => {
    await pool.query(
        `INSERT INTO employees
        (name, position, department, salary, employment_history, contact, score, goals_met, goals_total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            name,
            position,
            department,
            salary,
            employment_history,
            contact,
            score,
            goals_met,
            goals_total
        ]
    );
};

const updateEmployee = async (
    employee_id,
    name,
    position,
    department,
    salary,
    employment_history,
    contact,
    score,
    goals_met,
    goals_total
) => {
    await pool.query(
        `UPDATE employees
        SET name = ?,
            position = ?,
            department = ?,
            salary = ?,
            employment_history = ?,
            contact = ?,
            score = ?,
            goals_met = ?,
            goals_total = ?
        WHERE employee_id = ?`,
        [
            name,
            position,
            department,
            salary,
            employment_history,
            contact,
            score,
            goals_met,
            goals_total,
            employee_id
        ]
    );
};

const deleteEmployee = async (employee_id) => {
    await pool.query(
        "DELETE FROM employees WHERE employee_id = ?",
        [employee_id]
    );
};

export {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
};