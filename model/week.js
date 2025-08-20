const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  user: { type: String, required: true },
  task: { type: String, required: true },
  status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

const WeekSchema = new mongoose.Schema({
  name: { type: String, required: true },
  tasks: [TaskSchema],
  siteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'newConstruction',
    required: true
  }
}, { collection: 'Week' });

module.exports = mongoose.model('Week', WeekSchema); 