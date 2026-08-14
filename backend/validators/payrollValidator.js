const { body, validationResult } = require('express-validator');

const validatePayroll = [
  body('employee_id').isInt().withMessage('Valid employee_id is required.'),
  body('hours_worked').isFloat({ min: 0 }).withMessage('Hours worked must be a positive number.'),
  body('leave_deductions').optional().isFloat({ min: 0 }).withMessage('Leave deductions must be 0 or more.'),
  body('final_salary').isFloat({ min: 0 }).withMessage('Final salary must be a positive number.'),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { validatePayroll, handleValidtion };