const Labour = require('../model/labour');

// Add new labour entry
exports.addLabour = async (req, res) => {
    try {
        const { name, mason, helper, supply, date, projectId } = req.body;

        if (!name || mason === undefined || helper === undefined || supply === undefined || !date || !projectId) {
            return res.status(400).json({ 
                message: 'Name, mason, helper, supply, date, and project ID are required' 
            });
        }

        const labour = new Labour({
            name,
            mason,
            helper,
            supply,
            date,
            projectId
        });

        const savedLabour = await labour.save();
        
        res.status(201).json({
            message: 'Labour entry added successfully',
            labour: savedLabour
        });

    } catch (error) {
        console.error('Error adding labour:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all labour entries with optional filters
exports.getLabour = async (req, res) => {
    try {
        const { projectId, startDate, endDate } = req.query;
        let filter = {};

        if (projectId) {
            filter.projectId = projectId;
        }

        // Date range filter (if needed in future)
        if (startDate || endDate) {
            // Can be implemented later if date filtering is needed
        }

        const labour = await Labour.find(filter).sort({ createdAt: -1 });
        
        res.status(200).json({
            message: 'Labour entries retrieved successfully',
            count: labour.length,
            labour
        });

    } catch (error) {
        console.error('Error fetching labour:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get labour entry by ID
exports.getLabourById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const labour = await Labour.findById(id);
        
        if (!labour) {
            return res.status(404).json({ message: 'Labour entry not found' });
        }

        res.status(200).json({
            message: 'Labour entry retrieved successfully',
            labour
        });

    } catch (error) {
        console.error('Error fetching labour:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update labour entry
exports.updateLabour = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const labour = await Labour.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!labour) {
            return res.status(404).json({ message: 'Labour entry not found' });
        }

        res.status(200).json({
            message: 'Labour entry updated successfully',
            labour
        });

    } catch (error) {
        console.error('Error updating labour:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete labour entry
exports.deleteLabour = async (req, res) => {
    try {
        const { id } = req.params;
        
        const labour = await Labour.findByIdAndDelete(id);
        
        if (!labour) {
            return res.status(404).json({ message: 'Labour entry not found' });
        }

        res.status(200).json({
            message: 'Labour entry deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting labour:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get labour statistics for a project
exports.getLabourStats = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        if (!projectId) {
            return res.status(400).json({ message: 'Project ID is required' });
        }

        const labour = await Labour.find({ projectId });
        
        // Calculate statistics
        const totalCost = labour.reduce((sum, entry) => sum + entry.totalCost, 0);
        const totalHours = labour.reduce((sum, entry) => sum + (entry.hoursWorked * entry.workersCount), 0);
        
        // Group by category
        const categoryStats = labour.reduce((acc, entry) => {
            if (!acc[entry.category]) {
                acc[entry.category] = {
                    count: 0,
                    totalCost: 0,
                    totalHours: 0,
                    totalWorkers: 0
                };
            }
            acc[entry.category].count++;
            acc[entry.category].totalCost += entry.totalCost;
            acc[entry.category].totalHours += entry.hoursWorked * entry.workersCount;
            acc[entry.category].totalWorkers += entry.workersCount;
            return acc;
        }, {});

        // Group by status
        const statusStats = labour.reduce((acc, entry) => {
            if (!acc[entry.status]) {
                acc[entry.status] = 0;
            }
            acc[entry.status]++;
            return acc;
        }, {});

        res.status(200).json({
            message: 'Labour statistics retrieved successfully',
            projectId,
            summary: {
                totalEntries: labour.length,
                totalCost,
                totalHours,
                averageCostPerHour: totalHours > 0 ? totalCost / totalHours : 0
            },
            categoryStats,
            statusStats
        });

    } catch (error) {
        console.error('Error fetching labour statistics:', error);
        res.status(500).json({ message: 'Server error' });
    }
};