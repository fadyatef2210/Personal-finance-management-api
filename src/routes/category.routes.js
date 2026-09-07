const express = require('express');
const categoryController = require('../controllers/category.controller');
const validate = require('../middleware/validate.middleware');
const { protect } = require('../middleware/auth.middleware');
const { validateCreateCategory, validateUpdateCategory } = require('../validators/category.validator');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(categoryController.getCategories)
  .post(validate(validateCreateCategory), categoryController.createCategory);

router.route('/:id')
  .get(categoryController.getCategory)
  .patch(validate(validateUpdateCategory), categoryController.updateCategory)
  .delete(categoryController.deleteCategory);

module.exports = router;
