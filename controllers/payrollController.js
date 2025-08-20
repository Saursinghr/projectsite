const Payroll = require('../model/Payroll');
const Employee = require('../model/Employee');

// Get all payrolls
const getAllPayrolls = async (req, res) => {
  try {
    const payrolls = await Payroll.find().populate('employeeId');
    res.status(200).json({
      success: true,
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payrolls',
      error: error.message
    });
  }
};

// Get payroll by employee ID
const getPayrollByEmployee = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const payroll = await Payroll.findOne({ employeeId }).populate('employeeId');
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found for this employee'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payroll',
      error: error.message
    });
  }
};

// Create or update payroll for employee
const createOrUpdatePayroll = async (req, res) => {
  try {
    const { employeeId, monthlySalary, totalAdvance } = req.body;
    
    // Find employee
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }
    
    // Check if payroll exists
    let payroll = await Payroll.findOne({ employeeId });
    
    if (payroll) {
      // Update existing payroll
      payroll.monthlySalary = monthlySalary;
      payroll.totalAdvance = totalAdvance;
      payroll.employeeName = employee.name;
    } else {
      // Create new payroll
      payroll = new Payroll({
        employeeId,
        employeeName: employee.name,
        monthlySalary,
        totalAdvance,
        payments: []
      });
    }
    
    await payroll.save();
    
    res.status(200).json({
      success: true,
      data: payroll,
      message: payroll.isNew ? 'Payroll created successfully' : 'Payroll updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating/updating payroll',
      error: error.message
    });
  }
};

// Add payment to payroll
const addPayment = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { amount, type, notes, date } = req.body;
    
    const payroll = await Payroll.findOne({ employeeId });
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found for this employee'
      });
    }
    
    // Add new payment
    const newPayment = {
      date: date || new Date(),
      amount,
      type,
      notes: notes || ''
    };
    
    payroll.payments.push(newPayment);
    
    // Update total advance if it's an advance payment
    if (type === 'advance') {
      payroll.totalAdvance += amount;
    }
    
    // Update monthly salary if it's a salary payment
    if (type === 'salary') {
      payroll.monthlySalary = amount; // Update to the new salary amount
    }
    
    await payroll.save();
    
    res.status(200).json({
      success: true,
      data: payroll,
      message: 'Payment added successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error adding payment',
      error: error.message
    });
  }
};

// Get payment history for employee
const getPaymentHistory = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const payroll = await Payroll.findOne({ employeeId });
    
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found for this employee'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payroll.payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching payment history',
      error: error.message
    });
  }
};

// Delete payment
const deletePayment = async (req, res) => {
  try {
    const { employeeId, paymentId } = req.params;
    
    const payroll = await Payroll.findOne({ employeeId });
    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll not found for this employee'
      });
    }
    
    const payment = payroll.payments.id(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Update total advance if it's an advance payment
    if (payment.type === 'advance') {
      payroll.totalAdvance -= payment.amount;
    }
    
    payment.remove();
    await payroll.save();
    
    res.status(200).json({
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting payment',
      error: error.message
    });
  }
};

module.exports = {
  getAllPayrolls,
  getPayrollByEmployee,
  createOrUpdatePayroll,
  addPayment,
  getPaymentHistory,
  deletePayment
}; 