const Milestone = require('../model/Milestone');

// Add a new milestone
exports.addMilestone = async (req, res) => {
    try {
        const { name, status, estimatedCompletion, description, projectId, assignedTo, priority } = req.body;

        if (!name || !estimatedCompletion || !projectId) {
            return res.status(400).json({ 
                message: 'Name, estimated completion date, and project ID are required' 
            });
        }

        const milestone = new Milestone({
            name,
            status: status || 'Pending',
            estimatedCompletion,
            description,
            projectId,
            assignedTo,
            priority: priority || 'Medium'
        });

        const savedMilestone = await milestone.save();
        
        res.status(201).json({
            message: 'Milestone created successfully',
            milestone: savedMilestone
        });

    } catch (error) {
        console.error('Error creating milestone:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all milestones or filter by projectId
exports.getMilestones = async (req, res) => {
    try {
        const { projectId, status } = req.query;
        let filter = {};

        if (projectId) {
            filter.projectId = projectId;
        }

        if (status) {
            filter.status = status;
        }

        const milestones = await Milestone.find(filter).sort({ estimatedCompletion: 1 });
        
        res.status(200).json({
            message: 'Milestones retrieved successfully',
            count: milestones.length,
            milestones
        });

    } catch (error) {
        console.error('Error fetching milestones:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single milestone by ID
exports.getMilestoneById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const milestone = await Milestone.findById(id);
        
        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        res.status(200).json({
            message: 'Milestone retrieved successfully',
            milestone
        });

    } catch (error) {
        console.error('Error fetching milestone:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update milestone
exports.updateMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // If status is being changed to 'Completed', set actualCompletion to current date
        if (updateData.status === 'Completed' && !updateData.actualCompletion) {
            updateData.actualCompletion = new Date();
            updateData.progress = 100;
        }

        const milestone = await Milestone.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        res.status(200).json({
            message: 'Milestone updated successfully',
            milestone
        });

    } catch (error) {
        console.error('Error updating milestone:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete milestone
exports.deleteMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        
        const milestone = await Milestone.findByIdAndDelete(id);
        
        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        res.status(200).json({
            message: 'Milestone deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting milestone:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update milestone progress
exports.updateMilestoneProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress } = req.body;

        if (progress < 0 || progress > 100) {
            return res.status(400).json({ message: 'Progress must be between 0 and 100' });
        }

        const updateData = { progress };

        // If progress is 100%, mark as completed
        if (progress === 100) {
            updateData.status = 'Completed';
            updateData.actualCompletion = new Date();
        }

        const milestone = await Milestone.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!milestone) {
            return res.status(404).json({ message: 'Milestone not found' });
        }

        res.status(200).json({
            message: 'Milestone progress updated successfully',
            milestone
        });

    } catch (error) {
        console.error('Error updating milestone progress:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
