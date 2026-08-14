import express from "express";

import {
    getAllPayrollsController,
    getOnePayroll,
    editPayroll
} from "../controllers/payrollsController.js";

const router = express.Router();

router.get("/", getAllPayrollsController);

router.get("/:employee_id", getOnePayroll);

router.put("/:employee_id", editPayroll);

export default router;