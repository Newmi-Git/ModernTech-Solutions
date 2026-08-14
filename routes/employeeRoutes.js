import express from "express";

import {
    getAllEmployees,
    getOneEmployee,
    createNewEmployee,
    editEmployee,
    removeEmployee
} from "../controllers/employeesController.js";

const router = express.Router();

router.get("/", getAllEmployees);

router.get("/:employee_id", getOneEmployee);

router.post("/", createNewEmployee);

router.put("/:employee_id", editEmployee);

router.delete("/:employee_id", removeEmployee);

export default router;