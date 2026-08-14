const { body, validationResult } = require('express-validator');

const validateAttendance = [
  body('employee_id').isInt().withMessage('Valid employee_id is required.'),
  body('date').isDate().withMessage('A valid date is required.'),
  body('status').isIn(['Present', 'Absent', 'Leave']).withMessage("Status must be 'Present', 'Absent', or 'Leave'."),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { validateAttendance, handleValidtion };