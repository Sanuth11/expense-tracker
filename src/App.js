import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

function App() {
  // State Management
  const [salary, setSalary] = useState(0);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch expenses from backend
  useEffect(() => {
    const fetchExpenses = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('https://expense-tracker-fe9a.onrender.com');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setExpenses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExpenses();
  }, []);

  // Add new expense
  const addExpense = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newExpense),
      });
      if (!response.ok) throw new Error('Failed to add expense');
      const data = await response.json();
      setExpenses([...expenses, data]);
      setNewExpense({
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const remainingBudget = salary - totalExpenses;

  // Prepare chart data
  const categories = [...new Set(expenses.map(expense => expense.category))];
  const categoryTotals = categories.map(category => 
    expenses
      .filter(expense => expense.category === category)
      .reduce((sum, expense) => sum + expense.amount, 0)
  );

  // Pie Chart Data
  const pieData = {
    labels: categories,
    datasets: [{
      data: categoryTotals,
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
        '#FF9F40', '#8AC249', '#EA5F89', '#00BFFF', '#A05195'
      ]
    }]
  };

  // Bar Chart Data (Salary vs Expenses)
  const barData = {
    labels: ['Salary', 'Expenses'],
    datasets: [{
      label: 'Amount',
      data: [salary, totalExpenses],
      backgroundColor: ['#36A2EB', '#FF6384']
    }]
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center mb-4">Expense Tracker</h1>
      
      {/* Error Message */}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row">
        <div className="col-md-6">
          {/* Salary Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Salary Information</h3>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label>Monthly Salary (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  value={salary}
                  onChange={(e) => setSalary(parseFloat(e.target.value))}
                />
              </div>
              <div className="mt-3">
                <h5>Remaining Budget: ${remainingBudget.toFixed(2)}</h5>
              </div>
            </div>
          </div>

          {/* Add Expense Card */}
          <div className="card">
            <div className="card-header">
              <h3>Add Expense</h3>
            </div>
            <div className="card-body">
              <form onSubmit={addExpense}>
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    className="form-control"
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Housing">Housing</option>
                    <option value="Food">Food</option>
                    <option value="Transportation">Transportation</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input
                    type="number"
                    name="amount"
                    className="form-control"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value)})}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    name="date"
                    className="form-control"
                    value={newExpense.date}
                    onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description (Optional)</label>
                  <input
                    type="text"
                    name="description"
                    className="form-control"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-primary mt-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Expense'}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          {/* Pie Chart Card */}
          <div className="card mb-4">
            <div className="card-header">
              <h3>Expense Breakdown</h3>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <Pie 
                data={pieData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Bar Chart Card */}
          <div className="card">
            <div className="card-header">
              <h3>Salary vs. Expenses</h3>
            </div>
            <div className="card-body" style={{ height: '300px' }}>
              <Bar 
                data={barData} 
                options={{ 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Expense History Table */}
      <div className="card mt-4">
        <div className="card-header">
          <h3>Expense History</h3>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="text-center">Loading expenses...</div>
          ) : expenses.length === 0 ? (
            <p>No expenses recorded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((expense, index) => (
                    <tr key={index}>
                      <td>{expense.date}</td>
                      <td>{expense.category}</td>
                      <td>₹{expense.amount.toFixed(2)}</td>
                      <td>{expense.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
