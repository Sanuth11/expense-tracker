const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors({origin:https:expense-tracker-mk9w4mnvl-sanuths-projects-b65f89aa.vercel.app));}
app.use(express.json());

// Connect to your MongoDB (local or Atlas)
mongoose.connect('mongodb://localhost:27017/expense-tracker') // Replace with Atlas URI if needed
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ Connection failed:', err));

// Define Expense Schema
const expenseSchema = new mongoose.Schema({
  userId: String,          // To identify users later
  month: String,           // e.g., "2024-01"
  category: String,        // e.g., "Food", "Rent"
  amount: Number,
  date: { type: Date, default: Date.now },
  description: String
});

const Expense = mongoose.model('Expense', expenseSchema);

// API: Add New Expense
app.post('/api/expenses', async (req, res) => {
  try {
    const { userId, month, category, amount, description } = req.body;
    const expense = new Expense({ userId, month, category, amount, description });
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// API: Get Monthly Expenses
app.get('/api/expenses/:userId/:month', async (req, res) => {
  try {
    const expenses = await Expense.find({ 
      userId: req.params.userId, 
      month: req.params.month 
    });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
