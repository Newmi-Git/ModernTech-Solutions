import {
    getAllPayrolls,
    getPayrollByEmployeeId,
    updatePayroll
} from "../models/payrollModel.js";


const calculatePayroll = (payroll) => {
    const hourlyRate =
        payroll.final_salary /
        (payroll.hours_worked - payroll.leave_deductions);

    const tax = payroll.final_salary * 0.18;
    const pension = payroll.final_salary * 0.05;
    const medical = payroll.final_salary * 0.02;

    const netSalary =
        payroll.final_salary - (tax + pension + medical);

    const annualSalary = payroll.final_salary * 12;

    return {
        ...payroll,
        hourly_rate: Number(hourlyRate.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        pension: Number(pension.toFixed(2)),
        medical: Number(medical.toFixed(2)),
        net_salary: Number(netSalary.toFixed(2)),
        annual_salary: annualSalary
    };
};


const getAllPayrollsController = async (req, res) => {
    const payrolls = await getAllPayrolls();

    const calculatedPayrolls = payrolls.map(payroll =>
        calculatePayroll(payroll)
    );

    res.json(calculatedPayrolls);
};


const getOnePayroll = async (req, res) => {
    const { employee_id } = req.params;

    const payroll = await getPayrollByEmployeeId(employee_id);

    if (payroll.length === 0) {
        return res.status(404).json({
            message: "Payroll record not found"
        });
    }

    const calculatedPayroll = calculatePayroll(payroll[0]);

    res.json(calculatedPayroll);
};


const editPayroll = async (req, res) => {
    const { employee_id } = req.params;

    const {
        hours_worked,
        leave_deductions
    } = req.body;

    await updatePayroll(
        employee_id,
        hours_worked,
        leave_deductions
    );

    const payroll = await getPayrollByEmployeeId(employee_id);

    const calculatedPayroll = calculatePayroll(payroll[0]);

    res.json({
        message: "Payroll updated successfully",
        payroll: calculatedPayroll
    });
};


export {
    getAllPayrollsController,
    getOnePayroll,
    editPayroll
};