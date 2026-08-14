import pool from "../config/db.js";


const getLeaveRequests = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM leave_requests"
    );

    return rows;
};


const createLeaveRequest = async (
    employee_id,
    date,
    reason
) => {
    await pool.query(
        `INSERT INTO leave_requests
        (employee_id, date, reason)
        VALUES (?, ?, ?)`,
        [employee_id, date, reason]
    );
};


const updateLeaveRequest = async (
    request_id,
    status
) => {
    await pool.query(
        `UPDATE leave_requests
        SET status = ?
        WHERE request_id = ?`,
        [status, request_id]
    );
};


export {
    getLeaveRequests,
    createLeaveRequest,
    updateLeaveRequest
};