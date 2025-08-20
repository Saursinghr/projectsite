const express = require('express');
const router = express.Router();
const {
    addEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats,
    toggleEmployeeStatus,
    getPositions,
    assignEmployeeToSite
} = require('../controllers/employeeController');

// GET /employee - Get all employees (with optional filters, search, pagination)
router.get('/', getEmployees);

// GET /employee/stats - Get employee statistics
router.get('/stats', getEmployeeStats);

// GET /employee/positions - Get all unique positions
router.get('/positions', getPositions);

// GET /employee/:id - Get employee by ID
router.get('/:id', getEmployeeById);

// POST /employee - Add new employee
router.post('/', addEmployee);

// POST /employee/add - Alternative endpoint for adding employee (for frontend compatibility)
router.post('/add', addEmployee);

// PUT /employee/:id - Update employee
router.put('/:id', updateEmployee);

// PUT /employee/update/:id - Alternative endpoint for updating employee (for frontend compatibility)
router.put('/update/:id', updateEmployee);

// PUT /employee/:id/toggle-status - Toggle employee status (Active/Inactive)
router.put('/:id/toggle-status', toggleEmployeeStatus);

// PUT /employee/:id/assign-site - Assign employee to a specific site
router.put('/:id/assign-site', assignEmployeeToSite);

// DELETE /employee/:id - Delete employee
router.delete('/:id', deleteEmployee);

module.exports = router; 