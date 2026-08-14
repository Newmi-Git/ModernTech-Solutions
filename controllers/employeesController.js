import {
    getEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee
} from "../models/employeeModel.js";

const getAllEmployees = async (req, res) => {
    const employees = await getEmployees();

    res.json(employees);
};

const getOneEmployee = async (req, res) => {
    const { employee_id } = req.params;
    const employee = await getEmployeeById(employee_id);

    if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
    }   

    res.json(employee);
};

const createNewEmployee = async (req, res) => {
    const {
        name,
        position,
        department,
        salary,
        employment_history,
        contact,
        score,
        goals_met,
        goals_total
    } = req.body;

    await createEmployee(
        name,
        position,
        department,
        salary,
        employment_history,
        contact,
        score,
        goals_met,
        goals_total
    );

    res.json({
        message: "Employee added successfully"
    });
};

const editEmployee = async (req, res) => {
    const { employee_id } = req.params;

    const {
        name,
        position,
        department,
        salary,
        employment_history,
        contact,
        score,
        goals_met,
        goals_total
    } = req.body;

    await updateEmployee(
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
    );

    res.json({
        message: "Employee updated successfully"
    });
};

const removeEmployee = async (req, res) => {
    const { employee_id } = req.params;

    await deleteEmployee(employee_id);

    res.json({
        message: "Employee deleted successfully"
    });
};

export {
    getAllEmployees,
    getOneEmployee,
    createNewEmployee,
    editEmployee,
    removeEmployee
};