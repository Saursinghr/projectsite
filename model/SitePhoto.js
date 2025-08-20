const mongoose = require('mongoose');

const SitePhotoSchema = new mongoose.Schema({
  siteId: { type: String, required: true },
  siteName: { type: String, required: true },
  photoFile: { type: String, required: true }, // File path for uploaded photo
  name: { type: String, required: true }, // Photo name/title
  description: { type: String },
  uploadedBy: { type: String },
  uploadDate: { type: Date, default: Date.now },
  uploadTime: { type: String }, // Additional time field
  category: { type: String, default: 'General' }, // Foundation, Structural, Interior, etc.
  tags: [{ type: String }],
  additionalInfo: { type: String }, // Additional information field
  status: { type: String, enum: ['Active', 'Archived'], default: 'Active' }
}, { timestamps: true });

module.exports = mongoose.model('SitePhoto', SitePhotoSchema); 