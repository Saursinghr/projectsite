const SitePhoto = require('../model/SitePhoto');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for photo uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/photos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'photo-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Upload new site photo
exports.uploadSitePhoto = async (req, res) => {
  try {
    upload.single('photo')(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No photo file uploaded' });
      }

             const photoData = {
         siteId: req.body.siteId,
         siteName: req.body.siteName,
         photoFile: req.file.path,
         name: req.body.name || 'Untitled Photo',
         description: req.body.description || '',
         uploadedBy: req.body.uploadedBy || 'Unknown',
         uploadTime: req.body.uploadTime || new Date().toLocaleTimeString(),
         category: 'General',
         additionalInfo: '',
         tags: []
       };

      const photo = new SitePhoto(photoData);
      await photo.save();
      res.status(201).json(photo);
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all photos for a specific site
exports.getSitePhotos = async (req, res) => {
  try {
    const { siteId } = req.params;
    const photos = await SitePhoto.find({ siteId }).sort({ uploadDate: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all site photos
exports.getAllSitePhotos = async (req, res) => {
  try {
    const photos = await SitePhoto.find().sort({ uploadDate: -1 });
    res.json(photos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update site photo by id
exports.updateSitePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await SitePhoto.findByIdAndUpdate(id, req.body, { new: true });
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }
    res.json(photo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete site photo by id
exports.deleteSitePhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await SitePhoto.findById(id);
    
    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Delete the physical file
    if (photo.photoFile && fs.existsSync(photo.photoFile)) {
      fs.unlinkSync(photo.photoFile);
    }

    await SitePhoto.findByIdAndDelete(id);
    res.json({ message: 'Photo deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get photo statistics for a site
exports.getSitePhotoStats = async (req, res) => {
  try {
    const { siteId } = req.params;
    const photos = await SitePhoto.find({ siteId });
    
    const stats = {
      totalPhotos: photos.length,
      thisMonth: photos.filter(photo => {
        const photoDate = new Date(photo.uploadDate);
        const now = new Date();
        return photoDate.getMonth() === now.getMonth() && 
               photoDate.getFullYear() === now.getFullYear();
      }).length,
      categories: {},
      totalSize: 0
    };

    // Calculate category distribution
    photos.forEach(photo => {
      stats.categories[photo.category] = (stats.categories[photo.category] || 0) + 1;
    });

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 