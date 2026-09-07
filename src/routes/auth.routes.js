const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', validate(validateRegister), authController.register);
router.post('/login', validate(validateLogin), authController.login);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);
router.patch('/me', protect, validate(validateUpdateProfile), authController.updateMe);
router.patch('/change-password', protect, validate(validateChangePassword), authController.changePassword);

module.exports = router;
