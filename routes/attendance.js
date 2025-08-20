const express = require('express');
const router = express.Router();
const Attendance = require('../model/Attendance');

// GET all attendance records
router.get('/', async (req, res) => {
  try {
    const { siteId } = req.query;
    let query = {};
    
    if (siteId) {
      query.siteId = siteId;
    }
    
    const records = await Attendance.find(query).populate('employeeId');
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 