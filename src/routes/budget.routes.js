const express = require('express');
const budgetController = require('../controllers/budget.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { validateCreateBudget, validateUpdateBudget } = require('../validators/budget.validator');

const router = express.Router();

router.use(protect);

router.get('/usage', budgetController.getBudgetUsage);

router.route('/')
  .get(budgetController.getBudgets)
  .post(validate(validateCreateBudget), budgetController.createBudget);

router.route('/:id')
  .get(budgetController.getBudget)
  .patch(validate(validateUpdateBudget), budgetController.updateBudget)
  .delete(budgetController.deleteBudget);

module.exports = router;
