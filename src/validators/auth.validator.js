const EMAIL_REGEX = /^\S+@\S+\.\S+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

const validateRegister = (req) => {
  const { name, email, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push({ field: 'name', message: 'Name is required and must be at least 2 characters' });
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }
  if (!password || !PASSWORD_REGEX.test(password)) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 8 characters and include a letter and a number',
    });
  }

  return errors;
};

const validateLogin = (req) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !EMAIL_REGEX.test(email)) {
    errors.push({ field: 'email', message: 'A valid email is required' });
  }
  if (!password) {
    errors.push({ field: 'password', message: 'Password is required' });
  }

  return errors;
};

const validateUpdateProfile = (req) => {
  const { name, currency } = req.body;
  const errors = [];

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
  }
  if (currency !== undefined && (typeof currency !== 'string' || currency.trim().length !== 3)) {
    errors.push({ field: 'currency', message: 'Currency must be a 3-letter ISO code, e.g. USD' });
  }

  return errors;
};

const validateChangePassword = (req) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push({ field: 'currentPassword', message: 'Current password is required' });
  }
  if (!newPassword || !PASSWORD_REGEX.test(newPassword)) {
    errors.push({
      field: 'newPassword',
      message: 'New password must be at least 8 characters and include a letter and a number',
    });
  }

  return errors;
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
};
