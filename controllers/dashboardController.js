const newConstruction = require('../model/newConstruction');
const mongoose = require('mongoose');

exports.NewSite = async(req, res) => {
    try {
        // Create a new site with all the data from the request body
        const newSite = new newConstruction(req.body);
        
        // Save the site to the database
        const savedSite = await newSite.save();
        
        res.status(201).json(savedSite);
    } catch (err) {
        console.error('Error creating new site:', err);
        res.status(400).json({ message: err.message });
    }
};

exports.GetData = async(req, res) =>{
    try {
        const sites = await newConstruction.find({}, 'siteName siteCode address estimatedBudget teamSize assignedUsers startDate endDate'); 
        res.json(sites);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

exports.GetSiteById = async(req, res) => {
    try {
        // Validate if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid site ID format' });
        }
        
        const site = await newConstruction.findById(req.params.id);
        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }
        res.json(site);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Update site's assignedUsers
exports.updateSiteAssignedUsers = async (req, res) => {
    try {
        const { siteId } = req.params;
        const { employeeId, action } = req.body; // action: 'add' or 'remove'

        // Validate if the site ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(siteId)) {
            return res.status(400).json({ message: 'Invalid site ID format' });
        }

        // Validate if the employee ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(employeeId)) {
            return res.status(400).json({ message: 'Invalid employee ID format' });
        }

        const site = await newConstruction.findById(siteId);
        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }

        let updatedAssignedUsers = [...(site.assignedUsers || [])];

        if (action === 'add') {
            // Add employee to assignedUsers if not already present
            if (!updatedAssignedUsers.includes(employeeId)) {
                updatedAssignedUsers.push(employeeId);
            }
        } else if (action === 'remove') {
            // Remove employee from assignedUsers
            updatedAssignedUsers = updatedAssignedUsers.filter(id => id !== employeeId);
        } else {
            return res.status(400).json({ message: 'Invalid action. Use "add" or "remove"' });
        }

        // Update the site
        const updatedSite = await newConstruction.findByIdAndUpdate(
            siteId,
            { assignedUsers: updatedAssignedUsers },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: `Employee ${action === 'add' ? 'added to' : 'removed from'} site successfully`,
            site: updatedSite
        });

    } catch (err) {
        console.error('Error updating site assigned users:', err);
        res.status(500).json({ message: err.message });
    }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
    try {
        const sites = await newConstruction.find({});
        
        const stats = {
            totalSites: sites.length,
            activeProjects: sites.length, // You can add status field later to filter active projects
            totalBudget: sites.reduce((sum, site) => sum + (site.estimatedBudget || 0), 0),
            totalTeamMembers: sites.reduce((sum, site) => sum + (site.teamSize || 0), 0)
        };
        
        res.json(stats);
    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        res.status(500).json({ message: err.message });
    }
};