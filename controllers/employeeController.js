const Employee = require('../model/Employee');

// Add new employee
exports.addEmployee = async (req, res) => {
    try {
        const { 
            name, 
            email, 
            position, 
            phone, 
            amount, 
            companyCode, 
            additionalAmount, 
            status,
            assignedSite,
            emergencyContact,
            address
        } = req.body;

        // Check required fields
        if (!name || !email || !position || !phone) {
            return res.status(400).json({ 
                message: 'Name, email, position, and phone are required fields' 
            });
        }

        // Check if employee with this email already exists
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) {
            return res.status(400).json({ 
                message: 'Employee with this email already exists' 
            });
        }

        const employeeStatus = status || 'Active';
        const employee = new Employee({
            name,
            email,
            position,
            phone,
            amount: amount || 0,
            companyCode: companyCode || '',
            additionalAmount: additionalAmount || 0,
            status: employeeStatus,
            assignedSite: assignedSite || '',
            emergencyContact,
            address,
            // Set isAdminVerified based on status
            isAdminVerified: employeeStatus === 'Active',
            // Set default password if not provided (for employees added through admin panel)
            password: req.body.password || 'defaultPassword123',
            confirmPassword: req.body.confirmPassword || 'defaultPassword123'
        });

        const savedEmployee = await employee.save();
        
        res.status(201).json({
            message: 'Employee added successfully',
            employee: savedEmployee
        });

    } catch (error) {
        console.error('Error adding employee:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }
        res.status(500).json({ message: 'Server error while adding employee' });
    }
};

// Get all employees with optional filters
exports.getEmployees = async (req, res) => {
    try {
        const { 
            status, 
            position, 
            assignedSite,
            search,
            page = 1,
            limit = 100
        } = req.query;

        let filter = {};

        // Add filters
        if (status) {
            filter.status = status;
        }
        if (position) {
            filter.position = position;
        }
        if (assignedSite) {
            filter.assignedSite = assignedSite;
        }

        // Add search functionality
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { position: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        // Calculate pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const employees = await Employee.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const totalEmployees = await Employee.countDocuments(filter);
        const totalPages = Math.ceil(totalEmployees / parseInt(limit));
        
        res.status(200).json({
            message: 'Employees retrieved successfully',
            employees,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalEmployees,
                hasNextPage: parseInt(page) < totalPages,
                hasPrevPage: parseInt(page) > 1
            }
        });

    } catch (error) {
        console.error('Error fetching employees:', error);
        res.status(500).json({ message: 'Server error while fetching employees' });
    }
};

// Get employee by ID
exports.getEmployeeById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Clean the ID by removing whitespace and newlines
        const cleanId = id.trim();
        
        // Validate ObjectId format
        if (!cleanId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                message: 'Invalid employee ID format' 
            });
        }
        
        const employee = await Employee.findById(cleanId);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            message: 'Employee retrieved successfully',
            employee
        });

    } catch (error) {
        console.error('Error fetching employee:', error);
        res.status(500).json({ message: 'Server error while fetching employee' });
    }
};

// Update employee
exports.updateEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Clean the ID by removing whitespace and newlines
        const cleanId = id.trim();
        
        // Validate ObjectId format
        if (!cleanId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                message: 'Invalid employee ID format' 
            });
        }

        // If email is being updated, check for duplicates
        if (updateData.email) {
            const existingEmployee = await Employee.findOne({ 
                email: updateData.email, 
                _id: { $ne: cleanId } 
            });
            if (existingEmployee) {
                return res.status(400).json({ 
                    message: 'Another employee with this email already exists' 
                });
            }
        }

        // If status is being updated, also update isAdminVerified
        if (updateData.status) {
            updateData.isAdminVerified = updateData.status === 'Active';
        }

        const employee = await Employee.findByIdAndUpdate(
            cleanId,
            updateData,
            { new: true, runValidators: true }
        );

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            message: 'Employee updated successfully',
            employee
        });

    } catch (error) {
        console.error('Error updating employee:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Employee with this email already exists' });
        }
        res.status(500).json({ message: 'Server error while updating employee' });
    }
};

// Delete employee
exports.deleteEmployee = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Clean the ID by removing whitespace and newlines
        const cleanId = id.trim();
        
        // Validate ObjectId format
        if (!cleanId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                message: 'Invalid employee ID format' 
            });
        }
        
        const employee = await Employee.findByIdAndDelete(cleanId);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json({
            message: 'Employee deleted successfully',
            deletedEmployee: {
                id: employee._id,
                name: employee.name,
                email: employee.email
            }
        });

    } catch (error) {
        console.error('Error deleting employee:', error);
        res.status(500).json({ message: 'Server error while deleting employee' });
    }
};

// Get employee statistics
exports.getEmployeeStats = async (req, res) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ status: 'Active' });
        const inactiveEmployees = await Employee.countDocuments({ status: 'Inactive' });

        // Group by position
        const positionStats = await Employee.aggregate([
            {
                $group: {
                    _id: '$position',
                    count: { $sum: 1 },
                    totalAmount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Group by assigned site
        const siteStats = await Employee.aggregate([
            {
                $group: {
                    _id: '$assignedSite',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Calculate total salary expenses
        const salaryStats = await Employee.aggregate([
            {
                $group: {
                    _id: null,
                    totalBaseSalary: { $sum: '$amount' },
                    totalAdditionalAmount: { $sum: '$additionalAmount' },
                    averageBaseSalary: { $avg: '$amount' }
                }
            }
        ]);

        res.status(200).json({
            message: 'Employee statistics retrieved successfully',
            stats: {
                total: totalEmployees,
                active: activeEmployees,
                inactive: inactiveEmployees,
                positionDistribution: positionStats,
                siteDistribution: siteStats,
                salaryInfo: salaryStats[0] || {
                    totalBaseSalary: 0,
                    totalAdditionalAmount: 0,
                    averageBaseSalary: 0
                }
            }
        });

    } catch (error) {
        console.error('Error fetching employee statistics:', error);
        res.status(500).json({ message: 'Server error while fetching statistics' });
    }
};

// Toggle employee status (Active/Inactive)
exports.toggleEmployeeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Clean the ID by removing whitespace and newlines
        const cleanId = id.trim();
        
        // Validate ObjectId format
        if (!cleanId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                message: 'Invalid employee ID format' 
            });
        }
        
        const employee = await Employee.findById(cleanId);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        employee.status = employee.status === 'Active' ? 'Inactive' : 'Active';
        // Update isAdminVerified based on new status
        employee.isAdminVerified = employee.status === 'Active';
        await employee.save();

        res.status(200).json({
            message: `Employee status changed to ${employee.status}`,
            employee
        });

    } catch (error) {
        console.error('Error toggling employee status:', error);
        res.status(500).json({ message: 'Server error while updating status' });
    }
};

// Get all unique positions
exports.getPositions = async (req, res) => {
    try {
        const positions = await Employee.distinct('position');
        
        res.status(200).json({
            message: 'Positions retrieved successfully',
            positions: positions.filter(position => position && position.trim())
        });

    } catch (error) {
        console.error('Error fetching positions:', error);
        res.status(500).json({ message: 'Server error while fetching positions' });
    }
}; 

// Assign employee to multiple sites
exports.assignEmployeeToSite = async (req, res) => {
    try {
        const { id } = req.params;
        const { assignedSites, action = 'add' } = req.body; // action can be 'add', 'remove', or 'replace'

        // Clean the ID by removing whitespace and newlines
        const cleanId = id.trim();
        
        // Validate ObjectId format
        if (!cleanId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ 
                message: 'Invalid employee ID format' 
            });
        }

        if (!assignedSites || !Array.isArray(assignedSites)) {
            return res.status(400).json({ 
                message: 'Assigned sites array is required' 
            });
        }

        const employee = await Employee.findById(cleanId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        let updatedSites = [...(employee.assignedSite || [])];

        if (action === 'add') {
            // Add new sites without duplicates
            assignedSites.forEach(site => {
                if (!updatedSites.includes(site)) {
                    updatedSites.push(site);
                }
            });
        } else if (action === 'remove') {
            // Remove specified sites
            updatedSites = updatedSites.filter(site => !assignedSites.includes(site));
        } else if (action === 'replace') {
            // Replace all sites with new ones
            updatedSites = assignedSites;
        }

        const updatedEmployee = await Employee.findByIdAndUpdate(
            cleanId,
            { assignedSite: updatedSites },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: `Employee sites ${action === 'add' ? 'added' : action === 'remove' ? 'removed' : 'updated'} successfully`,
            employee: updatedEmployee
        });

    } catch (error) {
        console.error('Error assigning employee to sites:', error);
        res.status(500).json({ message: 'Server error while assigning employee to sites' });
    }
}; 