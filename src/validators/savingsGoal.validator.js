const validateCreateGoal = (req) => {
  const { name, targetAmount, deadline } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ field: 'name', message: 'Goal name is required' });
  }
  if (targetAmount === undefined || isNaN(targetAmount) || Number(targetAmount) <= 0) {
    errors.push({ field: 'targetAmount', message: 'Target amount is required and must be greater than 0' });
  }
  if (deadline !== undefined && deadline !== null && isNaN(Date.parse(deadline))) {
    errors.push({ field: 'deadline', message: 'Deadline must be a valid date' });
  }

  return errors;
};

const validateUpdateGoal = (req) => {
  const { name, targetAmount, deadline, status } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    errors.push({ field: 'name', message: 'Goal name cannot be empty' });
  }
  if (targetAmount !== undefined && (isNaN(targetAmount) || Number(targetAmount) <= 0)) {
    errors.push({ field: 'targetAmount', message: 'Target amount must be greater than 0' });
  }
  if (deadline !== undefined && deadline !== null && isNaN(Date.parse(deadline))) {
    errors.push({ field: 'deadline', message: 'Deadline must be a valid date' });
  }
  if (status !== undefined && !['in_progress', 'completed', 'cancelled'].includes(status)) {
    errors.push({ field: 'status', message: 'Status must be one of: in_progress, completed, cancelled' });
  }

  return errors;
};

const validateContribution = (req) => {
  const { amount } = req.body;
  const errors = [];

  if (amount === undefined || isNaN(amount) || Number(amount) <= 0) {
    errors.push({ field: 'amount', message: 'Contribution amount is required and must be greater than 0' });
  }

  return errors;
};

module.exports = { validateCreateGoal, validateUpdateGoal, validateContribution };
