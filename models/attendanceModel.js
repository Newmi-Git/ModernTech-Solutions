import pool from "../config/db.js";

const getAttendance = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM attendance"
    );

    return rows;
};

const createAttendance = async (
    employee_id,
    date,
    status
) => {
    await pool.query(
        `INSERT INTO attendance
        (employee_id, date, status)
        VALUES (?, ?, ?)`,
        [employee_id, date, status]
    );
};

export {
    getAttendance,
    createAttendance
};