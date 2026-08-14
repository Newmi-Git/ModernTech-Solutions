import {
    getLeaveRequests,
    createLeaveRequest,
    updateLeaveRequest
} from "../models/leaveRequestModel.js";

import pool from "../config/db.js";


const getAllLeaveRequests = async (req, res) => {
    const requests = await getLeaveRequests();

    res.json(requests);
};


const submitLeaveRequest = async (req, res) => {
    const {
        employee_id,
        date,
        reason
    } = req.body;

    await createLeaveRequest(
        employee_id,
        date,
        reason
    );

    res.json({
        message: "Leave request submitted successfully"
    });
};


const updateLeaveRequestStatus = async (req, res) => {
    const { request_id } = req.params;
    const { status } = req.body;

    await updateLeaveRequest(
        request_id,
        status
    );

    if (status === "Approved") {
        const [request] = await pool.query(
            `SELECT employee_id, date
             FROM leave_requests
             WHERE request_id = ?`,
            [request_id]
        );

        if (request.length > 0) {
            await pool.query(
                `INSERT INTO attendance
                (employee_id, date, status)
                VALUES (?, ?, 'Leave')`,
                [
                    request[0].employee_id,
                    request[0].date
                ]
            );
        }
    }

    res.json({
        message: `Leave request ${status.toLowerCase()} successfully`
    });
};


export {
    getAllLeaveRequests,
    submitLeaveRequest,
    updateLeaveRequestStatus
};