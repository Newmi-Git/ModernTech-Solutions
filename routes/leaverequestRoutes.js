import express from "express";

import {
    getAllLeaveRequests,
    submitLeaveRequest,
    updateLeaveRequestStatus
} from "../controllers/leaveRequestController.js";


const router = express.Router();


router.get("/", getAllLeaveRequests);

router.post("/", submitLeaveRequest);

router.put("/:request_id", updateLeaveRequestStatus);


export default router;