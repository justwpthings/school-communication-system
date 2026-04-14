const { body } = require('express-validator');

const AuthService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const { validate } = require('../middleware/validate');

const signupValidation = validate([
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
]);

const loginValidation = validate([
  body('email').trim().isEmail().withMessage('A valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
]);

const signup = asyncHandler(async (req, res) => {
  const user = await AuthService.signupParent(req.body);

  res.status(201).json({
    success: true,
    message: 'Parent signup submitted for admin approval',
    data: user
  });
});

const login = asyncHandler(async (req, res) => {
  const data = await AuthService.login(req.body);

  res.json({
    success: true,
    message: 'Login successful',
    data
  });
});

module.exports = {
  signupValidation,
  loginValidation,
  signup,
  login
};
