const mongoose = require('mongoose');

// Define schema
const attendanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newConstruction',
    required: true
  },
  date: {
    type: Date,
    default: function() { // Use a function to get consistent date
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Date without time
    }
  },
  clockIn: {
    time: {
      type: Date,
      default : Date.now
    },
    location: {
      type: String // Simple string for location (can be enhanced later)
    }
  },
  clockOut: {
    time: Date, // Not required (employee might forget to clock out)
    location: String
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day'],
    default: 'present'
  },
  notes: String // Optional notes for the day
}, {
  timestamps: true, // Automatically adds createdAt and updatedAt
  collection: 'Attendance' 
});


// Create model
const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;