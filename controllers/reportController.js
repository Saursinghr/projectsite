const Attendance = require('../model/Attendance');
const labour = require('../model/labour');
const material = require('../model/material');
const SiteExpense = require('../model/SiteExpense');
const Milestone = require('../model/Milestone');
const newConstruction = require('../model/newConstruction');

const generateSiteReport = async (req, res) => {
  try {
    const { siteId, startDate, endDate } = req.query;
    
    if (!siteId) {
      return res.status(400).json({ message: 'Site ID is required' });
    }

    // Parse dates
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get site details
    const site = await newConstruction.findById(siteId);
    if (!site) {
      return res.status(404).json({ message: 'Site not found' });
    }

    // Fetch attendance data
    const attendanceData = await Attendance.find({
      siteId: siteId,
      date: { $gte: start, $lte: end }
    });

    // Calculate attendance metrics
    const totalWorkers = attendanceData.length > 0 ? 
      Math.max(...attendanceData.map(a => a.workers?.length || 0)) : 0;
    
    const today = new Date();
    const todayAttendance = attendanceData.find(a => 
      a.date.toDateString() === today.toDateString()
    );
    
    const presentToday = todayAttendance ? (todayAttendance.workers?.filter(w => w.status === 'present').length || 0) : 0;
    const absentToday = totalWorkers - presentToday;
    const attendanceRate = totalWorkers > 0 ? Math.round((presentToday / totalWorkers) * 100) : 0;

    // Generate weekly trend (last 7 days)
    const weeklyTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayAttendance = attendanceData.find(a => 
        a.date.toDateString() === date.toDateString()
      );
      const present = dayAttendance ? (dayAttendance.workers?.filter(w => w.status === 'present').length || 0) : 0;
      const absent = totalWorkers - present;
      weeklyTrend.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        present,
        absent
      });
    }

    // Fetch labor data
    const laborData = await labour.find({
      siteId: siteId,
      createdAt: { $gte: start, $lte: end }
    });

    const totalLabor = laborData.length;
    const masons = laborData.filter(l => l.role === 'mason').length;
    const helpers = laborData.filter(l => l.role === 'helper').length;
    const totalHours = laborData.reduce((sum, l) => sum + (l.hours || 0), 0);
    const laborCost = laborData.reduce((sum, l) => sum + (l.salary || 0), 0);

    // Fetch materials data
    const materialsData = await material.find({
      siteId: siteId,
      createdAt: { $gte: start, $lte: end }
    });

    const totalMaterials = materialsData.length;
    const totalQuantity = materialsData.reduce((sum, m) => sum + (m.quantity || 0), 0);
    const totalCost = materialsData.reduce((sum, m) => sum + (m.cost || 0), 0);

    // Material breakdown
    const materialBreakdown = materialsData.map(m => ({
      name: m.materialName || 'Unknown',
      quantity: m.quantity || 0,
      cost: m.cost || 0
    }));

    // Fetch expenses data
    const expensesData = await SiteExpense.find({
      siteId: siteId,
      date: { $gte: start, $lte: end }
    });

    const totalExpenses = expensesData.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalExpenseCount = expensesData.length;

    // Expense breakdown by category
    const expenseBreakdown = [];
    const categories = [...new Set(expensesData.map(e => e.category))];
    categories.forEach(category => {
      const categoryExpenses = expensesData.filter(e => e.category === category);
      const amount = categoryExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      expenseBreakdown.push({
        category: category || 'Other',
        amount,
        count: categoryExpenses.length
      });
    });

    // Monthly expenses (last 6 months)
    const monthlyExpenses = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i);
      monthStart.setDate(1);
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0);

      const monthExpenses = expensesData.filter(e => 
        e.date >= monthStart && e.date <= monthEnd
      );
      const amount = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      
      monthlyExpenses.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        amount
      });
    }

    // Fetch milestones/tasks data
    const milestonesData = await Milestone.find({
      projectId: siteId,
      createdAt: { $gte: start, $lte: end }
    });

    const totalTasks = milestonesData.length;
    const completedTasks = milestonesData.filter(m => m.status === 'Completed').length;
    const inProgressTasks = milestonesData.filter(m => m.status === 'In Progress').length;
    const pendingTasks = milestonesData.filter(m => m.status === 'Pending').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const taskBreakdown = [
      { status: 'Completed', count: completedTasks, color: '#10b981' },
      { status: 'In Progress', count: inProgressTasks, color: '#f59e0b' },
      { status: 'Pending', count: pendingTasks, color: '#ef4444' }
    ];

    const reportData = {
      siteId,
      siteName: site.siteName,
      attendance: {
        totalWorkers,
        presentToday,
        absentToday,
        attendanceRate,
        weeklyTrend
      },
      labor: {
        totalLabor,
        masons,
        helpers,
        totalHours,
        laborCost
      },
      materials: {
        totalMaterials,
        totalQuantity,
        totalCost,
        materialBreakdown
      },
      expenses: {
        totalExpenses,
        totalExpenseCount,
        expenseBreakdown,
        monthlyExpenses
      },
      tasks: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        completionRate,
        taskBreakdown
      }
    };

    res.json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

module.exports = {
  generateSiteReport
};
