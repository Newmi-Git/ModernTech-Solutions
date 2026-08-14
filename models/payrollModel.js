import pool from "../config/db.js"; 

const getAllPayrolls = async () => {
    const [rows] = await pool.query(
        "SELECT * FROM payroll"
    );

    return rows;
};

const getPayrollByEmployeeId = async (employee_id) => {
    const [rows] = await pool.query(
        "SELECT * FROM payroll WHERE employee_id = ?",
        [employee_id]
    );

    return rows;
};

const updatePayroll = async (
    employee_id,
    hours_worked,
    leave_deductions
) => {
    await pool.query(
        `UPDATE payroll
        SET hours_worked = ?,
            leave_deductions = ?
        WHERE employee_id = ?`,
        [hours_worked, leave_deductions, employee_id]
    );
};

export {
    getAllPayrolls,
    getPayrollByEmployeeId,
    updatePayroll
};