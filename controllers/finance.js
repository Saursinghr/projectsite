const Expenses = require('../model/Expenses');
const ExtraFinance = require('../model/ExtraFinance');

// Add new finance
exports.addFinance = async (req, res) => {
  try {
    const { siteId, siteName, category, date, amount, paymentMethod, referenceNumber, description, notes } = req.body;
    
    // Validate required fields
    if (!siteId || !siteName || !category || !date || !amount || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const expense = new Expenses({
      siteId,
      siteName,
      category,
      date,
      amount,
      paymentMethod,
      referenceNumber,
      description,
      notes
    });
    
    await expense.save();
    res.status(201).json(expense);
  } catch (err) {
    console.error('Error adding finance:', err);
    res.status(400).json({ error: err.message });
  }
};

// Update finance by id
exports.updateFinance = async (req, res) => {
  try {
    const updated = await Expenses.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Finance record not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating finance:', err);
    res.status(400).json({ error: err.message });
  }
};

// Delete finance by id
exports.deleteFinance = async (req, res) => {
  try {
    const deleted = await Expenses.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Finance record not found' });
    res.json({ message: 'Finance record deleted successfully' });
  } catch (err) {
    console.error('Error deleting finance:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all finances with optional site filter
exports.getFinances = async (req, res) => {
  try {
    const { siteId, siteName } = req.query;
    let query = {};
    
    if (siteId) {
      query.siteId = siteId;
    } else if (siteName) {
      query.siteName = siteName;
    }
    
    const expenses = await Expenses.find(query).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error('Error fetching finances:', err);
    res.status(500).json({ error: err.message });
  }
};

// Add new extra finance transaction
exports.addExtraFinance = async (req, res) => {
  try {
    const { siteId, date, name, transferred, received, percentage } = req.body;
    
    // Validate required fields
    if (!siteId || !date || !name || transferred === undefined || received === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate receivable and remaining amounts
    const percentageCut = percentage || 0;
    const receivableAmount = transferred - (transferred * percentageCut / 100);
    const remaining = receivableAmount - received;

    const extraFinance = new ExtraFinance({
      siteId,
      date,
      name,
      transferred,
      received,
      remaining,
      percentage: percentageCut,
      receivableAmount,
      paymentLogs: received > 0 ? [{
        amount: received,
        date: new Date(),
        paidBy: req.body.paidBy || 'Unknown',
        notes: req.body.notes || ''
      }] : []
    });
    
    await extraFinance.save();
    res.status(201).json(extraFinance);
  } catch (err) {
    console.error('Error adding extra finance:', err);
    res.status(400).json({ error: err.message });
  }
};

// Get all extra finance transactions with optional site filter
exports.getExtraFinances = async (req, res) => {
  try {
    const { siteId } = req.query;
    let query = {};
    
    if (siteId) {
      query.siteId = siteId;
    }
    
    const extraFinances = await ExtraFinance.find(query).sort({ date: -1 });
    res.json(extraFinances);
  } catch (err) {
    console.error('Error fetching extra finances:', err);
    res.status(500).json({ error: err.message });
  }
};

// Update extra finance transaction by id
exports.updateExtraFinance = async (req, res) => {
  try {
    const { transferred, received, percentage, paidBy, notes } = req.body;
    
    // If any of these fields are being updated, recalculate receivable and remaining
    if (transferred !== undefined || received !== undefined || percentage !== undefined) {
      const currentRecord = await ExtraFinance.findById(req.params.id);
      if (!currentRecord) return res.status(404).json({ error: 'Extra finance record not found' });
      
      const newTransferred = transferred !== undefined ? transferred : currentRecord.transferred;
      const newReceived = received !== undefined ? received : currentRecord.received;
      const newPercentage = percentage !== undefined ? percentage : currentRecord.percentage;
      
      // Calculate new receivable and remaining amounts
      const receivableAmount = newTransferred - (newTransferred * newPercentage / 100);
      const remaining = receivableAmount - newReceived;
      
      req.body.receivableAmount = receivableAmount;
      req.body.remaining = remaining;

      // If received amount increased, add to payment logs
      if (received !== undefined && received > currentRecord.received) {
        const paymentAmount = received - currentRecord.received;
        const paymentLog = {
          amount: paymentAmount,
          date: new Date(),
          paidBy: paidBy || 'Unknown',
          notes: notes || ''
        };
        
        req.body.paymentLogs = [...(currentRecord.paymentLogs || []), paymentLog];
      }
    }
    
    const updated = await ExtraFinance.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Extra finance record not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error updating extra finance:', err);
    res.status(400).json({ error: err.message });
  }
};

// Add payment log to existing transaction
exports.addPaymentLog = async (req, res) => {
  try {
    const { amount, paidBy, notes, date } = req.body;
    
    if (!amount || !paidBy) {
      return res.status(400).json({ error: 'Amount and paidBy are required' });
    }

    const currentRecord = await ExtraFinance.findById(req.params.id);
    if (!currentRecord) return res.status(404).json({ error: 'Extra finance record not found' });

    const paymentLog = {
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      paidBy,
      notes: notes || ''
    };

    const newReceived = currentRecord.received + Number(amount);
    const newRemaining = currentRecord.receivableAmount - newReceived;

    const updated = await ExtraFinance.findByIdAndUpdate(
      req.params.id,
      {
        received: newReceived,
        remaining: newRemaining,
        $push: { paymentLogs: paymentLog }
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error('Error adding payment log:', err);
    res.status(400).json({ error: err.message });
  }
};

// Delete extra finance transaction by id
exports.deleteExtraFinance = async (req, res) => {
  try {
    const deleted = await ExtraFinance.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Extra finance record not found' });
    res.json({ message: 'Extra finance record deleted successfully' });
  } catch (err) {
    console.error('Error deleting extra finance:', err);
    res.status(400).json({ error: err.message });
  }
}; 

// Get finance summary by site
exports.getFinanceSummary = async (req, res) => {
  try {
    const { siteId, siteName } = req.query;
    let query = {};
    
    if (siteId) {
      query.siteId = siteId;
    } else if (siteName) {
      query.siteName = siteName;
    }
    
    const expenses = await Expenses.find(query);
    
    // Calculate summary statistics
    const totalAmount = expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
    const totalRecords = expenses.length;
    const averageAmount = totalRecords > 0 ? totalAmount / totalRecords : 0;
    
    // Group by category
    const categorySummary = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, total: 0 };
      }
      acc[category].count += 1;
      acc[category].total += expense.amount || 0;
      return acc;
    }, {});
    
    // Get monthly breakdown
    const monthlyData = expenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toISOString().slice(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { count: 0, total: 0 };
      }
      acc[month].count += 1;
      acc[month].total += expense.amount || 0;
      return acc;
    }, {});
    
    res.json({
      totalAmount,
      totalRecords,
      averageAmount,
      categorySummary,
      monthlyData,
      siteFilter: siteId || siteName || 'all'
    });
  } catch (err) {
    console.error('Error fetching finance summary:', err);
    res.status(500).json({ error: err.message });
  }
}; 