const express = require('express');
const router = express.Router();
const {NewSite, GetData, GetSiteById, updateSiteAssignedUsers, getDashboardStats} = require("../controllers/dashboardController")



router.post('/', NewSite);
router.get('/', GetData);
router.get('/stats', getDashboardStats);
router.get('/:id', GetSiteById);
router.put('/:siteId/assigned-users', updateSiteAssignedUsers);
    


module.exports = router;
