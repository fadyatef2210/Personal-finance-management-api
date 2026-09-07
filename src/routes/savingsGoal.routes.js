const express = require('express');
const goalController = require('../controllers/savingsGoal.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const {
  validateCreateGoal,
  validateUpdateGoal,
  validateContribution,
} = require('../validators/savingsGoal.validator');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(goalController.getGoals)
  .post(validate(validateCreateGoal), goalController.createGoal);

router.route('/:id')
  .get(goalController.getGoal)
  .patch(validate(validateUpdateGoal), goalController.updateGoal)
  .delete(goalController.deleteGoal);

router.post('/:id/contribute', validate(validateContribution), goalController.contributeToGoal);

module.exports = router;
