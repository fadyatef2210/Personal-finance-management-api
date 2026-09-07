const express = require('express');
const transactionController = require('../controllers/transaction.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const {
  validateCreateTransaction,
  validateUpdateTransaction,
} = require('../validators/transaction.validator');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(transactionController.getTransactions)
  .post(validate(validateCreateTransaction), transactionController.createTransaction);

router.route('/:id')
  .get(transactionController.getTransaction)
  .patch(validate(validateUpdateTransaction), transactionController.updateTransaction)
  .delete(transactionController.deleteTransaction);

module.exports = router;
