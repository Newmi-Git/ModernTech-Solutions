import {
    getAttendance,
    createAttendance
} from "../models/attendanceModel.js";


const getAllAttendance = async (req, res) => {
    const attendance = await getAttendance();

    res.json(attendance);
};


const markAttendance = async (req, res) => {
    const {
        employee_id,
        date,
        status
    } = req.body;

    await createAttendance(
        employee_id,
        date,
        status
    );

    res.json({
        message: "Attendance marked successfully"
    });
};


export {
    getAllAttendance,
    markAttendance
};