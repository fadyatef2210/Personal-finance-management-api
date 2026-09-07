const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Goal name is required'],
      trim: true,
      maxlength: [60, 'Goal name must be at most 60 characters'],
    },
    targetAmount: {
      type: Number,
      required: [true, 'Target amount is required'],
      min: [0.01, 'Target amount must be greater than 0'],
    },
    currentAmount: {
      type: Number,
      default: 0,
      min: [0, 'Current amount cannot be negative'],
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
    },
  },
  { timestamps: true }
);

savingsGoalSchema.virtual('progressPercentage').get(function getProgressPercentage() {
  if (!this.targetAmount) return 0;
  return Math.min(Math.round((this.currentAmount / this.targetAmount) * 100), 100);
});

savingsGoalSchema.set('toJSON', { virtuals: true });
savingsGoalSchema.set('toObject', { virtuals: true });


savingsGoalSchema.pre('save', function autoComplete(next) {
  if (this.currentAmount >= this.targetAmount && this.status === 'in_progress') {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
