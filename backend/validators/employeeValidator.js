const { body, validationResult } = require('express-validator');

const validateEmployee = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('position').trim().notEmpty().withMessage('Position is required.'),
  body('department').trim().notEmpty().withMessage('Department is required.'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number.'),
  body('contact').trim().notEmpty().withMessage('Contact is required.'),
  body('score').optional().isInt({ min: 0, max: 100 }).withMessage('Score must be between 0 and 100.'),
  body('goals_met').optional().isInt({ min: 0 }).withMessage('Goals met must be 0 or more.'),
  body('goals_total').optional().isInt({ min: 0 }).withMessage('Goals total must be 0 or more.'),
];

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
}

module.exports = { validateEmployee, handleValidation };