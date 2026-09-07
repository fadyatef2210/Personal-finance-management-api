const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [40, 'Category name must be at most 40 characters'],
    },
    type: {
      type: String,
      enum: {
        values: ['income', 'expense'],
        message: 'Category type must be either "income" or "expense"',
      },
      required: [true, 'Category type is required'],
    },
    icon: {
      type: String,
      default: 'default',
      trim: true,
    },
    color: {
      type: String,
      default: '#6b7280',
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);


categorySchema.index({ user: 1, name: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Category', categorySchema);
