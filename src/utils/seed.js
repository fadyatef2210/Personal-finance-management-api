
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const SavingsGoal = require('../models/SavingsGoal');
const { seedDefaultCategories } = require('../services/auth.service');

const DEMO_EMAIL = 'demo@financeapp.test';
const DEMO_PASSWORD = 'Passw0rd123';

const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

const run = async () => {
  await connectDB();

  let user = await User.findOne({ email: DEMO_EMAIL });
  if (user) {
    console.log('Demo user already exists, wiping their data to reseed...');
    await Promise.all([
      Transaction.deleteMany({ user: user._id }),
      Budget.deleteMany({ user: user._id }),
      SavingsGoal.deleteMany({ user: user._id }),
      Category.deleteMany({ user: user._id }),
    ]);
  } else {
    user = await User.create({ name: 'Demo User', email: DEMO_EMAIL, password: DEMO_PASSWORD });
  }

  await seedDefaultCategories(user._id);
  const categories = await Category.find({ user: user._id });
  const catByName = Object.fromEntries(categories.map((c) => [c.name, c]));

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const transactions = [
    { type: 'income', category: catByName.Salary, amount: 2000, description: 'Monthly salary', date: daysAgo(20) },
    { type: 'income', category: catByName.Freelance, amount: 350, description: 'Freelance project', date: daysAgo(12) },
    { type: 'expense', category: catByName.Food, amount: 220, description: 'Groceries', date: daysAgo(18) },
    { type: 'expense', category: catByName.Food, amount: 60, description: 'Restaurant', date: daysAgo(5) },
    { type: 'expense', category: catByName.Transport, amount: 90, description: 'Fuel', date: daysAgo(15) },
    { type: 'expense', category: catByName.Housing, amount: 700, description: 'Rent', date: daysAgo(25) },
    { type: 'expense', category: catByName.Utilities, amount: 150, description: 'Electricity & water', date: daysAgo(10) },
    { type: 'expense', category: catByName.Entertainment, amount: 45, description: 'Streaming + cinema', date: daysAgo(7) },
    { type: 'expense', category: catByName.Health, amount: 80, description: 'Pharmacy', date: daysAgo(3) },
  ].map((t) => ({ ...t, user: user._id, category: t.category._id }));

  await Transaction.insertMany(transactions);

  await Budget.create({ user: user._id, category: catByName.Food._id, month, year, limitAmount: 300 });
  await Budget.create({ user: user._id, category: null, month, year, limitAmount: 1500 });

  await SavingsGoal.create({
    user: user._id,
    name: 'Emergency Fund',
    targetAmount: 5000,
    currentAmount: 800,
    deadline: new Date(year + 1, 0, 1),
  });

  console.log('\nSeed complete.');
  console.log('Demo login:');
  console.log(`  email:    ${DEMO_EMAIL}`);
  console.log(`  password: ${DEMO_PASSWORD}`);
  console.log('\nTry: GET /api/analytics/dashboard (with the token from /api/auth/login)\n');

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
