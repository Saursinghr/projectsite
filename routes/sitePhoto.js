const express = require('express');
const router = express.Router();
const sitePhotoController = require('../controllers/sitePhoto');

// Upload new site photo
router.post('/', sitePhotoController.uploadSitePhoto);

// Get all photos for a specific site
router.get('/site/:siteId', sitePhotoController.getSitePhotos);

// Get all site photos
router.get('/', sitePhotoController.getAllSitePhotos);

// Update site photo by id
router.put('/:id', sitePhotoController.updateSitePhoto);

// Delete site photo by id
router.delete('/:id', sitePhotoController.deleteSitePhoto);

// Get photo statistics for a site
router.get('/site/:siteId/stats', sitePhotoController.getSitePhotoStats);

module.exports = router; 