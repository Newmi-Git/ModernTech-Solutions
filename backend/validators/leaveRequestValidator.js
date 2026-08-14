const { body, validationResult } = require('express-validator');

const validateLeaveRequest = [
  body('employee_id').isInt().withMessage('Valid employee_id is required.'),
  body('date').isDate().withMessage('A valid date is required.'),
  body('reason').trim().notEmpty().withMessage('Reason is required.'),
  body('status').optional().isIn(['Pending', 'Approved', 'Denied']).withMessage("Status must be 'Pending', 'Approved', or 'Denied'."),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array()});
  }
  next();
}

module.exports = { validateLeaveRequest, handleValidation };