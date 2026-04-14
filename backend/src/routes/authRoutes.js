const router = require('express').Router();

const AuthController = require('../controllers/authController');

router.post('/login', AuthController.loginValidation, AuthController.login);
router.post('/signup', AuthController.signupValidation, AuthController.signup);

module.exports = router;
